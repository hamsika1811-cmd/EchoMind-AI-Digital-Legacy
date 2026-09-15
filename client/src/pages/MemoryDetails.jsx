import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, MapPin, Lock, Users } from "lucide-react";
import api, { friendlyError } from "../services/api.js";
import { Button, Card, Badge, Skeleton, ConfirmDialog, pushToast } from "../components/ui.jsx";
import { MediaBadge, formatDate } from "../components/Memory.jsx";

export default function MemoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    api
      .get(`/memories/${id}`)
      .then((res) => setMemory(res.data.memory))
      .catch((err) => setError(friendlyError(err, "Memory not found.")))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    try {
      await api.delete(`/memories/${id}`);
      pushToast("Memory deleted.");
      navigate("/memories");
    } catch (err) {
      pushToast(friendlyError(err, "Unable to delete this memory."), "error");
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-muted">{error || "Memory not found."}</p>
        <Button as={Link} to="/memories" variant="outline" className="mt-4">Back to Memory Vault</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/memories" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-6">
        <ArrowLeft size={16} /> Back to Memory Vault
      </Link>

      <Card className="overflow-hidden">
        {memory.mediaUrl && (
          <img src={memory.mediaUrl} alt="" className="w-full h-56 object-cover" />
        )}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 mb-3">
            <Badge tone="indigo">{memory.category}</Badge>
            <div className="flex items-center gap-2">
              {memory.privacy === "private" ? (
                <span className="flex items-center gap-1 text-xs text-muted"><Lock size={13} /> Private</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted"><Users size={13} /> Shared</span>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-ink mb-2">{memory.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-5">
            <span>{formatDate(memory.date)}</span>
            <span>·</span>
            <MediaBadge mediaType={memory.mediaType} />
            {memory.location && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPin size={13} /> {memory.location}</span>
              </>
            )}
          </div>

          <p className="text-ink leading-relaxed whitespace-pre-line">{memory.description || "No description added."}</p>

          {memory.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {memory.tags.map((tag) => <Badge key={tag} tone="slate">#{tag}</Badge>)}
            </div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
            <Button as={Link} to={`/memories/${id}/edit`} variant="outline">
              <Pencil size={15} /> Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete this memory?"
        description={`"${memory.title}" will be permanently removed from your vault. This cannot be undone.`}
        confirmLabel="Delete memory"
      />
    </div>
  );
}
