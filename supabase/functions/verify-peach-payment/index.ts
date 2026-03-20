import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PEACH_CLIENT_ID = Deno.env.get("PEACH_CLIENT_ID")!;
const PEACH_CLIENT_SECRET = Deno.env.get("PEACH_CLIENT_SECRET")!;
const PEACH_ENTITY_ID = Deno.env.get("PEACH_ENTITY_ID")!;

const AUTH_URL = "https://sandbox-dashboard.peachpayments.com/api/oauth/token";
const STATUS_URL = "https://testsecure.peachpayments.com/v2/checkout";

/**
 * Get OAuth bearer token
 */
async function getAccessToken(): Promise<string> {
  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: PEACH_CLIENT_ID,
      clientSecret: PEACH_CLIENT_SECRET,
      merchantId: PEACH_ENTITY_ID,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error("Failed to get access token");
  }
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkoutId, bookingId } = await req.json();

    if (!checkoutId) {
      throw new Error("checkoutId is required");
    }

    console.log("Verifying payment:", { checkoutId, bookingId });

    // Get bearer token
    const accessToken = await getAccessToken();

    // Query Peach v2 checkout status
    const response = await fetch(`${STATUS_URL}/${checkoutId}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    console.log("Payment status response:", JSON.stringify(data));

    if (!response.ok) {
      throw new Error(
        data?.message || `Status check failed: ${response.status}`
      );
    }

    const resultCode = data.result?.code;
    const success =
      resultCode &&
      (resultCode.startsWith("000.000") ||
        resultCode.startsWith("000.100") ||
        resultCode.startsWith("000.200"));

    // Update booking if paid
    if (success && bookingId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);

      console.log(`Booking ${bookingId} verified and marked as paid`);
    }

    return new Response(
      JSON.stringify({
        success,
        status: data.status,
        resultCode,
        resultDescription: data.result?.description,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
