import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { friendlyError } from "../services/api.js";
import { Card, Skeleton, pushToast } from "../components/ui.jsx";
import MemoryForm from "../components/MemoryForm.jsx";

export default function EditMemory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/memories/${id}`)
      .then((res) => setMemory(res.data.memory))
      .catch((err) => setError(friendlyError(err, "Memory not found.")))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/memories/${id}`, payload);
      pushToast("Memory updated.");
      navigate(`/memories/${id}`);
    } catch (err) {
      setError(friendlyError(err, "Unable to update this memory."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">Edit memory</h1>
      <p className="text-sm text-muted mb-6">Update the details of this preserved memory.</p>
      <Card className="p-6 sm:p-8">
        {error && <div className="mb-5 rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11" />)}
          </div>
        ) : memory ? (
          <MemoryForm
            initial={{ ...memory, tags: memory.tags.join(", ") }}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Save changes"
          />
        ) : null}
      </Card>
    </div>
  );
}
