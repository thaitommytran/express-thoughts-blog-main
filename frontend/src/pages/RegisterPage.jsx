import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, AuthContext } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Sparkles, Coffee } from "lucide-react";

export default function RegisterPage() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate(user.is_admin ? "/admin" : "/", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        toast.success("Welcome! " + (data.user.is_admin ? "You're the admin! 👑" : "🎉"));
        navigate(data.user.is_admin ? "/admin" : "/", { replace: true });
      } else {
        toast.error(data.detail || "Registration failed");
      }
    } catch {
      toast.error("Error registering");
    } finally {
      setLoading(false);
    }
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(225,100%,84%)] to-primary mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Create Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join the cozy corner
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="cozy-input w-full"
                  data-testid="name-input"
                />
              </div>

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
                  minLength={6}
                  className="cozy-input w-full"
                  data-testid="password-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full cozy-btn-primary py-6 text-base"
                data-testid="register-submit-button"
              >
                {loading ? "Creating account..." : "Create Account"}
                <UserPlus className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-sm mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
                data-testid="login-link"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-primary" />
                <span><strong>Note:</strong> The first user becomes the admin.</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
