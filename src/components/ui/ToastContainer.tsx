"use client";
import { useEffect, useState } from "react";

type ToastType = "success" | "error";

export function showToast(message: string, type: ToastType = "success") {
  const event = new CustomEvent("custom-toast", { detail: { message, type } });
  window.dispatchEvent(event);
}

export default function ToastContainer() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("custom-toast", handler);
    return () => window.removeEventListener("custom-toast", handler);
  }, []);

  if (!toast) return null;

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow text-white text-sm z-50 ${
      toast.type === "success" ? "bg-green-600" : "bg-red-600"
    }`}>
      {toast.message}
    </div>
  );
}
