import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PEACH_ENTITY_ID = Deno.env.get("PEACH_ENTITY_ID")!;
const PEACH_TOKEN = Deno.env.get("PEACH_TOKEN")!;
const PEACH_API = "https://test.oppwa.com";

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, amount, bookingId, checkoutId } = await req.json();

    console.log(`Peach payment action: ${action}`, { amount, bookingId });

    /**
     * STEP 1
     * Create checkout session (called by frontend)
     */

    if (action === "create-checkout") {

      const params = new URLSearchParams({
        entityId: PEACH_ENTITY_ID,
        amount: Number(amount).toFixed(2),
        currency: "EUR",
        paymentType: "DB",
        merchantTransactionId: bookingId,
      });

      const response = await fetch(`${PEACH_API}/v1/checkouts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PEACH_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const checkout = await response.json();

      console.log("Peach checkout created:", checkout);

      return new Response(
        JSON.stringify({
          checkoutId: checkout.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    /**
     * STEP 2
     * Verify payment after widget redirect
     */

    if (action === "verify-payment") {

      const response = await fetch(
        `${PEACH_API}/v1/checkouts/${checkoutId}/payment?entityId=${PEACH_ENTITY_ID}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${PEACH_TOKEN}`,
          },
        }
      );

      const paymentData = await response.json();

      console.log("Peach payment verification:", paymentData);

      const resultCode = paymentData?.result?.code;

      /**
       * SUCCESS ranges defined by Peach
       */

      const success =
        resultCode?.startsWith("000.000") ||
        resultCode?.startsWith("000.100") ||
        resultCode?.startsWith("000.200");

      if (success) {

        console.log("Payment successful → updating booking");

        const { error } = await supabase
          .from("bookings")
          .update({ payment_status: "paid" })
          .eq("id", bookingId);

        if (error) throw error;

      } else {

        console.log("Payment not successful:", resultCode);

      }

      return new Response(JSON.stringify(paymentData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {

    console.error("Peach payment error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

});
