import { useEffect } from "react";
import { getPeachToken } from "../services/peachService";

const brandMap = {
  CARD: "VISA MASTER",
  JUICE: "JUICE",
  BLINK: "BLINK",
  MAUCAS: "MAUCAS",
};

export default function PeachCheckout({ method, amount }) {
  useEffect(() => {
    const loadWidget = async () => {
      try {
        const token = await getPeachToken();

        // Remove existing script
        const existingScript = document.getElementById("peach-script");
        if (existingScript) existingScript.remove();

        // Create script
        const script = document.createElement("script");
        script.id = "peach-script";
        script.src = "https://test.oppwa.com/v1/paymentWidgets.js";

        script.setAttribute("data-brands", brandMap[method]);

        window.wpwlOptions = {
          style: "card",
          amount: amount.toFixed(2),
          currency: "MUR",
          shopperResultUrl: `${window.location.origin}/payment-result`,
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error("Peach error:", err);
      }
    };

    loadWidget();
  }, [method, amount]);

  return <form className="paymentWidgets"></form>;
}
