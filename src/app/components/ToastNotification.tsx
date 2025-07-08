"use client";
import { useEffect } from "react";

export default function ToastNotification({
  show,
  invoiceId,
  onClose,
}: {
  show: boolean;
  invoiceId?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 10000); // 10 seconds
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show || !invoiceId) return null;
  return (
    <div className="fixed top-4 z-50 left-1/2 -translate-x-1/2 bg-green-700 text-white px-6 py-3 rounded-xl shadow-xl text-lg font-semibold flex items-center gap-2 transition-all duration-500 animate-fade-in">
      <span>✅</span>
      Invoice <span className="font-mono">{invoiceId}</span> was paid.&nbsp;
      <span className="hidden sm:inline">You’ll receive a confirmation email soon!</span>
    </div>
  );
}
