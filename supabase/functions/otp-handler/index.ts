import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RequestSchema = z.object({
  action: z.literal("send"),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6).max(72),
  telephoneNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid international phone number."),
  redirectTo: z.string().trim().url(),
});

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function buildEmailHtml({
  name,
  otp,
  actionLink,
}: {
  name: string;
  otp: string;
  actionLink: string;
}) {
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otp);
  const safeActionLink = escapeHtml(actionLink);

  return `
    <div style="background:#f7f8fc;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 20px 45px rgba(15,23,42,0.08);">
        <p style="margin:0 0 12px;font-size:14px;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;font-weight:700;">CarsRus Rental</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Verify your email</h1>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Hi ${safeName}, use this 6-digit code to finish creating your account:</p>
        <div style="margin:0 0 24px;padding:18px 22px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;text-align:center;">
          <span style="font-size:32px;letter-spacing:0.35em;font-weight:800;color:#1d4ed8;display:inline-block;padding-left:0.35em;">${safeOtp}</span>
        </div>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#475569;">Prefer one tap? You can also verify instantly with the secure button below.</p>
        <a href="${safeActionLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:700;">Verify with Magic Link</a>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">If you did not request this account, you can safely ignore this email.</p>
      </div>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!supabaseUrl) {
    return json({ error: "SUPABASE_URL is not configured." }, 500);
  }

  if (!serviceRoleKey) {
    return json({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured." }, 500);
  }

  if (!resendApiKey) {
    return json({ error: "RESEND_API_KEY is not configured." }, 500);
  }

  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const parsed = RequestSchema.safeParse(payload);

  if (!parsed.success) {
    return json(
      { error: parsed.error.flatten().fieldErrors },
      400,
    );
  }

  const { email, password, name, telephoneNumber, redirectTo } = parsed.data;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo,
      data: {
        name,
        full_name: name,
        telephone_number: telephoneNumber,
      },
    },
  });

  if (error || !data?.properties?.email_otp || !data.properties.action_link) {
    const message = error?.message || "Failed to create verification details.";
    const status = message.toLowerCase().includes("registered") ? 409 : 400;
    return json({ error: message }, status);
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CarsRus Rental <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your CarsRus Rental email",
      html: buildEmailHtml({
        name,
        otp: data.properties.email_otp,
        actionLink: data.properties.action_link,
      }),
      text:
        `Hi ${name}, use this OTP to verify your CarsRus Rental account: ${data.properties.email_otp}. ` +
        `You can also verify with this link: ${data.properties.action_link}`,
    }),
  });

  const resendData = await resendResponse.json();

  if (!resendResponse.ok) {
    const resendMessage = typeof resendData?.message === "string"
      ? resendData.message
      : JSON.stringify(resendData);

    return json(
      {
        error:
          `Resend could not deliver the verification email. ${resendMessage} ` +
          "If you are using Resend test mode, send only to the verified inbox on your Resend account.",
      },
      502,
    );
  }

  return json({
    success: true,
    message: "Verification email sent successfully.",
  });
});