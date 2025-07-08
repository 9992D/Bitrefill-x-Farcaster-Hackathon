"use client";
import { useState } from "react";

export default function OfferAccordion({
  packages,
  onSelect,
  selectedPackage,
}: {
  packages: any[];
  onSelect: (pkg: any) => void;
  selectedPackage: any | null;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul className="space-y-2">
      {packages.map((pkg: any, idx: number) => (
        <li key={pkg.id}>
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className={`w-full text-left px-3 py-2 rounded border shadow font-semibold flex items-center justify-between ${
              openIndex === idx ? "bg-[#FF9900] text-white" : "bg-white"
            }`}
          >
            {pkg.value} €
            <span className="font-mono text-xs ml-2">
              {(pkg.price / 1e7).toFixed(8)} BTC
            </span>
            <span className="ml-2">{openIndex === idx ? "▲" : "▼"}</span>
          </button>
          {openIndex === idx && (
            <div className="p-3 bg-orange-50 border rounded-b">
              <button
                className={`px-4 py-2 rounded font-bold mt-1 ${
                  selectedPackage?.id === pkg.id
                    ? "bg-green-700 text-white"
                    : "bg-[#FF9900] text-white hover:bg-[#e08700]"
                }`}
                onClick={() => onSelect(pkg)}
              >
                {selectedPackage?.id === pkg.id ? "Selected!" : "Choose this offer"}
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
