import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {

  const payload = await req.json();

  const bookingId = payload.merchantTransactionId;
  const status = payload.result?.code;

  if (status?.startsWith("000")) {

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("bookings")
      .update({ payment_status: "paid" })
      .eq("id", bookingId);

  }

  return new Response("OK");

});
