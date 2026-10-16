"use client";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { setUserSuccess } from "@/store/authSlice";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import BusinessSearchInput from "@/components/shared/BusinessSearchInput";
import { Input } from "@/components/ui/input";
import PromotionCard from "@/components/public/PromotionCard";
import Header from "@/components/homePage/Header";
import fetchData from "@/utils/apiAction"; // ✅ Your fetchData hook
import {
  getWishlist,
  WishlistItem,
  WishlistResponse,
  removeFromWishlist as apiRemoveFromWishlist,
} from "@/services/wishlistService";
import Spinner from "@/components/shared/Spinner";
import {
  createBusinessTagging,
  deleteBusinessTagging,
  listMyBusinessTaggings,
  type BusinessTaggingRow,
} from "@/services/businessTaggingService";
import { SceneBackdrop } from "@/components/art/Scene";

interface TaggedBusiness {
  taggingId: string;
  placeId: string;
  name: string;
  location: string;
  primaryPhotoUrl?: string | null;
  iconMaskBaseUri?: string | null;
  iconBackgroundColor?: string | null;
  rating?: number | null;
  userRatingsTotal?: number | null;
  formattedPhoneNumber?: string | null;
  website?: string | null;
  googleUrl?: string | null;
  email?: string | null;
}

interface Business {
  id: string;
  name: string;
  businessAddress?: string;
  iconMaskBaseUri?: string;
  iconBackgroundColor?: string;
  primaryPhotoUrl?: string;
  rating?: number;
  userRatingsTotal?: number;
  website?: string;
  url?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  types?: string[];
  reviews?: any[];
}

const UserProfile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.userToken);
  const dispatch = useAppDispatch();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (user as any)?.avatarUrl || null,
  );

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Upload avatar handler
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setAvatarPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { response, error } = await fetchData(
        "/users/profile",
        {
          method: "PUT",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        },
        undefined,
        "user",
      );

      if (response && response.avatarUrl) {
        const updatedUser = { ...(user as any), avatarUrl: response.avatarUrl };
        dispatch(setUserSuccess({ user: updatedUser, token: token || "" }));
        setAvatarPreview(response.avatarUrl);
      } else {
        console.error("Avatar upload failed", error);
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);

  const [taggedBusinesses, setTaggedBusinesses] = useState<TaggedBusiness[]>(
    [],
  );
  const [isLoadingTaggedBusinesses, setIsLoadingTaggedBusinesses] =
    useState(false);
  const [isTaggingBusiness, setIsTaggingBusiness] = useState(false);
  const [deletingTaggingId, setDeletingTaggingId] = useState<string | null>(
    null,
  );

  // 🔥 Fetch Wishlist
  const fetchWishlist = useCallback(async () => {
    if (!user?.id) return;

    setIsLoadingWishlist(true);
    try {
      const result = (await getWishlist(1, 50, "user")) as WishlistResponse;
      if (result?.success) {
        setWishlistItems(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setIsLoadingWishlist(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const mapTaggingToUi = (row: BusinessTaggingRow): TaggedBusiness => ({
    taggingId: row.id,
    placeId: row.targetPlaceId,
    name: row.targetName,
    location: row.targetAddress || "Unknown",
    primaryPhotoUrl: row.targetPrimaryPhotoUrl || null,
    iconMaskBaseUri: row.targetIconMaskBaseUri || null,
    iconBackgroundColor: row.targetIconBackgroundColor || null,
    rating: row.targetRating ?? null,
    userRatingsTotal: row.targetUserRatingsTotal ?? null,
    formattedPhoneNumber: row.targetFormattedPhoneNumber || null,
    website: row.targetWebsite || null,
    googleUrl: row.targetGoogleUrl || null,
    email: row.targetEmail || null,
  });

  const fetchMyTaggings = useCallback(async () => {
    setIsLoadingTaggedBusinesses(true);
    try {
      const res = await listMyBusinessTaggings("user", 1, 200);
      if (res.success) {
        setTaggedBusinesses((res.data || []).map(mapTaggingToUi));
      }
    } finally {
      setIsLoadingTaggedBusinesses(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTaggings();
  }, [fetchMyTaggings]);

  const handleTagBusiness = async (business: Business) => {
    setIsTaggingBusiness(true);
    try {
      const res = await createBusinessTagging("user", {
        placeId: business.id,
        name: business.name,
        address: business.businessAddress || undefined,
        iconMaskBaseUri: business.iconMaskBaseUri,
        iconBackgroundColor: business.iconBackgroundColor,
        primaryPhotoUrl: business.primaryPhotoUrl,
        rating: business.rating,
        userRatingsTotal: business.userRatingsTotal,
        website: business.website,
        url: business.url,
        formattedPhoneNumber: business.formattedPhoneNumber,
        internationalPhoneNumber: business.internationalPhoneNumber,
        types: business.types,
        reviews: business.reviews,
      });

      if (res.success) {
        setShowSearchInput(false);
        await fetchMyTaggings();
      }
    } finally {
      setIsTaggingBusiness(false);
    }
  };

  const handleDeleteTagging = async (taggingId: string) => {
    setDeletingTaggingId(taggingId);
    try {
      const res = await deleteBusinessTagging("user", taggingId);
      if (res.success) {
        setTaggedBusinesses((prev) =>
          prev.filter((t) => t.taggingId !== taggingId),
        );
      }
    } finally {
      setDeletingTaggingId(null);
    }
  };

  // 🔥 Remove wishlist item
  const handleRemoveFromWishlist = async (promotionId: string) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.Promotion.id !== promotionId),
    );
  };

  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row">
          {/* Saved Promotions */}
          <div className="flex-1">
            {/* Profile Card */}
            <div className="relative isolate mb-8 flex items-center gap-5 overflow-hidden rounded-3xl border border-white/10 p-5 sm:p-7">
              <SceneBackdrop name="orbit" fade="left" compact />
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full border-2 border-gold/60 object-cover shadow-[0_0_30px_hsl(var(--gold)/0.25)]"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/60 bg-card text-2xl font-bold text-gold shadow-[0_0_30px_hsl(var(--gold)/0.25)]">
                    {(user?.fullName || "U").charAt(0)}
                  </div>
                )}

                <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-background p-1 shadow" title="Change photo">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                    {isUploadingAvatar ? (
                      <Spinner className="animate-spin" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                  </div>
                </label>
              </div>

              <div>
                <p className="font-display text-xl font-semibold text-white">
                  {user?.fullName || "Your profile"}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <h2 className="mb-6 flex items-center gap-3 text-xl text-foreground">
              <span className="hd-sparkle" aria-hidden="true" />
              Saved deals
            </h2>

            {isLoadingWishlist ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[260px] animate-pulse rounded-[14px] border bg-secondary/60"
                  />
                ))}
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="hd-empty">
                <p className="font-medium text-foreground">No saved deals yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Open any deal and tap Save deal to keep it here.
                </p>
                <Link
                  href="/"
                  className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
                >
                  Browse deals
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3">
                {wishlistItems.map((item) => (
                  <PromotionCard
                    key={item.id}
                    promotion={item.Promotion}
                    isInWishlist={true}
                    onWishlistChange={handleRemoveFromWishlist}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tagged Businesses */}
          <div className="w-full lg:w-[380px] lg:shrink-0">
            <div className="mb-4">
              <h2 className="text-lg text-foreground md:text-xl">
                Tag the local spots you want deals from
              </h2>
              <div className="grid gap-4">
                <p className="mt-2 text-sm text-muted-foreground">
                  Once we have enough users “tagged,” we will reach out to that
                  business to join Hopping Deals!
                </p>
              </div>
            </div>
            <div className="hd-panel p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  Your tagged businesses
                </h3>

                <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  disabled={isTaggingBusiness}
                  aria-label="Tag a business"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-glow transition-colors hover:bg-primary-light"
                >
                  {isTaggingBusiness ? (
                    <Spinner className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>

              {showSearchInput && (
                <div className="mb-4 space-y-3">
                  <BusinessSearchInput
                    disabled={isTaggingBusiness}
                    onSelectBusiness={(place) =>
                      handleTagBusiness({
                        id: place.placeId,
                        name: place.name,
                        businessAddress:
                          place.formattedAddress || place.description,
                        iconMaskBaseUri: place.iconMaskBaseUri,
                        iconBackgroundColor: place.iconBackgroundColor,
                        primaryPhotoUrl: place.primaryPhotoUrl,
                        rating: place.rating,
                        userRatingsTotal: place.userRatingsTotal,
                        website: place.website,
                        url: place.url,
                        formattedPhoneNumber: place.formattedPhoneNumber,
                        internationalPhoneNumber:
                          place.internationalPhoneNumber,
                        types: place.types,
                        reviews: place.reviews,
                      })
                    }
                  />
                  {isTaggingBusiness && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Spinner className="h-4 w-4 animate-spin" />
                      Tagging business...
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {isLoadingTaggedBusinesses ? (
                  <div className="rounded-xl border border-dashed border-border bg-secondary/30 py-6 text-center">
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  </div>
                ) : taggedBusinesses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-secondary/30 py-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      No businesses tagged yet
                    </p>
                  </div>
                ) : (
                  taggedBusinesses.map((business) => (
                    <div
                      key={business.taggingId}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-3 transition-colors hover:bg-accent/60"
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        {business.primaryPhotoUrl ? (
                          <img
                            src={business.primaryPhotoUrl}
                            alt={business.name}
                            className="h-8 w-8 shrink-0 rounded object-cover border border-border bg-card"
                            loading="lazy"
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />
                        ) : business.iconMaskBaseUri ? (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border"
                            style={{
                              backgroundColor:
                                business.iconBackgroundColor || "#fee2e2",
                            }}
                          >
                            <img
                              src={`${business.iconMaskBaseUri}.png`}
                              alt=""
                              className="h-5 w-5"
                              loading="lazy"
                              onError={(e) => {
                                (
                                  e.currentTarget as HTMLImageElement
                                ).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/15">
                            <span className="text-sm font-bold text-primary-light">
                              {business.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {business.name}{" "}
                            <span className="text-xs font-normal text-muted-foreground">
                              ({business.location})
                            </span>
                          </p>
                          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                            {business.formattedPhoneNumber && (
                              <span className="truncate">
                                {business.formattedPhoneNumber}
                              </span>
                            )}
                            {business.rating !== null &&
                              business.rating !== undefined && (
                                <span className="whitespace-nowrap">
                                  {Number(business.rating).toFixed(1)}
                                  {business.userRatingsTotal
                                    ? ` (${business.userRatingsTotal})`
                                    : ""}
                                </span>
                              )}
                            {business.website && (
                              <a
                                href={business.website}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-2"
                              >
                                Website
                              </a>
                            )}
                            {!business.website && business.googleUrl && (
                              <a
                                href={business.googleUrl}
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

                      <button
                        type="button"
                        onClick={() => handleDeleteTagging(business.taggingId)}
                        disabled={deletingTaggingId === business.taggingId}
                        aria-label="Remove tag"
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
                        title="Remove tag"
                      >
                        {deletingTaggingId === business.taggingId ? (
                          <Spinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
