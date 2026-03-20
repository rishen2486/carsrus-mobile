import { useState } from "react";
import PaymentSelector from "../components/PaymentSelector";
import PeachCheckout from "../components/PeachCheckout";

export default function CheckoutPage() {
  const [method, setMethod] = useState("CARD");

  const amount = 500; // 🔥 Replace with your booking price

  return (
    <div style={{ padding: "20px" }}>
      <h2>Checkout</h2>

      <PaymentSelector selected={method} onChange={setMethod} />

      <PeachCheckout method={method} amount={amount} />
    </div>
  );
}
