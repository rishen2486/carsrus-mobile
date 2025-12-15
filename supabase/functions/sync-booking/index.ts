import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
// Import Resend for email functionality
// Note: Replace with actual email service integration

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, 
      bookingId, 
      carId, 
      carName, 
      startDate, 
      endDate, 
      pickupLocation, 
      dropoffLocation, 
      customerEmail, 
      googleEventId 
    } = await req.json();

    console.log('Sync booking request:', { action, bookingId, carName });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    if (action === "create") {
      // Create car availability record
      const { error: availabilityError } = await supabase
        .from('car_availability')
        .insert([{
          car_id: carId,
          booking_id: bookingId,
          start_date: startDate,
          end_date: endDate,
        }]);

      if (availabilityError) {
        console.error('Error creating availability:', availabilityError);
      }

      // Send confirmation email
      if (customerEmail) {
        console.log('Sending confirmation email to:', customerEmail);
        // Here you would integrate with your email service (Resend, SendGrid, etc.)
        // For now, we'll just log it
        
        // Example with Resend (uncomment when API key is added):
        /*
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
        
        await resend.emails.send({
          from: 'Bookings <bookings@yourdomain.com>',
          to: [customerEmail],
          subject: `Booking Confirmation #${bookingId}`,
          html: `
            <h2>Booking Confirmed! 🎉</h2>
            <p>Dear Customer,</p>
            <p>Your booking for <strong>${carName}</strong> has been confirmed.</p>
            <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
            <p><strong>Pickup:</strong> ${pickupLocation}</p>
            <p><strong>Drop-off:</strong> ${dropoffLocation}</p>
            <p>Thank you for choosing us!</p>
          `,
        });
        */
      }

      // Google Calendar integration would go here
      // For now, we'll simulate it
      console.log('Google Calendar event would be created for:', {
        carName,
        startDate,
        endDate,
        bookingId
      });

      return new Response(
        JSON.stringify({ success: true, message: 'Booking synced successfully' }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    if (action === "update" && googleEventId) {
      // Update existing booking/availability
      const { error: updateError } = await supabase
        .from('car_availability')
        .update({ start_date: startDate, end_date: endDate })
        .eq('booking_id', bookingId);

      if (updateError) {
        console.error('Error updating availability:', updateError);
      }

      console.log('Google Calendar event would be updated:', googleEventId);

      return new Response(
        JSON.stringify({ success: true, message: 'Booking updated successfully' }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    if (action === "delete" && googleEventId) {
      // Remove availability record
      const { error: deleteError } = await supabase
        .from('car_availability')
        .delete()
        .eq('booking_id', bookingId);

      if (deleteError) {
        console.error('Error deleting availability:', deleteError);
      }

      console.log('Google Calendar event would be deleted:', googleEventId);

      return new Response(
        JSON.stringify({ success: true, message: 'Booking cancelled successfully' }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );

  } catch (error) {
    console.error("Sync booking error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});