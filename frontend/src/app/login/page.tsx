"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import Image from "next/image";
import Divider from "@mui/material/Divider";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AdbIcon from "@mui/icons-material/Adb";
import { useEffect } from "react";
import { setToken } from "../../utils/api";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { isLoggedIn, login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace("/playground");
  }, [isLoggedIn, router]);

  useEffect(() => {
    // Check for token in URL (after Google OAuth redirect)
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      setToken(token);
      router.replace("/playground");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Login/signup failed");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login/signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
      : "http://localhost:3001/auth/google";
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e3f0fd 100%)",
        animation: "fadeIn 1s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background illustration */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle at 60% 40%, #1976d2 0%, #e3f0fd 100%)",
          opacity: 0.12,
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box
        mb={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        zIndex={1}
      >
        <AdbIcon
          sx={{
            fontSize: 56,
            color: "var(--accent)",
            mb: 1,
            filter: "drop-shadow(0 2px 8px #1976d233)",
          }}
        />
        <Typography
          variant="h4"
          fontWeight={800}
          color="var(--accent)"
          mb={1}
          sx={{ letterSpacing: 0.5 }}
        >
          Welcome to AI Playground
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ fontWeight: 400, fontSize: 18 }}
        >
          {mode === "login"
            ? "Sign in to your account"
            : "Create a new account"}
        </Typography>
      </Box>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 4 },
          minWidth: { xs: 320, sm: 380 },
          borderRadius: "24px",
          boxShadow: "0 4px 32px rgba(25,118,210,0.10)",
          background: "#fff",
          animation: "fadeInDown 0.7s",
          width: "100%",
          maxWidth: 400,
          zIndex: 1,
          transition: "box-shadow 0.3s",
        }}
      >
        <Tabs
          value={mode}
          onChange={(_, v) => setMode(v)}
          centered
          aria-label="Login or Sign Up"
          sx={{ mb: 2 }}
          TabIndicatorProps={{ style: { background: "var(--accent)" } }}
        >
          <Tab
            label="Login"
            value="login"
            id="tab-login"
            aria-controls="tabpanel-login"
            sx={{ fontWeight: 700, fontSize: 18 }}
          />
          <Tab
            label="Sign Up"
            value="signup"
            id="tab-signup"
            aria-controls="tabpanel-signup"
            sx={{ fontWeight: 700, fontSize: 18 }}
          />
        </Tabs>
        <Box
          component="form"
          mt={2}
          onSubmit={handleSubmit}
          aria-labelledby={mode === "login" ? "tab-login" : "tab-signup"}
        >
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
            aria-required="true"
            aria-label="Email address"
            InputProps={{
              startAdornment: (
                <EmailIcon sx={{ color: "var(--accent)", mr: 1 }} />
              ),
            }}
            sx={{
              background: "#f8fafc",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
              mb: 2,
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            aria-required="true"
            aria-label="Password"
            InputProps={{
              startAdornment: (
                <LockIcon sx={{ color: "var(--accent)", mr: 1 }} />
              ),
            }}
            sx={{
              background: "#f8fafc",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
              mb: 2,
            }}
          />
          {mode === "signup" && (
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
              aria-required="true"
              aria-label="Confirm Password"
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ color: "var(--accent)", mr: 1 }} />
                ),
              }}
              sx={{
                background: "#f8fafc",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
                mb: 2,
              }}
            />
          )}
          {error && (
            <Typography color="error" mt={1} role="alert" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 1,
              borderRadius: 2,
              background: "var(--accent)",
              fontWeight: 700,
              fontSize: 18,
              py: 1.5,
              boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
              "&:hover": { background: "var(--accent-hover)" },
              textTransform: "none",
              letterSpacing: 0.5,
            }}
            disabled={loading}
            aria-busy={loading}
            aria-live="polite"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Sign Up"}
          </Button>
          <Divider sx={{ my: 3, color: "#e0e0e0", fontWeight: 600 }}>
            or
          </Divider>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              py: 1.2,
              px: 0,
              borderColor: "var(--accent)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 0,
              width: '100%',
              height: 48,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              "&:hover": {
                background: "#e3f0fd",
                borderColor: "var(--accent-hover)",
              },
              textTransform: "none",
              letterSpacing: 0.5,
            }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Image src="/google.svg" alt="Google" width={24} height={24} style={{ marginRight: 12, flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Continue with Google
            </span>
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
