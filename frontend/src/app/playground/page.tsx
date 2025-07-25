"use client";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Drawer,
  IconButton,
  ListItemButton,
  Avatar,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import JSZip from "jszip";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/api";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const initialJSX = `export default function MyComponent() {\n  return <button>Hello World</button>;\n}`;
const initialCSS = `button {\n  color: white;\n  background: #1976d2;\n  padding: 12px 24px;\n  border-radius: 8px;\n}`;

// Define a Session type for sessions state
type Session = {
  _id: string;
  name: string;
  chat: { role: string; content: string }[];
  jsx: string;
  css: string;
  updatedAt: number;
};

function getSessions() {
  return JSON.parse(localStorage.getItem("sessions") || "[]");
}
function saveSessions(sessions: Session[]) {
  localStorage.setItem("sessions", JSON.stringify(sessions));
}

export default function PlaygroundPage() {
  const [tab, setTab] = useState(0);
  const [chat, setChat] = useState([
    {
      role: "ai",
      content: "Hi! Describe the React component or page you want to generate.",
    },
  ]);
  const [input, setInput] = useState("");
  const [jsx, setJsx] = useState(initialJSX);
  const [css, setCss] = useState(initialCSS);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // 1. Replace buttonProps with elements state
  type ButtonElement = {
    id: string;
    type: "button";
    props: { text: string };
    style: {
      background: string;
      color: string;
      padding: number;
      radius: number;
      fontSize: number;
      border: string;
      boxShadow: string;
    };
  };
  type InputElement = {
    id: string;
    type: "input";
    props: { placeholder: string };
    style: {
      color: string;
      background: string;
      padding: number;
      radius: number;
      fontSize: number;
      border: string;
      boxShadow: string;
    };
  };
  type ElementType = ButtonElement | InputElement;
  const [elements, setElements] = useState<ElementType[]>([
    {
      id: "el-1",
      type: "button",
      props: {
        text: "AI Button",
      },
      style: {
        background: "#e91e63",
        color: "#fff",
        padding: 16,
        radius: 8,
        fontSize: 16,
        border: "none",
        boxShadow: "",
      },
    },
    {
      id: "el-2",
      type: "input",
      props: {
        placeholder: "Type here...",
      },
      style: {
        color: "#333",
        background: "#fff",
        padding: 12,
        radius: 6,
        fontSize: 16,
        border: "1px solid #ccc",
        boxShadow: "",
      },
    },
  ]);

  // Fetch sessions on mount
  useEffect(() => {
    async function fetchSessions() {
      setSessionLoading(true);
      try {
        const data = await apiGet("/sessions");
        setSessions(data);
        if (data.length > 0) {
          setSessionId(data[0]._id);
          setSessionName(data[0].name);
          setChat(data[0].chat);
          setJsx(data[0].jsx);
          setCss(data[0].css);
          // The following lines are no longer needed as elements are managed locally
          // if (data[0].uiState) setButtonProps(data[0].uiState.buttonProps || buttonProps);
        }
      } catch {}
      setSessionLoading(false);
    }
    fetchSessions();
  }, []);

  // Auto-save current session on chat/code/buttonProps change
  useEffect(() => {
    if (!sessionId) return;
    const idx = sessions.findIndex((s) => s._id === sessionId);
    if (idx === -1) return;
    const updated = [...sessions];
    updated[idx] = {
      ...updated[idx],
      chat,
      jsx,
      css,
      // The following lines are no longer needed as elements are managed locally
      // uiState: { buttonProps },
      updatedAt: Date.now(),
    };
    setSessions(updated);
    // Save to backend
    apiPut(`/sessions/${sessionId}`, {
      name: sessionName,
      chat,
      jsx,
      css,
      // The following lines are no longer needed as elements are managed locally
      // uiState: { buttonProps },
    });
  }, [chat, jsx, css, sessionId, sessionName, sessions]); // Removed buttonProps from dependency array

  // 2. Update JSX/CSS generation to loop over elements
  useEffect(() => {
    if (elements.length === 0) {
      setJsx("");
      setCss("");
    } else {
      const jsxLines = [
        "export default function MyComponent() {",
        "  return (",
        "    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '32px' }}>",
        ...elements.map((el) => {
          if (el.type === "button") {
            return `      <button style={{ background: '${el.style.background}', color: '${el.style.color}', padding: '${el.style.padding}px 32px', borderRadius: '${el.style.radius}px', fontSize: '${el.style.fontSize}px', border: '${el.style.border}', boxShadow: '${el.style.boxShadow}' }}>${el.props.text}</button>`;
          } else {
            return "";
          }
        }),
        "    </div>",
        "  );",
        "}",
      ];
      setJsx(jsxLines.join("\n"));
      setCss("// Styles are inline for now");
    }
  }, [elements]);

  // Create new session
  const handleNewSession = async () => {
    setSessionLoading(true);
    const name = `Session ${sessions.length + 1}`;
    const newSession = await apiPost("/sessions", {
      name,
      chat: [
        {
          role: "ai",
          content:
            "Hi! Describe the React component or page you want to generate.",
        },
      ],
      jsx: initialJSX,
      css: initialCSS,
      // The following lines are no longer needed as elements are managed locally
      // uiState: { buttonProps },
    });
    const data = await apiGet("/sessions");
    setSessions(data);
    setSessionId(newSession._id);
    setSessionName(newSession.name);
    setChat(newSession.chat);
    setJsx(newSession.jsx);
    setCss(newSession.css);
    // The following lines are no longer needed as elements are managed locally
    // if (newSession.uiState) setButtonProps(newSession.uiState.buttonProps || buttonProps);
    setDrawerOpen(false);
    setSessionLoading(false);
  };

  // Select session
  const handleSelectSession = async (id: string) => {
    setSessionLoading(true);
    const s = await apiGet(`/sessions/${id}`);
    setSessionId(s._id);
    setSessionName(s.name);
    setChat(s.chat);
    setJsx(s.jsx);
    setCss(s.css);
    // The following lines are no longer needed as elements are managed locally
    // if (s.uiState) setButtonProps(s.uiState.buttonProps || buttonProps);
    setDrawerOpen(false);
    setSessionLoading(false);
  };

  // Delete session
  const handleDeleteSession = async (id: string) => {
    setSessionLoading(true);
    await apiDelete(`/sessions/${id}`);
    const data = await apiGet("/sessions");
    setSessions(data);
    if (data.length > 0) {
      await handleSelectSession(data[0]._id);
    } else {
      await handleNewSession();
    }
    setSessionLoading(false);
  };

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!loading) inputRef.current?.focus();
  }, [chat, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // Call backend AI endpoint
      const res = await apiPost("/ai/generate", {
        prompt: input,
        chat,
        code: jsx,
      });
      // Try to extract code and message from LLM response
      const aiMsg = { role: "ai", content: "" };
      let newJsx = jsx;
      let newCss = css;
      // Try to parse OpenAI-style response
      const choices = res.result.choices || [];
      if (choices.length > 0) {
        aiMsg.content = choices[0].message.content;
        // Try to extract code blocks (simple heuristic)
        const jsxMatch = aiMsg.content.match(/```(?:jsx|tsx)?([\s\S]*?)```/);
        if (jsxMatch) newJsx = jsxMatch[1].trim();
        const cssMatch = aiMsg.content.match(/```css([\s\S]*?)```/);
        if (cssMatch) newCss = cssMatch[1].trim();
      } else {
        aiMsg.content = res.result.choices?.[0]?.text || "AI response error.";
      }
      setChat((prev) => [...prev, aiMsg]);
      setJsx(newJsx);
      setCss(newCss);
    } catch (err: unknown) {
      let errorMsg = "AI request failed: ";
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data) {
        errorMsg += (err as any)?.response?.data?.error;
      } else if (err instanceof Error) {
        errorMsg += err.message;
      } else {
        errorMsg += 'Unknown error';
      }
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          content: errorMsg,
        },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleCopy = () => {
    if (tab === 0) {
      navigator.clipboard.writeText(jsx);
    } else {
      navigator.clipboard.writeText(css);
    }
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    zip.file("MyComponent.tsx", jsx);
    zip.file("MyComponent.module.css", css);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "component.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      display="flex"
      height="100vh"
      bgcolor="var(--background)"
      sx={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e3f0fd 100%)",
        minHeight: "100vh",
        padding: { xs: 1, md: 3 },
        gap: 3,
      }}
    >
      <IconButton
        onClick={() => setDrawerOpen(true)}
        sx={{ position: "absolute", top: 8, left: 8 }}
        aria-label="Open session drawer"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        aria-label="Session drawer"
        transitionDuration={400}
        sx={{
          "& .MuiDrawer-paper": {
            transition:
              "transform 0.4s cubic-bezier(.4,0,.2,1), box-shadow 0.3s",
          },
        }}
      >
        <Box
          width={320}
          minHeight="100vh"
          p={0}
          sx={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, #f8fafc 100%)",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--border)",
            boxShadow: "2px 0 16px rgba(25, 118, 210, 0.08)",
          }}
        >
          <Box
            px={3}
            py={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="h5"
              fontWeight={700}
              color="#fff"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 28, color: "#fff" }} />{" "}
              Sessions
            </Typography>
            <IconButton
              onClick={() => setDrawerOpen(false)}
              sx={{ color: "#fff", transition: "color 0.2s" }}
              aria-label="Close sidebar"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Button
            startIcon={<AddCircleOutlineIcon />}
            fullWidth
            variant="contained"
            onClick={handleNewSession}
            sx={{
              mb: 2,
              borderRadius: "var(--radius)",
              background: "#fff",
              color: "var(--accent)",
              fontWeight: 700,
              mx: 3,
              boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
              "&:hover": {
                background: "var(--accent-hover)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(25,118,210,0.16)",
              },
              transition: "all 0.2s",
            }}
            disabled={sessionLoading}
            aria-busy={sessionLoading}
            aria-label="Create new session"
          >
            New Session
          </Button>
          <Box flex={1} overflow="auto" px={1}>
            {sessionLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={100}
              >
                <CircularProgress />
              </Box>
            ) : sessions.length === 0 ? (
              <Typography color="#fff" align="center" mt={4}>
                No sessions yet. Create your first session!
              </Typography>
            ) : (
              <List>
                {sessions.map((s) => (
                  <ListItemButton
                    key={s._id}
                    selected={s._id === sessionId}
                    onClick={() => handleSelectSession(s._id)}
                    aria-label={`Select session ${s.name}`}
                    sx={{
                      mb: 1,
                      borderRadius: "var(--radius)",
                      background:
                        s._id === sessionId
                          ? "rgba(255,255,255,0.18)"
                          : "transparent",
                      color: "#fff",
                      boxShadow:
                        s._id === sessionId
                          ? "0 2px 8px rgba(25,118,210,0.08)"
                          : "none",
                      transition: "background 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        background: "rgba(255,255,255,0.28)",
                        boxShadow: "0 4px 16px rgba(25,118,210,0.16)",
                      },
                      animation:
                        s._id === sessionId ? "fadeInSession 0.5s" : undefined,
                    }}
                  >
                    <PersonIcon sx={{ mr: 1, color: "#fff", opacity: 0.7 }} />
                    <ListItemText
                      primary={
                        <Typography fontWeight={600} color="#fff">
                          {s.name}
                        </Typography>
                      }
                      secondary={
                        <Typography fontSize={12} color="#e3e3e3">
                          {new Date(s.updatedAt).toLocaleString()}
                        </Typography>
                      }
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteSession(s._id)}
                      aria-label={`Delete session ${s.name}`}
                      sx={{
                        color: "#fff",
                        "&:hover": { color: "#e53935" },
                        transition: "color 0.2s",
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>
      {/* Sidebar Chat */}
      <Paper
        elevation={3}
        sx={{
          width: 360,
          p: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(25,118,210,0.13)",
          bgcolor: "#fff",
          m: 3,
          minHeight: "calc(100vh - 48px)",
          maxHeight: "calc(100vh - 48px)",
          overflow: "hidden",
          animation: "fadeInChat 0.7s",
          transition: "box-shadow 0.3s",
        }}
      >
        <Box px={4} py={3} borderBottom="1px solid #f0f0f0" bgcolor="#f8fafc">
          <Typography
            variant="h6"
            fontWeight={800}
            color="var(--accent)"
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ letterSpacing: 0.5, fontSize: 22 }}
          >
            <SmartToyIcon sx={{ fontSize: 22, color: "var(--accent)" }} /> Chat
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6c757d",
              fontSize: 13,
              fontWeight: 400,
              mt: 0.5,
              mb: 1,
              letterSpacing: 0.1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            Logged
            <span
              style={{
                fontWeight: 600,
                color: "#1976d2",
                fontSize: 15,
                background: "#e3f0fd",
                padding: "2px 12px",
                borderRadius: "16px",
                marginLeft: 8,
                boxShadow: "0 1px 4px rgba(25,118,210,0.06)",
                fontFamily:
                  "var(--font-geist-sans, Arial, Helvetica, sans-serif)",
                letterSpacing: 0.2,
                display: "inline-block",
              }}
            >
              {user}
            </span>
          </Typography>
        </Box>
        <List
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 2,
            bgcolor: "#f8fafc",
            borderRadius: 0,
            mb: 0,
          }}
          aria-live="polite"
        >
          {chat.length === 0 ? (
            <ListItem>
              <ListItemText primary="No messages yet. Start the conversation!" />
            </ListItem>
          ) : (
            chat.map((msg, i) => (
              <ListItem
                key={i}
                alignItems="flex-start"
                disableGutters
                sx={{
                  mb: 1,
                  animation: "fadeInMsg 0.5s",
                  animationDelay: `${i * 0.05}s`,
                  animationFillMode: "backwards",
                  transition: "background 0.2s",
                }}
              >
                <Box display="flex" alignItems="flex-start" width="100%">
                  <Box mr={2} mt={msg.role === "ai" ? 0.5 : 0}>
                    <Avatar
                      sx={{
                        bgcolor:
                          msg.role === "ai" ? "var(--accent)" : "#e0e0e0",
                        color: msg.role === "ai" ? "#fff" : "var(--accent)",
                        width: 32,
                        height: 32,
                        fontWeight: 700,
                        fontSize: 18,
                        boxShadow:
                          msg.role === "ai" ? "0 2px 8px #1976d233" : "none",
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      {msg.role === "ai" ? (
                        <SmartToyIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <PersonIcon sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: msg.role === "ai" ? "#e3f0fd" : "#fff",
                      color: "var(--foreground)",
                      borderRadius:
                        msg.role === "ai"
                          ? "16px 16px 16px 4px"
                          : "16px 16px 4px 16px",
                      boxShadow: "0 1px 4px rgba(25,118,210,0.04)",
                      maxWidth: "80%",
                      wordBreak: "break-word",
                      transition: "background 0.2s, box-shadow 0.2s",
                    }}
                  >
                    <Typography
                      fontSize={15}
                      fontWeight={msg.role === "ai" ? 500 : 600}
                    >
                      {msg.content}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))
          )}
          {loading && (
            <ListItem>
              <CircularProgress size={24} />
            </ListItem>
          )}
          <div ref={chatEndRef} />
        </List>
        <Divider sx={{ my: 0 }} />
        <Box px={3} py={2} bgcolor="#f8fafc" borderTop="1px solid #f0f0f0">
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Type your prompt..."
              size="small"
              fullWidth
              inputRef={inputRef}
              disabled={loading}
              aria-label="Prompt input"
              sx={{
                bgcolor: "#fff",
                borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(25,118,210,0.04)",
                border: "1px solid #e0e0e0",
                fontSize: 16,
                transition: "box-shadow 0.2s",
                "&:focus-within": {
                  boxShadow: "0 2px 8px rgba(25,118,210,0.16)",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send prompt"
              sx={{
                borderRadius: "12px",
                background: "var(--accent)",
                minWidth: 48,
                minHeight: 48,
                fontWeight: 700,
                fontSize: 18,
                boxShadow: "0 2px 8px rgba(25,118,210,0.08)",
                transition: "background 0.2s, box-shadow 0.2s",
                "&:hover": {
                  background: "var(--accent-hover)",
                  boxShadow: "0 4px 16px rgba(25,118,210,0.16)",
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              startIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Paper>
      {/* Main Preview + Code */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        bgcolor="#fafbfc"
        minWidth={0}
        sx={{
          borderRadius: "24px",
          boxShadow: "0 4px 24px rgba(25,118,210,0.08)",
          margin: 3,
          padding: 3,
          transition: "box-shadow 0.3s",
        }}
      >
        {/* Code Tabs */}
        <Box>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            aria-label="Code tabs"
            sx={{ mb: 1 }}
          >
            <Tab label="JSX/TSX" />
            <Tab label="CSS" />
          </Tabs>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "#f8fafc",
              color: "#222831",
              minHeight: 120,
              borderRadius: 0,
              fontFamily: "monospace",
              boxShadow: "0 1px 4px rgba(25,118,210,0.04)",
            }}
          >
            {tab === 0 ? (
              <pre
                style={{
                  margin: 0,
                  fontFamily: "monospace",
                  background: "none",
                  color: "inherit",
                }}
              >
                {jsx}
              </pre>
            ) : (
              <pre
                style={{
                  margin: 0,
                  fontFamily: "monospace",
                  background: "none",
                  color: "inherit",
                }}
              >
                {css}
              </pre>
            )}
          </Paper>
        </Box>
        <Box display="flex" gap={2} mt={1} mb={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleCopy}
            aria-label="Copy code"
            sx={{
              borderRadius: "var(--radius)",
              borderColor: "var(--accent)",
              color: "var(--accent)",
              "&:hover": {
                background: "var(--accent-hover)",
                color: "#fff",
                borderColor: "var(--accent-hover)",
              },
            }}
          >
            Copy
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDownload}
            aria-label="Download code as zip"
            sx={{
              borderRadius: "var(--radius)",
              background: "var(--accent)",
              "&:hover": { background: "var(--accent-hover)" },
            }}
          >
            Download (.zip)
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
