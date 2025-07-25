import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import AdbIcon from "@mui/icons-material/Adb";

export default function Home() {
  return (
    <div className={styles.page} style={{ position: "relative", overflow: "hidden" }}>
      {/* Animated background SVGs */}
      <svg className={styles.bgGlobe} width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g opacity="0.18">
          <circle cx="110" cy="110" r="100" fill="#1976d2" />
          <circle cx="110" cy="110" r="80" fill="#e3f0fd" />
        </g>
      </svg>
      <svg className={styles.bgWindow} width="120" height="120" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#fff" fillOpacity="0.7" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" />
      </svg>
      <svg className={styles.bgFile} width="90" height="90" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z" fill="#1976d2" fillOpacity="0.13" />
      </svg>
      {/* Main content */}
      <main className={styles.main}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <AdbIcon className={styles.robotIcon} sx={{ fontSize: 80, color: "var(--accent)", mb: 1, filter: "drop-shadow(0 2px 8px #1976d233)" }} />
          <h1 style={{ fontSize: 44, fontWeight: 800, textAlign: "center", letterSpacing: 0.5, marginBottom: 8 }}>
            Welcome to <span style={{ color: "var(--accent)" }}>AI Playground</span>
          </h1>
          <p style={{ fontSize: 20, color: "#444", maxWidth: 520, textAlign: "center", marginBottom: 24 }}>
            Instantly generate, edit, and experiment with React components using AI. Build, learn, and play—all in your browser.
          </p>
          <div className={styles.ctas}>
            <Link href="/login" className="primary" style={{ padding: "14px 32px", fontSize: 20, fontWeight: 700 }}>
              Get Started
            </Link>
            <a href="/playground" className="secondary" style={{ padding: "14px 32px", fontSize: 20, fontWeight: 700 }}>
              Try Playground
            </a>
          </div>
        </div>
        <section style={{ marginTop: 48, width: "100%", maxWidth: 700 }}>
          <ol>
            <li>
              <b>⚡ Fast Prototyping:</b> Generate React components instantly with AI.
            </li>
            <li>
              <b>🎨 Live Editing:</b> Tweak code and see changes in real time.
            </li>
            <li>
              <b>🔒 Secure & Private:</b> Your code stays in your browser.
            </li>
            <li>
              <b>🌐 Export & Share:</b> Download or share your creations easily.
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
