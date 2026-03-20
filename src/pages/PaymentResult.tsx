import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PaymentResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // With Peach Embedded Checkout using event handlers,
    // this page is a fallback for redirect-based flows.
    const bookingId = params.get("merchantTransactionId") || localStorage.getItem("bookingId");
    const resultCode = params.get("result.code");

    if (bookingId) {
      localStorage.removeItem("bookingId");

      const success =
        resultCode?.startsWith("000.000") ||
        resultCode?.startsWith("000.100") ||
        resultCode?.startsWith("000.200");

      if (success) {
        navigate(`/booking/${bookingId}/confirmation`);
      } else {
        navigate(`/booking/${bookingId}?payment=failed`);
      }
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <p>Verifying your payment, please wait...</p>
    </div>
  );
};

export default PaymentResult;
