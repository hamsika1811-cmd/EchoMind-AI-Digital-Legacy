import React, { useEffect, useState } from "react";
import { Pencil, Eye, X, Plus } from "lucide-react";
import api, { friendlyError } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Card, Input, Textarea, Badge, Skeleton, pushToast } from "../components/ui.jsx";

function TagEditor({ label, values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }

  return (
    <div>
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-full pl-3 pr-1.5 py-1">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:bg-primary/20 rounded-full p-0.5">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus-ring focus:border-primary"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}><Plus size={14} /></Button>
      </div>
    </div>
  );
}

export default function LegacyProfile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/profile").then((res) => setProfile(res.data.profile)).finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await api.put("/profile", profile);
      setProfile(res.data.profile);
      updateUser({ name: res.data.profile.name, avatar: res.data.profile.avatar });
      setEditing(false);
      pushToast("Legacy profile updated.");
    } catch (err) {
      pushToast(friendlyError(err, "Unable to update profile."), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Legacy Profile</h1>
          <p className="text-sm text-muted mt-1">How you'll be remembered by the people you trust.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode((v) => !v)}>
            <Eye size={14} /> {previewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card className="p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-secondary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
            {profile.avatar}
          </div>
          <h2 className="text-xl font-bold text-ink">{profile.name}</h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto leading-relaxed">{profile.bio || "No biography added yet."}</p>
          {profile.legacyMessage && (
            <Card className="mt-6 p-5 bg-primary/5 border-0 text-left">
              <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1.5">Legacy message</p>
              <p className="text-sm text-ink leading-relaxed italic">"{profile.legacyMessage}"</p>
            </Card>
          )}
          {profile.values?.length > 0 && (
            <div className="mt-6 text-left">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Important values</p>
              <div className="flex flex-wrap gap-1.5">{profile.values.map((v) => <Badge key={v} tone="indigo">{v}</Badge>)}</div>
            </div>
          )}
          {profile.skills?.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">{profile.skills.map((s) => <Badge key={s} tone="gold">{s}</Badge>)}</div>
            </div>
          )}
          <p className="text-xs text-muted mt-8">This is how your profile appears to people with Full Legacy Access.</p>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-secondary text-white text-xl font-bold flex items-center justify-center shrink-0">
              {profile.avatar}
            </div>
            <Input label="Display initials" value={profile.avatar} onChange={(e) => update("avatar", e.target.value.slice(0, 2).toUpperCase())} className="w-24" />
          </div>
          <Input label="Name" value={profile.name} onChange={(e) => update("name", e.target.value)} />
          <Textarea label="Short biography" rows={4} value={profile.bio} onChange={(e) => update("bio", e.target.value)} placeholder="A few sentences about who you are..." />
          <Textarea label="Legacy message" rows={3} value={profile.legacyMessage} onChange={(e) => update("legacyMessage", e.target.value)} placeholder="A message for the people who will one day read this..." />
          <TagEditor label="Important values" values={profile.values || []} onChange={(v) => update("values", v)} placeholder="Add a value and press Enter" />
          <TagEditor label="Skills" values={profile.skills || []} onChange={(v) => update("skills", v)} placeholder="Add a skill and press Enter" />
          <Button onClick={save} disabled={saving} className="w-full">
            <Pencil size={15} /> {saving ? "Saving..." : "Save profile"}
          </Button>
        </Card>
      )}
    </div>
  );
}
