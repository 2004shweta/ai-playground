"use client";
import HomeIcon from "@mui/icons-material/Home";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import LoginIcon from "@mui/icons-material/Login";
import AdbIcon from "@mui/icons-material/Adb";
import React from "react";
import { useAuth } from "./AuthProvider";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  return (
    <header
      style={{
        width: "100%",
        padding: "14px 0",
        background: "var(--glass)",
        backdropFilter: "blur(var(--glass-blur))",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderRadius: "0 0 24px 24px",
        boxShadow: "0 4px 24px rgba(25,118,210,0.08)",
        animation: "fadeInDown 0.7s",
        transition: "box-shadow 0.3s",
        marginBottom: 8,
      }}
    >
      <a
        href="/playground"
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 800,
          fontSize: 24,
          color: "var(--foreground)",
          textDecoration: "none",
          marginLeft: 32,
          gap: 10,
          letterSpacing: 0.5,
        }}
      >
        <AdbIcon sx={{ fontSize: 32, color: "var(--accent)" }} />
        AI Playground
      </a>
      <nav
        style={{ marginRight: 32, display: "flex", gap: 24 }}
        aria-label="Main navigation"
      >
        <a
          href="/"
          style={{
            color: "var(--foreground)",
            textDecoration: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.2s",
            padding: "6px 12px",
            borderRadius: 8,
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(25,118,210,0.08)")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <HomeIcon sx={{ fontSize: 22, color: "var(--accent)" }} /> Home
        </a>
        <a
          href="/playground"
          style={{
            color: "var(--foreground)",
            textDecoration: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.2s",
            padding: "6px 12px",
            borderRadius: 8,
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(25,118,210,0.08)")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <PlayCircleFilledWhiteIcon
            sx={{ fontSize: 22, color: "var(--accent)" }}
          />{" "}
          Playground
        </a>
        {isLoggedIn ? (
          <button
            onClick={logout}
            style={{
              color: "var(--foreground)",
              background: "none",
              border: "none",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              fontSize: 16,
              padding: "6px 12px",
              borderRadius: 8,
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(25,118,210,0.08)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogoutIcon sx={{ fontSize: 22, color: "var(--accent)" }} /> Logout
          </button>
        ) : null}
      </nav>
    </header>
  );
}
