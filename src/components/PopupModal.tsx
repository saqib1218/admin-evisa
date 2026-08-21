"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface PopupModalProps {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function PopupModal({ open, type, message, onClose }: PopupModalProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "400px",
          width: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          animation: "popupIn 0.2s ease-out",
          position: "relative",
        }}
      >
        <style>{`@keyframes popupIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X style={{ width: "18px", height: "18px", color: "#73757C" }} />
        </button>

        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: isSuccess ? "#E6F4F1" : "#FEE2E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSuccess ? (
            <CheckCircle style={{ width: "32px", height: "32px", color: "#28806F" }} />
          ) : (
            <XCircle style={{ width: "32px", height: "32px", color: "#DF1C41" }} />
          )}
        </div>

        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "140%",
            letterSpacing: "-0.02em",
            color: "#0F0F0F",
            textAlign: "center",
          }}
        >
          {isSuccess ? "Success" : "Error"}
        </span>

        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "15px",
            lineHeight: "160%",
            color: "#575757",
            textAlign: "center",
          }}
        >
          {message}
        </span>

        <button
          onClick={onClose}
          style={{
            height: "40px",
            paddingLeft: "24px",
            paddingRight: "24px",
            borderRadius: "999px",
            border: "none",
            background: isSuccess ? "#28806F" : "#DF1C41",
            color: "#FFFFFF",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            marginTop: "4px",
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
