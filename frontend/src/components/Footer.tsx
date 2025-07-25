"use client";
import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "18px 0",
        background: "var(--glass)",
        backdropFilter: "blur(var(--glass-blur))",
        borderTop: "1px solid #e0e0e0",
        textAlign: "center",
        color: "var(--foreground)",
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: 0.2,
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -4px 24px rgba(25,118,210,0.08)",
        animation: "fadeInUp 0.7s",
        marginTop: 8,
      }}
    >
      © {new Date().getFullYear()} AI Playground. All rights reserved.
    </footer>
  );
}
