import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button, Card, Input } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { friendlyError } from "../services/api.js";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Please enter a valid email.";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setFormError(friendlyError(err, "We couldn't create your account. Please try again."));
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
          <h1 className="text-2xl font-bold text-ink mb-1.5">Start your legacy</h1>
          <p className="text-sm text-muted mb-6">Create your private vault in under a minute.</p>

          {formError && <div className="mb-5 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">{formError}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} error={errors.name} placeholder="Ananya Rao" />
            <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} error={errors.email} placeholder="you@example.com" />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
                placeholder="At least 6 characters"
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
            <Input
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
