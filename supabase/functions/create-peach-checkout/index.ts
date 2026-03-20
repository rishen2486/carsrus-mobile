import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PEACH_ENTITY_ID = Deno.env.get("PEACH_ENTITY_ID")!;
const PEACH_SECRET = Deno.env.get("PEACH_SECRET")!;
const PEACH_API = "https://testsecure.peachpayments.com";

/**
 * Generate HMAC SHA256 signature for Peach Payments
 */
async function generateSignature(
  params: Record<string, string>,
  secret: string
): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const message = sortedKeys.map((k) => `${k}${params[k]}`).join("");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, bookingId, shopperResultUrl } = await req.json();

    console.log("Creating Peach v2 checkout:", { amount, currency, bookingId });

    const nonce = crypto.randomUUID();

    const params: Record<string, string> = {
      "authentication.entityId": PEACH_ENTITY_ID,
      amount: Number(amount).toFixed(2),
      currency: currency || "MUR",
      defaultPaymentMethod: "CARD",
      merchantTransactionId: bookingId,
      nonce,
      notificationUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/peach-webhook`,
      paymentType: "DB",
      shopperResultUrl: shopperResultUrl || "",
    };

    const signature = await generateSignature(params, PEACH_SECRET);

    const response = await fetch(`${PEACH_API}/v2/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params,
        signature,
      }),
    });

    const data = await response.json();

    console.log("Peach v2 checkout response:", JSON.stringify(data));

    if (!response.ok) {
      throw new Error(data?.message || `Peach API error: ${response.status}`);
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
