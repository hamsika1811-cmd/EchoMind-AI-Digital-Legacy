import React, { useEffect, useState } from "react";
import { ScrollText, Eye, Plus, Pencil, Trash2, ShieldCheck, ShieldX, Sparkles, DownloadCloud, LogIn, UserCog } from "lucide-react";
import api from "../services/api.js";
import { Card, Badge, EmptyState, Skeleton } from "../components/ui.jsx";

const ACTION_ICON = {
  "Memory Created": Plus,
  "Memory Updated": Pencil,
  "Memory Deleted": Trash2,
  "Memory Viewed": Eye,
  "Access Granted": ShieldCheck,
  "Access Revoked": ShieldX,
  "Access Updated": UserCog,
  "AI Question Asked": Sparkles,
  "Export Generated": DownloadCloud,
  "Login": LogIn,
  "Profile Updated": UserCog,
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/audit").then((res) => setLogs(res.data.logs)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-1">Audit Log</h1>
      <p className="text-sm text-muted mb-6">A transparent record of every action taken on your legacy.</p>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<ScrollText size={40} />} title="No activity yet." description="Actions on your legacy will appear here as they happen." />
      ) : (
        <Card className="divide-y divide-slate-50">
          {logs.map((log) => {
            const Icon = ACTION_ICON[log.action] || ScrollText;
            return (
              <div key={log.id} className="flex items-start gap-3 p-4 sm:p-5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{log.action}</p>
                    <Badge tone={log.status === "success" ? "green" : "red"}>{log.status}</Badge>
                  </div>
                  <p className="text-sm text-muted mt-0.5">{log.description}</p>
                  <p className="text-xs text-muted/70 mt-1">{timeAgo(log.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
