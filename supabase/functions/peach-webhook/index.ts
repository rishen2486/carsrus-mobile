import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    console.log("Peach webhook received:", JSON.stringify(payload));

    const bookingId = payload.merchantTransactionId;
    const resultCode = payload.result?.code;

    const success =
      resultCode?.startsWith("000.000") ||
      resultCode?.startsWith("000.100") ||
      resultCode?.startsWith("000.200");

    if (success && bookingId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { error } = await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);

      if (error) {
        console.error("Failed to update booking:", error);
      } else {
        console.log(`Booking ${bookingId} marked as paid via webhook`);
      }
    } else {
      console.log("Payment not successful or missing bookingId:", resultCode);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error", { status: 500 });
  }
});
