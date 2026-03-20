import React from "react";

const methods = [
  { label: "Card", value: "CARD" },
  { label: "Juice (MCB)", value: "JUICE" },
  { label: "Blink (Emtel)", value: "BLINK" },
  { label: "MauCas", value: "MAUCAS" },
];

export default function PaymentSelector({ selected, onChange }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
      {methods.map((m) => (
        <button
          key={m.value}
          onClick={() => onChange(m.value)}
          style={{
            padding: "10px 15px",
            border:
              selected === m.value ? "2px solid blue" : "1px solid #ccc",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
