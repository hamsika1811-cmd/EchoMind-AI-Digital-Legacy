import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, Lock, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, Button, Input, ConfirmDialog, pushToast } from "../components/ui.jsx";

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors focus-ring shrink-0 ${checked ? "bg-primary" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({ accessViewed: true, aiQuestions: true, weeklyDigest: false });
  const [privacy, setPrivacy] = useState({ defaultPrivate: true, requireApproval: true });
  const [aiPrefs, setAiPrefs] = useState({ showSources: true, allowChat: true });
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDeleteAccount() {
    pushToast("Account deletion is simulated in this prototype.", "info");
    setConfirmOpen(false);
    logout();
    navigate("/");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your account, privacy, and AI preferences.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-ink mb-4 flex items-center gap-2"><Lock size={16} /> Profile & password</h2>
        <div className="space-y-4">
          <Input label="Name" defaultValue={user?.name} />
          <Input label="Email" defaultValue={user?.email} type="email" />
          <Input label="New password" type="password" placeholder="Leave blank to keep current password" />
          <Button size="sm" onClick={() => pushToast("Settings saved.")}>Save changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-ink mb-2 flex items-center gap-2"><Bell size={16} /> Notifications</h2>
        <div className="divide-y divide-slate-50">
          <Toggle checked={notifications.accessViewed} onChange={(v) => setNotifications((p) => ({ ...p, accessViewed: v }))} label="Notify when a memory is viewed" description="Get notified when a trusted person views a memory." />
          <Toggle checked={notifications.aiQuestions} onChange={(v) => setNotifications((p) => ({ ...p, aiQuestions: v }))} label="Notify on AI questions" description="Get notified when someone asks EchoMind AI a question." />
          <Toggle checked={notifications.weeklyDigest} onChange={(v) => setNotifications((p) => ({ ...p, weeklyDigest: v }))} label="Weekly digest" description="A weekly summary of activity on your legacy." />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-ink mb-2 flex items-center gap-2"><Lock size={16} /> Privacy</h2>
        <div className="divide-y divide-slate-50">
          <Toggle checked={privacy.defaultPrivate} onChange={(v) => setPrivacy((p) => ({ ...p, defaultPrivate: v }))} label="New memories default to private" />
          <Toggle checked={privacy.requireApproval} onChange={(v) => setPrivacy((p) => ({ ...p, requireApproval: v }))} label="Require approval for new access requests" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-ink mb-2 flex items-center gap-2"><Sparkles size={16} /> AI preferences</h2>
        <div className="divide-y divide-slate-50">
          <Toggle checked={aiPrefs.showSources} onChange={(v) => setAiPrefs((p) => ({ ...p, showSources: v }))} label="Always show source memories" />
          <Toggle checked={aiPrefs.allowChat} onChange={(v) => setAiPrefs((p) => ({ ...p, allowChat: v }))} label="Allow trusted people to use EchoMind AI" />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-ink mb-4">Data export</h2>
        <p className="text-sm text-muted mb-4">Download a full copy of your legacy at any time from the Export page.</p>
        <Button as={Link} to="/export" variant="outline" size="sm">Go to Export</Button>
      </Card>

      <Card className="p-6 border-red-100">
        <h2 className="font-semibold text-red-600 mb-2 flex items-center gap-2"><Trash2 size={16} /> Delete account</h2>
        <p className="text-sm text-muted mb-4">Permanently delete your account and everything in your legacy vault. This cannot be undone.</p>
        <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>Delete my account</Button>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        description="This will permanently remove your legacy vault, memories, and access grants. This action cannot be undone."
        confirmLabel="Delete account"
      />
    </div>
  );
}
