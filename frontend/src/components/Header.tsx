"use client";
import HomeIcon from "@mui/icons-material/Home";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import AdbIcon from "@mui/icons-material/Adb";
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const isPlaygroundPage = pathname === "/playground";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate dynamic margin based on whether we're on playground page and screen size
  const getLogoMargin = () => {
    if (isPlaygroundPage && isMobile) {
      return "90px"; // Extra space for menu button on mobile playground
    } else if (isPlaygroundPage) {
      return "80px"; // Space for menu button on desktop playground
    } else if (isMobile) {
      return "20px"; // Normal mobile margin
    }
    return "32px"; // Normal desktop margin
  };

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
          fontSize: isMobile ? "20px" : "24px",
          color: "var(--foreground)",
          textDecoration: "none",
          marginLeft: getLogoMargin(),
          gap: 10,
          letterSpacing: 0.5,
          transition: "margin-left 0.2s ease",
        }}
      >
        <AdbIcon sx={{ fontSize: isMobile ? 28 : 32, color: "var(--accent)" }} />
        {isMobile ? "AI Play" : "AI Playground"}
      </a>
      <nav
        style={{ 
          marginRight: isMobile ? "16px" : "32px",
          display: "flex", 
          gap: isMobile ? "12px" : "24px",
          flexWrap: "nowrap",
          alignItems: "center"
        }}
        aria-label="Main navigation"
      >
        <Link
          href="/"
          style={{
            color: "var(--foreground)",
            textDecoration: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 4 : 6,
            transition: "color 0.2s",
            padding: isMobile ? "4px 8px" : "6px 12px",
            borderRadius: 8,
            fontSize: isMobile ? "14px" : "16px",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(25,118,210,0.08)")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <HomeIcon sx={{ fontSize: isMobile ? 18 : 22, color: "var(--accent)" }} /> 
          {!isMobile && "Home"}
        </Link>
        <a
          href="/playground"
          style={{
            color: "var(--foreground)",
            textDecoration: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 4 : 6,
            transition: "color 0.2s",
            padding: isMobile ? "4px 8px" : "6px 12px",
            borderRadius: 8,
            fontSize: isMobile ? "14px" : "16px",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(25,118,210,0.08)")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <PlayCircleFilledWhiteIcon
            sx={{ fontSize: isMobile ? 18 : 22, color: "var(--accent)" }}
          />
          {!isMobile && "Playground"}
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
              gap: isMobile ? 4 : 6,
              cursor: "pointer",
              fontSize: isMobile ? "14px" : "16px",
              padding: isMobile ? "4px 8px" : "6px 12px",
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
            <LogoutIcon sx={{ fontSize: isMobile ? 18 : 22, color: "var(--accent)" }} /> 
            {!isMobile && "Logout"}
          </button>
        ) : null}
      </nav>
    </header>
  );
}
