"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdminService } from "@/services/adminService";
import Spinner from "@/components/shared/Spinner";

type TaggedBusinessRow = {
  targetPlaceId: string;
  targetName: string;
  targetAddress?: string | null;
  targetIconMaskBaseUri?: string | null;
  targetIconBackgroundColor?: string | null;
  targetPrimaryPhotoUrl?: string | null;
  targetRating?: number | null;
  targetUserRatingsTotal?: number | null;
  targetWebsite?: string | null;
  targetGoogleUrl?: string | null;
  targetFormattedPhoneNumber?: string | null;
  targetEmail?: string | null;
  totalTags: number;
  taggedByUsers: number;
  taggedByBusinesses: number;
  lastTaggedAt?: string;
};

type UserTagger = {
  taggingId: string;
  taggerId: string;
  fullName: string;
  email?: string | null;
  taggedAt: string;
};

type BusinessTagger = {
  taggingId: string;
  taggerId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  businessAddress?: string | null;
  taggedAt: string;
};

type TaggedBusinessDetails = {
  userTaggers: UserTagger[];
  businessTaggers: BusinessTagger[];
  counts: {
    totalTaggers: number;
    userTaggers: number;
    businessTaggers: number;
  };
};

type DetailsState = {
  loading: boolean;
  data: TaggedBusinessDetails | null;
  error?: string;
};

const AdminBusinessTagging = () => {
  const { getTaggedBusinesses, getTaggedBusinessDetails } = useAdminService();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TaggedBusinessRow[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
  const [detailsByPlace, setDetailsByPlace] = useState<
    Record<string, DetailsState>
  >({});
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const pageSize = 25;

  const fetchTaggedBusinesses = async (nextPage: number, query: string) => {
    try {
      setLoading(true);
      const response = await getTaggedBusinesses({
        page: nextPage,
        limit: pageSize,
        q: query || undefined,
      });

      if (response?.success) {
        setRows(response.data || []);
        setPagination(response.pagination || null);
      } else {
        setRows([]);
        setPagination(null);
      }
    } catch (error) {
      setRows([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaggedBusinesses(page, searchQuery);
  }, [page, searchQuery]);

  const loadDetails = async (placeId: string) => {
    if (detailsByPlace[placeId]?.data) return;

    setDetailsByPlace((prev) => ({
      ...prev,
      [placeId]: {
        loading: true,
        data: null,
      },
    }));

    try {
      const response = await getTaggedBusinessDetails(placeId);
      if (response?.success) {
        setDetailsByPlace((prev) => ({
          ...prev,
          [placeId]: {
            loading: false,
            data: response.data || null,
          },
        }));
      } else {
        setDetailsByPlace((prev) => ({
          ...prev,
          [placeId]: {
            loading: false,
            data: null,
            error: "Failed to load details",
          },
        }));
      }
    } catch (error: any) {
      setDetailsByPlace((prev) => ({
        ...prev,
        [placeId]: {
          loading: false,
          data: null,
          error: error?.message || "Error loading details",
        },
      }));
    }
  };

  const onToggleExpand = async (row: TaggedBusinessRow) => {
    const next = expandedPlaceId === row.targetPlaceId ? null : row.targetPlaceId;
    setExpandedPlaceId(next);

    if (next) {
      await loadDetails(next);
    }
  };

  const onSearch = () => {
    setExpandedPlaceId(null);
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Business Tagging</h1>
        <p className="text-muted-foreground">
          List of tagged businesses with user/business tagging details
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full gap-2 sm:max-w-xl">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Search by business name, address or place ID..."
          />
          <Button onClick={onSearch} disabled={loading}>
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Spinner className="mr-2 h-5 w-5 animate-spin"  />
          Loading tagged businesses...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No tagged businesses found
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const open = expandedPlaceId === row.targetPlaceId;
            const detail = detailsByPlace[row.targetPlaceId];

            return (
              <Collapsible key={row.targetPlaceId} open={open}>
                <div className="rounded-xl border bg-card">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onToggleExpand(row)}
                      className="flex w-full items-start justify-between gap-3 p-4 text-left"
                    >
                      <div className="min-w-0 flex items-start gap-3">
                        {row.targetPrimaryPhotoUrl ? (
                          <img
                            src={row.targetPrimaryPhotoUrl}
                            alt={row.targetName}
                            className="h-11 w-11 shrink-0 rounded border bg-white object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded border bg-muted font-semibold">
                            {(row.targetName || "B").charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium">{row.targetName}</p>
                          <p className="text-xs text-muted-foreground break-all">
                            {row.targetAddress || row.targetPlaceId}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>Total tagged: {row.totalTags || 0}</span>
                            <span>From users: {row.taggedByUsers || 0}</span>
                            <span>
                              From businesses: {row.taggedByBusinesses || 0}
                            </span>
                            {row.targetFormattedPhoneNumber && (
                              <span>{row.targetFormattedPhoneNumber}</span>
                            )}
                            {row.targetEmail && <span>{row.targetEmail}</span>}
                            {row.targetRating !== null &&
                              row.targetRating !== undefined && (
                                <span>
                                  {Number(row.targetRating).toFixed(1)}
                                  {row.targetUserRatingsTotal
                                    ? ` (${row.targetUserRatingsTotal})`
                                    : ""}
                                </span>
                              )}
                            {row.targetWebsite && (
                              <a
                                href={row.targetWebsite}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-2"
                              >
                                Website
                              </a>
                            )}
                            {!row.targetWebsite && row.targetGoogleUrl && (
                              <a
                                href={row.targetGoogleUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-2"
                              >
                                Google
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <p className="whitespace-nowrap text-xs text-muted-foreground">
                          {row.lastTaggedAt
                            ? new Date(row.lastTaggedAt).toLocaleDateString()
                            : "-"}
                        </p>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="space-y-4 border-t p-4">
                      {!detail || detail.loading ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Spinner className="mr-2 h-4 w-4 animate-spin"  />
                          Loading user and business details...
                        </div>
                      ) : detail.error ? (
                        <div className="text-sm text-destructive">{detail.error}</div>
                      ) : !detail.data ? (
                        <div className="text-sm text-muted-foreground">
                          No detail data found for this business.
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                            <div>
                              Total taggers: {detail.data.counts?.totalTaggers || 0}
                            </div>
                            <div>
                              User taggers: {detail.data.counts?.userTaggers || 0}
                            </div>
                            <div>
                              Business taggers:{" "}
                              {detail.data.counts?.businessTaggers || 0}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">Users</p>
                            {detail.data.userTaggers?.length ? (
                              detail.data.userTaggers.map((user) => (
                                <div
                                  key={user.taggingId}
                                  className="rounded-lg border p-3 text-sm"
                                >
                                  <p className="font-medium">{user.fullName}</p>
                                  <p className="text-muted-foreground">
                                    {user.email || "No email"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Tagged on{" "}
                                    {new Date(user.taggedAt).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No user taggers.
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">Businesses</p>
                            {detail.data.businessTaggers?.length ? (
                              detail.data.businessTaggers.map((business) => (
                                <div
                                  key={business.taggingId}
                                  className="rounded-lg border p-3 text-sm"
                                >
                                  <p className="font-medium">{business.name}</p>
                                  <p className="text-muted-foreground">
                                    {business.email || "No email"}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    {business.phone && <span>{business.phone}</span>}
                                    {business.businessAddress && (
                                      <span>{business.businessAddress}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Tagged on{" "}
                                    {new Date(business.taggedAt).toLocaleString()}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No business taggers.
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBusinessTagging;
