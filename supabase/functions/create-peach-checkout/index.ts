import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PEACH_CLIENT_ID = Deno.env.get("PEACH_CLIENT_ID")!;
const PEACH_CLIENT_SECRET = Deno.env.get("PEACH_CLIENT_SECRET")!;
const PEACH_ENTITY_ID = Deno.env.get("PEACH_ENTITY_ID")!;

// Sandbox URLs
const AUTH_URL = "https://sandbox-dashboard.peachpayments.com/api/oauth/token";
const CHECKOUT_URL = "https://testsecure.peachpayments.com/v2/checkout";

/**
 * Step 1: Get OAuth bearer token from Peach
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
  console.log("Auth response status:", response.status);

  if (!response.ok || !data.access_token) {
    console.error("Auth error:", JSON.stringify(data));
    throw new Error(data.message || "Failed to get access token");
  }

  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, bookingId, shopperResultUrl } = await req.json();

    console.log("Creating Peach v2 embedded checkout:", {
      amount,
      currency,
      bookingId,
    });

    // Step 1: Get bearer token
    const accessToken = await getAccessToken();

    // Step 2: Create checkout
    const origin = req.headers.get("origin") || "*";

    const params = new URLSearchParams();

params.append("authentication.entityId", PEACH_ENTITY_ID);
params.append("amount", Number(amount).toFixed(2));
params.append("currency", currency || "MUR");
params.append("paymentType", "DB");
params.append("merchantTransactionId", bookingId);
params.append("nonce", crypto.randomUUID());

if (shopperResultUrl) {
  params.append("shopperResultUrl", shopperResultUrl);
}

params.append(
  "notificationUrl",
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/peach-webhook`
);

const response = await fetch(CHECKOUT_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Bearer ${accessToken}`,
  },
  body: params,
});

    const data = await response.json();
    console.log("Checkout response:", JSON.stringify(data));

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || `Peach API error: ${response.status}`
      );
    }

    return new Response(
      JSON.stringify({
        checkoutId: data.checkoutId || data.id,
        entityId: PEACH_ENTITY_ID,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Peach checkout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
