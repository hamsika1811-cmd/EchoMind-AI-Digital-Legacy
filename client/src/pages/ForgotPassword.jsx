
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input } from "../components/ui.jsx";
import api, { friendlyError } from "../services/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });
      setMessage(response.data.message);
    } catch (err) {
      setError(friendlyError(err, "Unable to send email. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-ink mb-2">Forgot password?</h1>
          <p className="text-sm text-muted mb-6">
            Enter your email to request a secure password-reset link.
          </p>

          {message && <p role="status" className="text-sm text-green-700 mb-4">{message}</p>}
          {error && <p role="alert" className="text-sm text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
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
