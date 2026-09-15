import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Button, Card, Input } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { friendlyError } from "../services/api.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isDemo = params.get("demo") === "1";

  const [email, setEmail] = useState(isDemo ? "demo@echomind.app" : "");
  const [password, setPassword] = useState(isDemo ? "demo1234" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(friendlyError(err, "Incorrect email or password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-accent font-bold">E</div>
          <span className="text-lg font-bold text-primary">EchoMind</span>
        </Link>
        <Card className="p-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-ink mb-1.5">Welcome back</h1>
          <p className="text-sm text-muted mb-6">Log in to continue building your legacy.</p>

          {isDemo && (
            <div className="mb-5 rounded-xl bg-accent/10 text-accent text-sm px-4 py-3 flex items-center gap-2">
              <Sparkles size={16} /> Demo credentials pre-filled — just hit log in.
            </div>
          )}

          {error && <div className="mb-5 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-[38px] text-muted hover:text-ink focus-ring rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Start your legacy
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
