"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import adminbg from "@/images/adminbg.svg";
import ev1 from "@/images/ev1.svg";
import logo from "@/images/logo.svg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogin, setKeepLogin] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogin = () => {
    if (email === "admin@gmail.com" && password === "admin123") {
      setToast({ type: "success", message: "Login successful!" });
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setToast({ type: "error", message: "Invalid credentials" });
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Toast notification */}
      {toast && (
        <div
          className="fixed z-50 flex items-center"
          style={{
            top: "24px",
            right: "24px",
            gap: "8px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: toast.type === "success" ? "#EFF4F9" : "#FEEFF2",
            color: toast.type === "success" ? "#28806F" : "#DF1C41",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "160%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle style={{ width: "18px", height: "18px", flexShrink: 0 }} />
          ) : (
            <XCircle style={{ width: "18px", height: "18px", flexShrink: 0 }} />
          )}
          {toast.message}
        </div>
      )}

      {/* Background image */}
      <Image
        src={adminbg}
        alt="Admin background"
        fill
        className="object-cover"
        priority
      />

      {/* Top centered logo */}
      <div className="relative z-10 flex justify-center" style={{ paddingTop: "48px" }}>
        <Image
          src={ev1}
          alt="Logo"
          width={155}
          height={60}
          style={{ width: "155px", height: "60px" }}
        />
      </div>

      {/* Login form - centered */}
      <div className="relative z-10 flex items-center justify-center" style={{ minHeight: "calc(100vh - 108px)" }}>
        <div
          className="flex flex-col"
          style={{
            maxWidth: "500px",
            width: "100%",
            margin: "0 16px",
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "32px",
            gap: "32px",
          }}
        >
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src={logo}
            alt="Logo"
            width={52}
            height={52}
            style={{ width: "52px", height: "52px" }}
          />
        </div>

        {/* Welcome text */}
        <div className="flex flex-col items-center" style={{ gap: "8px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 500,
              lineHeight: "140%",
              letterSpacing: "-0.02em",
              textAlign: "center",
              color: "#0F0F0F",
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "150%",
              letterSpacing: "-0.01em",
              textAlign: "center",
              color: "#575757",
            }}
          >
            Glad to see you again. Log in to your account.
          </p>
        </div>

        {/* Form fields */}
        <div className="flex flex-col" style={{ gap: "16px" }}>
          {/* Email */}
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "160%",
                letterSpacing: "0em",
                color: "#0F0F0F",
              }}
            >
              Email <span style={{ color: "#DF1C41" }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@gmail.com"
              style={{
                width: "100%",
                height: "56px",
                borderRadius: "999px",
                border: "1px solid #D9D9D9",
                padding: "16px",
                background: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 400,
                color: "#0F0F0F",
                outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "160%",
                letterSpacing: "0em",
                color: "#0F0F0F",
              }}
            >
              Password <span style={{ color: "#DF1C41" }}>*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: "56px",
                  borderRadius: "999px",
                  border: "1px solid #D9D9D9",
                  padding: "16px",
                  paddingRight: "48px",
                  background: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: 400,
                  color: "#0F0F0F",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute"
                style={{
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ width: "20px", height: "20px", color: "#575757" }} />
                ) : (
                  <Eye style={{ width: "20px", height: "20px", color: "#575757" }} />
                )}
              </button>
            </div>
          </div>

          {/* Keep me login */}
          <div className="flex items-center" style={{ gap: "8px" }}>
            <div
              onClick={() => setKeepLogin(!keepLogin)}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                border: keepLogin ? "none" : "1px solid #D9D9D9",
                background: keepLogin ? "var(--primary)" : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {keepLogin && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "160%",
                letterSpacing: "0em",
                color: "#575757",
              }}
            >
              Keep me login
            </span>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="flex items-center justify-center w-full"
          style={{
            height: "48px",
            borderRadius: "999px",
            background: "var(--primary)",
            color: "#FFFFFF",
            fontSize: "16px",
            fontWeight: 500,
            cursor: "pointer",
            border: "none",
          }}
        >
          Login
        </button>
        </div>
      </div>
    </div>
  );
}
