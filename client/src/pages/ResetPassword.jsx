
import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Input } from "../components/ui.jsx";
import api, { friendlyError } from "../services/api.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset link is missing its token. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setMessage(response.data.message);
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(friendlyError(err, "Unable to reset password. Please request a new link."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-ink mb-2">Reset password</h1>
          <p className="text-sm text-muted mb-6">Choose your new password.</p>

          {message && <p role="status" className="text-sm text-green-700 mb-4">{message}</p>}
          {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Reset password"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
