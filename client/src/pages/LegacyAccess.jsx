import React, { useEffect, useState } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";
import api, { friendlyError } from "../services/api.js";
import { Button, Card, Badge, Input, Select, Modal, EmptyState, Skeleton, ConfirmDialog, pushToast } from "../components/ui.jsx";
import { CATEGORIES } from "../components/MemoryForm.jsx";

const ACCESS_LEVELS = ["View Only", "Memory Chat", "Full Legacy Access"];
const RELEASE_CONDITIONS = ["Immediate", "Scheduled", "Event-based"];

const STATUS_TONE = { Active: "green", Scheduled: "amber", Revoked: "red" };

function GrantForm({ onCreated, onClose }) {
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    accessLevel: "View Only",
    allowedCategories: [],
    releaseCondition: "Immediate",
    releaseDate: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(cat) {
    setForm((prev) => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(cat)
        ? prev.allowedCategories.filter((c) => c !== cat)
        : [...prev.allowedCategories, cat],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.recipientName || !form.recipientEmail) {
      setError("Please enter a name and email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/access", form);
      onCreated(res.data.grant);
    } catch (err) {
      setError(friendlyError(err, "Unable to add this trusted person."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-xl bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}
      <Input label="Name" value={form.recipientName} onChange={(e) => setForm((p) => ({ ...p, recipientName: e.target.value }))} placeholder="Rahul Menon" />
      <Input label="Email" type="email" value={form.recipientEmail} onChange={(e) => setForm((p) => ({ ...p, recipientEmail: e.target.value }))} placeholder="rahul@example.com" />
      <Select label="Access level" value={form.accessLevel} onChange={(e) => setForm((p) => ({ ...p, accessLevel: e.target.value }))}>
        {ACCESS_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
      </Select>
      <div>
        <span className="block text-sm font-medium text-ink mb-1.5">Accessible categories (optional — leave blank for all)</span>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => toggleCategory(c)}
              className={`text-xs rounded-full px-3 py-1.5 border focus-ring transition-colors ${
                form.allowedCategories.includes(c) ? "bg-primary text-white border-primary" : "border-slate-200 text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <Select label="Release condition" value={form.releaseCondition} onChange={(e) => setForm((p) => ({ ...p, releaseCondition: e.target.value }))}>
        {RELEASE_CONDITIONS.map((r) => <option key={r} value={r}>{r}</option>)}
      </Select>
      {form.releaseCondition === "Scheduled" && (
        <Input label="Release date" type="date" value={form.releaseDate} onChange={(e) => setForm((p) => ({ ...p, releaseDate: e.target.value }))} />
      )}
      {form.releaseCondition === "Event-based" && (
        <p className="text-xs text-muted bg-slate-50 rounded-xl px-4 py-3">
          Event verification is simulated in this prototype — no real-world event or death verification occurs.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Adding..." : "Add trusted person"}</Button>
    </form>
  );
}

export default function LegacyAccess() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);

  function load() {
    setLoading(true);
    api.get("/access").then((res) => setGrants(res.data.grants)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function handleCreated(grant) {
    setGrants((prev) => [grant, ...prev]);
    setModalOpen(false);
    pushToast(`${grant.recipientName} added to Legacy Access.`);
  }

  async function handleRevoke() {
    try {
      const res = await api.delete(`/access/${revokeTarget.id}`);
      setGrants((prev) => prev.map((g) => (g.id === res.data.grant.id ? res.data.grant : g)));
      pushToast(`Access revoked for ${revokeTarget.recipientName}.`);
    } catch (err) {
      pushToast(friendlyError(err, "Unable to revoke access."), "error");
    } finally {
      setRevokeTarget(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Legacy Access</h1>
          <p className="text-sm text-muted mt-1">Control exactly who can see your legacy, and how.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><UserPlus size={16} /> Add trusted person</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : grants.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={40} />}
          title="No trusted people yet."
          description="Add someone you trust and decide exactly what they can access."
          action={<Button onClick={() => setModalOpen(true)}>Add trusted person</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {grants.map((g) => (
            <Card key={g.id} className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {g.recipientName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{g.recipientName}</p>
                    <p className="text-xs text-muted">{g.recipientEmail}</p>
                  </div>
                </div>
                <Badge tone={STATUS_TONE[g.status] || "slate"}>{g.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge tone="indigo">{g.accessLevel}</Badge>
                <Badge tone="slate">{g.releaseCondition}</Badge>
              </div>
              {g.allowedCategories?.length > 0 && (
                <p className="text-xs text-muted mb-3">
                  Categories: {g.allowedCategories.join(", ")}
                </p>
              )}
              <p className="text-xs text-muted">Granted {new Date(g.createdAt).toLocaleDateString()}</p>
              {g.status !== "Revoked" && (
                <Button variant="ghost" size="sm" className="mt-3 text-red-600 hover:bg-red-50" onClick={() => setRevokeTarget(g)}>
                  Revoke access
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a trusted person">
        <GrantForm onCreated={handleCreated} onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke access?"
        description={revokeTarget ? `${revokeTarget.recipientName} will immediately lose access to your legacy.` : ""}
        confirmLabel="Revoke access"
      />
    </div>
  );
}
