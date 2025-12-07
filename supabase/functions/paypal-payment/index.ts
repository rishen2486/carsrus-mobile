import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')!;
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')!;
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, amount, bookingId, orderId } = await req.json();

    console.log(`PayPal payment action: ${action}`, { amount, bookingId, orderId });

    if (action === 'get-client-token') {
      const accessToken = await generateAccessToken();
      const response = await fetch(`${PAYPAL_API}/v1/identity/generate-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept-Language": "en_US",
        },
      });

      const tokenData = await response.json();
      console.log("PayPal client token generated");

      return new Response(JSON.stringify({ clientToken: tokenData.client_token }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create-order') {
      const accessToken = await generateAccessToken();
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "EUR",
                value: Number(amount).toFixed(2),
              },
              description: `Car rental booking #${bookingId}`,
            },
          ],
          application_context: {
            brand_name: "RoadReady Rent",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
          },
        }),
      });

      const order = await response.json();
      console.log("PayPal order created:", order);

      return new Response(JSON.stringify(order), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'capture-order') {
      const accessToken = await generateAccessToken();
      const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const captureData = await response.json();
      console.log("PayPal order captured:", captureData);

      if (captureData.status === "COMPLETED") {
        const { error } = await supabase
          .from("bookings")
          .update({ payment_status: "paid" })
          .eq("id", bookingId);

        if (error) throw error;
      }

      return new Response(JSON.stringify(captureData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("PayPal payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
