import type { User } from '@supabase/supabase-js';

import { supabase } from '@/integrations/supabase/client';

export interface SignupVerificationPayload {
  name: string;
  email: string;
  password: string;
  telephoneNumber: string;
  redirectTo: string;
}

interface VerifySignupOtpPayload {
  email: string;
  otp: string;
  name: string;
  telephoneNumber: string;
}

const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

const normalizeText = (value: string) => value.trim();
const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const validatePhoneNumber = (phone: string) =>
  PHONE_REGEX.test(normalizeText(phone));

export const buildRedirectUrl = (path: string) =>
  `${window.location.origin}${path}`;

async function upsertProfile({
  userId,
  email,
  name,
  telephoneNumber,
}: {
  userId: string;
  email: string;
  name: string;
  telephoneNumber: string;
}) {
  if (!userId || !email || !name || !telephoneNumber) {
    return;
  }

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      email,
      name,
      full_name: name,
      telephone_number: telephoneNumber,
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    throw error;
  }
}

export async function ensureProfileFromUser(user: User | null) {
  if (!user?.id || !user.email) {
    return;
  }

  const name = normalizeText(
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : ''
  );

  const telephoneNumber = normalizeText(
    typeof user.user_metadata?.telephone_number === 'string'
      ? user.user_metadata.telephone_number
      : ''
  );

  if (!name || !telephoneNumber) {
    return;
  }

  await upsertProfile({
    userId: user.id,
    email: user.email,
    name,
    telephoneNumber,
  });
}

export async function sendSignupVerification({
  name,
  email,
  password,
  telephoneNumber,
  redirectTo,
}: SignupVerificationPayload) {
  const { data, error } = await supabase.functions.invoke('otp-handler', {
    body: {
      action: 'send',
      name: normalizeText(name),
      email: normalizeEmail(email),
      password,
      telephoneNumber: normalizeText(telephoneNumber),
      redirectTo,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to send verification email.');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function verifySignupOtp({
  email,
  otp,
  name,
  telephoneNumber,
}: VerifySignupOtpPayload) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizeEmail(email),
    token: normalizeText(otp),
    type: 'signup',
  });

  if (error) {
    throw error;
  }

  const verifiedUser = data.user ?? (await supabase.auth.getUser()).data.user;

  if (!verifiedUser?.id || !verifiedUser.email) {
    throw new Error('Email verified, but no signed-in user session was created.');
  }

  const resolvedName = normalizeText(
    typeof verifiedUser.user_metadata?.full_name === 'string'
      ? verifiedUser.user_metadata.full_name
      : typeof verifiedUser.user_metadata?.name === 'string'
        ? verifiedUser.user_metadata.name
        : name
  );

  const resolvedTelephoneNumber = normalizeText(
    typeof verifiedUser.user_metadata?.telephone_number === 'string'
      ? verifiedUser.user_metadata.telephone_number
      : telephoneNumber
  );

  await upsertProfile({
    userId: verifiedUser.id,
    email: verifiedUser.email,
    name: resolvedName,
    telephoneNumber: resolvedTelephoneNumber,
  });

  return verifiedUser;
}