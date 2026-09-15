import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, BookHeart, LayoutGrid, LayoutList } from "lucide-react";
import api from "../services/api.js";
import { Button, Input, Select, EmptyState, Skeleton } from "../components/ui.jsx";
import { MemoryCard, Timeline } from "../components/Memory.jsx";
import { CATEGORIES, MEDIA_TYPES } from "../components/MemoryForm.jsx";

export default function MemoryVault() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mediaType, setMediaType] = useState("All");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");

  function load() {
    setLoading(true);
    const params = { sort };
    if (search) params.search = search;
    if (category !== "All") params.category = category;
    if (mediaType !== "All") params.mediaType = mediaType;
    api
      .get("/memories", { params })
      .then((res) => setMemories(res.data.memories))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, mediaType, sort]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Memory Vault</h1>
          <p className="text-sm text-muted mt-1">{memories.length} memories preserved</p>
        </div>
        <Button as={Link} to="/memories/new"><Plus size={16} /> Add Memory</Button>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mb-6">
        <div className="sm:col-span-2 relative">
          <Search size={16} className="absolute left-3.5 top-3 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories, tags, places..."
            className="pl-10"
          />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="All">All media types</option>
          {MEDIA_TYPES.map((m) => <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}</option>)}
        </Select>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-lg focus-ring ${view === "grid" ? "bg-primary text-white" : "text-muted"}`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`p-1.5 rounded-lg focus-ring ${view === "timeline" ? "bg-primary text-white" : "text-muted"}`}
            aria-label="Timeline view"
          >
            <LayoutList size={16} />
          </button>
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </Select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : memories.length === 0 ? (
        <EmptyState
          icon={<BookHeart size={40} />}
          title="Your story starts here."
          description="Preserve your first memory and begin building your digital legacy."
          action={<Button as={Link} to="/memories/new">Add Your First Memory</Button>}
        />
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((m) => <MemoryCard key={m.id} memory={m} />)}
        </div>
      ) : (
        <Timeline memories={memories} />
      )}
    </div>
  );
}
