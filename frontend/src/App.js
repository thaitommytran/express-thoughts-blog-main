import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Toaster } from "./components/ui/sonner";

// Pages
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import SearchResults from "./pages/SearchResults";
import TagPosts from "./pages/TagPosts";

// Context
export const AuthContext = createContext(null);
export const ThemeContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Theme Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("blog-theme");
    return saved || "light";
  });

  useEffect(() => {
    localStorage.setItem("blog-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    if (token) {
      document.cookie = `session_token=${token}; path=/; secure; samesite=none`;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth Callback Component
function AuthCallback() {
  const hasProcessed = useRef(false);
  const { login } = useContext(AuthContext);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = new URLSearchParams(hash.slice(1)).get("session_id");

      if (sessionId) {
        try {
          const res = await fetch(`${API}/auth/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ session_id: sessionId }),
          });

          if (res.ok) {
            const userData = await res.json();
            login(userData);
          }
        } catch (err) {
          console.error("Auth error:", err);
        }
      }

      window.location.href = "/admin";
    };

    processAuth();
  }, [login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-pulse text-2xl font-bold uppercase tracking-widest">
          Authenticating...
        </div>
      </div>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl font-bold uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// App Router
function AppRouter() {
  const location = useLocation();

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  // Check for session_id in URL hash (Google OAuth callback)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/post/:postId" element={<PostPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/tag/:tag" element={<TagPosts />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create"
        element={
          <ProtectedRoute adminOnly>
            <CreatePost />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/edit/:postId"
        element={
          <ProtectedRoute adminOnly>
            <EditPost />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
