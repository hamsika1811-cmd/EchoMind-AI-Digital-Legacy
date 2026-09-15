import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookHeart, Image, Users2, Sparkles, Plus, ArrowRight } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Card, Skeleton } from "../components/ui.jsx";
import { StatCard, MemoryCard } from "../components/Memory.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/memories"), api.get("/access")])
      .then(([memRes, accessRes]) => {
        setMemories(memRes.data.memories);
        setGrants(accessRes.data.grants);
      })
      .finally(() => setLoading(false));
  }, []);

  const mediaCount = (type) => memories.filter((m) => m.mediaType === type).length;
  const recent = [...memories]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-muted mt-1">Here's how your legacy is taking shape.</p>
        </div>
        <div className="flex gap-2">
          <Button as={Link} to="/ai" variant="outline">
            <Sparkles size={16} /> Ask EchoMind AI
          </Button>
          <Button as={Link} to="/memories/new">
            <Plus size={16} /> Add Memory
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookHeart} label="Total memories" value={memories.length} tone="indigo" />
          <StatCard icon={Image} label="Photos & media" value={mediaCount("image") + mediaCount("video") + mediaCount("audio")} tone="gold" />
          <StatCard icon={Users2} label="People with access" value={grants.filter((g) => g.status !== "Revoked").length} tone="green" />
          <StatCard icon={BookHeart} label="Documents" value={mediaCount("document")} tone="indigo" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Recent memories</h2>
            <Link to="/memories" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : recent.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-sm text-muted mb-4">You haven't preserved any memories yet.</p>
              <Button as={Link} to="/memories/new" size="sm">Add your first memory</Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {recent.map((m) => <MemoryCard key={m.id} memory={m} />)}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-ink mb-4">Legacy access</h2>
          <Card className="p-5">
            {grants.length === 0 ? (
              <p className="text-sm text-muted">No trusted people added yet.</p>
            ) : (
              <div className="space-y-3">
                {grants.slice(0, 4).map((g) => (
                  <div key={g.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {g.recipientName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{g.recipientName}</p>
                      <p className="text-xs text-muted truncate">{g.accessLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button as={Link} to="/access" variant="ghost" size="sm" className="w-full mt-4">
              Manage access <ArrowRight size={14} />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
