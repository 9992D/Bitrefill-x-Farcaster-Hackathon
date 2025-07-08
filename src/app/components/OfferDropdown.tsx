"use client";
import { useState, useRef, useEffect } from "react";
import { BitrefillPackage } from "../types";

type OfferDropdownProps = {
  packages: BitrefillPackage[];
  selectedPackage: BitrefillPackage | null;
  onSelect: (pkg: BitrefillPackage) => void;
};

export default function OfferDropdown({
  packages,
  selectedPackage,
  onSelect,
}: OfferDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedLabel = selectedPackage
    ? `${selectedPackage.value} € – ${(selectedPackage.price / 1e8).toFixed(8)} BTC`
    : "Select an offer";

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <button
        className="w-full px-3 py-2 rounded border shadow font-semibold flex items-center justify-between bg-[#FF9900] text-white"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {selectedLabel}
        <span className="ml-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border shadow rounded z-20 max-h-72 overflow-auto">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              className={`w-full text-left px-3 py-2 hover:bg-[#FF9900] hover:text-white font-mono flex justify-between items-center ${
                selectedPackage?.id === pkg.id ? "bg-orange-100 font-bold" : ""
              }`}
              onClick={() => {
                onSelect(pkg);
                setOpen(false);
              }}
              type="button"
            >
              <span>{pkg.value} €</span>
              <span>{(pkg.price / 1e8).toFixed(8)} BTC</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
