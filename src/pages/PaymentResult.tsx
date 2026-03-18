import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

const PaymentResult = () => {

  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {

    const verifyPayment = async () => {

      // ✅ From Peach redirect
      const checkoutId = params.get("id")

      // ✅ PRIMARY SOURCE (reliable)
      let bookingId = localStorage.getItem("bookingId")

      // ⚠️ FALLBACK (not guaranteed)
      if (!bookingId) {
        bookingId = params.get("merchantTransactionId")
      }

      console.log("Checkout ID:", checkoutId)
      console.log("Booking ID:", bookingId)

      if (!checkoutId || !bookingId) {
        console.error("Missing parameters")

        navigate("/booking-error") // optional fallback page
        return
      }

      const { data, error } = await supabase.functions.invoke(
        "verify-peach-payment",
        {
          body: {
            checkoutId,
            bookingId
          }
        }
      )

      if (error) {
        console.error("Verification error:", error)

        navigate(`/booking/${bookingId}?payment=error`)
        return
      }

      const resultCode = data?.result?.code

      const success =
        resultCode?.startsWith("000.000") ||
        resultCode?.startsWith("000.100") ||
        resultCode?.startsWith("000.200")

      if (success) {

        // ✅ Clean storage
        localStorage.removeItem("bookingId")

        navigate(`/booking/${bookingId}/confirmation`)

      } else {

        navigate(`/booking/${bookingId}?payment=failed`)

      }

    }

    verifyPayment()

  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Verifying your payment, please wait...</p>
    </div>
  )
}

export default PaymentResult
