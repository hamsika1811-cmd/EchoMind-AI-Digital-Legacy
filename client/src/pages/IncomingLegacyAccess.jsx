import React, { useEffect, useState } from "react";
import { Inbox, BookHeart, ShieldCheck, Clock3, AlertCircle } from "lucide-react";
import api, { friendlyError } from "../services/api.js";
import { Card, Badge, Skeleton } from "../components/ui.jsx";

export default function IncomingLegacyAccess() {
  const [grants, setGrants] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [grantResponse, memoryResponse] = await Promise.all([
          api.get("/access/incoming"),
          api.get("/memories/shared"),
        ]);

        if (active) {
          setGrants(grantResponse.data.grants || []);
          setMemories(memoryResponse.data.memories || []);
        }
      } catch (err) {
        if (active) {
          setError(friendlyError(err, "Unable to load incoming legacy access."));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  const releasedGrants = grants.filter((grant) => grant.released);
  const waitingGrants = grants.filter((grant) => !grant.released);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Inbox size={23} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">Incoming Legacy Access</h1>
            <p className="text-sm text-muted mt-1">
              View memories that others have chosen to share with you.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 text-red-700 p-4 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-ink mb-3">Shared with me</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : grants.length === 0 ? (
          <Card className="p-6 text-center">
            <ShieldCheck size={30} className="mx-auto text-muted mb-2" />
            <p className="font-medium text-ink">No incoming access yet</p>
            <p className="text-sm text-muted mt-1">
              When another EchoMind user grants access to your account, it will appear here.
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {grants.map((grant) => (
              <Card key={grant.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{grant.ownerName}</p>
                    <p className="text-xs text-muted mt-1">
                      Shared by {grant.ownerName}
                    </p>
                  </div>
                  <Badge tone={grant.released ? "green" : "amber"}>
                    {grant.released ? "Available" : "Not released"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge tone="indigo">{grant.accessLevel}</Badge>
                  <Badge tone="slate">{grant.releaseCondition}</Badge>
                </div>
                {grant.allowedCategories?.length > 0 && (
                  <p className="text-xs text-muted mt-3">
                    Categories: {grant.allowedCategories.join(", ")}
                  </p>
                )}
                {!grant.released && (
                  <p className="flex items-center gap-1 text-xs text-muted mt-3">
                    <Clock3 size={14} />
                    {grant.releaseCondition === "Event-based"
                      ? "Waiting for event activation."
                      : grant.releaseDate
                        ? `Scheduled for ${grant.releaseDate}`
                        : "Waiting for the owner to activate access."}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink mb-3">Available memories</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        ) : memories.length === 0 ? (
          <Card className="p-6 text-center">
            <BookHeart size={30} className="mx-auto text-muted mb-2" />
            <p className="font-medium text-ink">No shared memories available yet</p>
            <p className="text-sm text-muted mt-1">
              Memories will appear here when the owner has released access and shared eligible memories.
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {memories.map((memory) => (
              <Card key={memory.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-ink">{memory.title}</h3>
                  <Badge tone="slate">Read only</Badge>
                </div>
                <p className="text-xs text-muted mt-1">
                  {memory.category} · {memory.date || "Date not specified"}
                </p>
                <p className="text-sm text-ink mt-3 whitespace-pre-wrap">
                  {memory.description || "No description provided."}
                </p>
                {memory.location && (
                  <p className="text-xs text-muted mt-2">Location: {memory.location}</p>
                )}
                {memory.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {memory.tags.map((tag) => (
                      <Badge key={tag} tone="slate">{tag}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted mt-3">
                  Shared by {memory.ownerName}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
