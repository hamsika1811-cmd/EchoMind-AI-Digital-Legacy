import React, { useState } from "react";
import { DownloadCloud, FileJson, CheckCircle2 } from "lucide-react";
import api, { friendlyError } from "../services/api.js";
import { Button, Card, pushToast } from "../components/ui.jsx";

export default function Export() {
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState(null);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await api.get("/export");
      const archive = res.data.archive;
      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `echomind-legacy-archive-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setLastExport(archive.summary);
      pushToast("Legacy archive downloaded.");
    } catch (err) {
      pushToast(friendlyError(err, "Unable to generate export."), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">Export Legacy</h1>
      <p className="text-sm text-muted mb-6">Download a complete copy of your legacy vault.</p>

      <Card className="p-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
          <FileJson size={24} />
        </div>
        <h2 className="font-semibold text-ink mb-1.5">Legacy Archive</h2>
        <p className="text-sm text-muted mb-6 max-w-sm mx-auto">
          Includes your profile, every memory, tags, timeline information, and your legacy access list — packaged as a
          single downloadable JSON file.
        </p>
        <Button onClick={handleExport} disabled={loading} size="lg">
          <DownloadCloud size={17} /> {loading ? "Preparing..." : "Export Legacy Archive"}
        </Button>

        {lastExport && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
            <CheckCircle2 size={16} />
            Exported {lastExport.totalMemories} memories and {lastExport.totalTrustedPeople} access grants.
          </div>
        )}
      </Card>
    </div>
  );
}
