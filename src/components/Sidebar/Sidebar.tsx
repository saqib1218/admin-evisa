"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, NotepadText, DollarSign, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/utils/AuthContext";
import ev1 from "@/images/ev1.svg";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: NotepadText, label: "Applications", href: "/dashboard/applications" },
  { icon: DollarSign, label: "Payments", href: "/dashboard/payments" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  return (
    <aside
      className="flex flex-col"
      style={{
        maxWidth: "272px",
        width: "100%",
        height: "100vh",
        background: "#FFFFFF",
        borderRight: "1px solid #D9D9D9",
        padding: "12px",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "4px" }}>
        <Image
          src={ev1}
          alt="Logo"
          width={61.65}
          height={35.4}
          style={{ width: "61.65px", height: "35.4px" }}
        />
      </div>

      {/* Main label */}
      <p
        style={{
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: "165%",
          letterSpacing: "0em",
          color: "#575757",
          marginTop: "24px",
          marginBottom: "8px",
          paddingLeft: "4px",
        }}
      >
        Main
      </p>

      {/* Nav items */}
      <nav className="flex flex-col" style={{ gap: "4px" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              onClick={() => router.push(item.href)}
              className="flex items-center"
              style={{
                gap: "12px",
                paddingTop: "8px",
                paddingRight: "12px",
                paddingBottom: "8px",
                paddingLeft: "12px",
                borderRadius: "12px",
                background: isActive ? "#EFF4F9" : "transparent",
                cursor: "pointer",
              }}
            >
              <Icon
                style={{
                  width: "18px",
                  height: "18px",
                  color: isActive ? "var(--primary)" : "#575757",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "160%",
                  letterSpacing: "0em",
                  color: isActive ? "var(--primary)" : "#575757",
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User profile */}
      <div className="flex items-center" style={{ gap: "12px", padding: "4px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#EFF4F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#575757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              lineHeight: "160%",
              letterSpacing: "0em",
              color: "#0F0F0F",
            }}
          >
            {admin?.name || "Admin"}
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "165%",
              letterSpacing: "0em",
              color: "#575757",
            }}
          >
            {admin?.email || ""}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "#D9D9D9", margin: "12px 0" }} />

      {/* Logout */}
      <div
        onClick={logout}
        className="flex items-center"
        style={{
          gap: "12px",
          padding: "8px 12px",
          borderRadius: "12px",
          cursor: "pointer",
        }}
      >
        <LogOut style={{ width: "20px", height: "20px", color: "#DF1C41", flexShrink: 0 }} />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "160%",
            letterSpacing: "0em",
            color: "#DF1C41",
          }}
        >
          Logout
        </span>
      </div>
    </aside>
  );
}
