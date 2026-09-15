import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { friendlyError } from "../services/api.js";
import { Card } from "../components/ui.jsx";
import MemoryForm from "../components/MemoryForm.jsx";
import { pushToast } from "../components/ui.jsx";

export default function AddMemory() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/memories", payload);
      pushToast("Memory preserved.");
      navigate(`/memories/${res.data.memory.id}`);
    } catch (err) {
      setError(friendlyError(err, "Unable to save this memory."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">Add a memory</h1>
      <p className="text-sm text-muted mb-6">Every field is optional except a title, date, and category.</p>
      <Card className="p-6 sm:p-8">
        {error && <div className="mb-5 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}
        <MemoryForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Preserve memory" />
      </Card>
    </div>
  );
}
