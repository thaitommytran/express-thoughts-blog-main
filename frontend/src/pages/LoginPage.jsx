import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API, AuthContext } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, LogIn, Sparkles, Coffee } from "lucide-react";

export default function LoginPage() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate(user.is_admin ? "/admin" : from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        toast.success("Welcome back! ☕");
        navigate(data.user.is_admin ? "/admin" : from, { replace: true });
      } else {
        toast.error(data.detail || "Login failed");
      }
    } catch {
      toast.error("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-[hsl(190,100%,60%)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[hsl(225,100%,84%)]/20 to-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 p-4 bg-background/80 backdrop-blur-sm">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          data-testid="back-link"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </header>

      {/* Content */}
      <main className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="cozy-card-elevated p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[hsl(190,100%,60%)] mb-4">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your cozy corner
              </p>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full rounded-xl py-6 mb-6 hover:bg-secondary/50"
              data-testid="google-login-button"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">
                  or with email
                </span>
              </div>
            </div>

            {/* Email/Password Login */}
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="cozy-input w-full"
                  data-testid="email-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="cozy-input w-full"
                  data-testid="password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full cozy-btn-primary py-6 text-base"
                data-testid="login-submit-button"
              >
                {loading ? "Signing in..." : "Sign In"}
                <LogIn className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-sm mt-6 text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
                data-testid="register-link"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
