"use client";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { setUserSuccess } from "@/store/authSlice";
import { Plus, Trash2 } from "lucide-react";
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
      <div className="p-4 md:p-8">
        <div className="flex md:flex-row flex-col max-w-7xl mx-auto justify-between gap-6">
          {/* Saved Promotions */}
          <div className="flex-1">
            {/* Profile Card */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
                    {(user?.fullName || "U").charAt(0)}
                  </div>
                )}

                <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-white p-1 shadow">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                    {isUploadingAvatar ? (
                      <Spinner className="animate-spin" />
                    ) : (
                      "✎"
                    )}
                  </div>
                </label>
              </div>

              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {user?.fullName || "Unknown User"}
                </p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <h2 className="mb-6 text-xl font-semibold text-slate-900">
              Saved Promotions:
            </h2>

            {isLoadingWishlist ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[220px] animate-pulse rounded-lg border bg-slate-100"
                  />
                ))}
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="flex items-center justify-center h-40 bg-slate-50 rounded-lg border border-dashed">
                <p className="text-slate-500">No saved promotions yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2">
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
          <div className="w-full md:w-[360px]">
            <div className="mb-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">
                Tag your favorite local businesses that you would like to see
                deals from (Name + location)
              </h2>
              <div className="grid gap-4">
                <p className="text-sm md:text-base text-slate-700 font-medium">
                  Once we have enough users “tagged,” we will reach out to that
                  business to join Hopping Deals!
                </p>
              </div>
            </div>
            <div className="border border-slate-300 rounded-lg p-6 bg-white">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-bold text-slate-900">
                  Businesses tag by you:
                </h3>

                <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  disabled={isTaggingBusiness}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition-colors"
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
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Spinner className="h-4 w-4 animate-spin" />
                      Tagging business...
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {isLoadingTaggedBusinesses ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-center">
                    <p className="text-xs text-slate-500">Loading...</p>
                  </div>
                ) : taggedBusinesses.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-center">
                    <p className="text-xs text-slate-500">
                      No businesses tagged yet
                    </p>
                  </div>
                ) : (
                  taggedBusinesses.map((business) => (
                    <div
                      key={business.taggingId}
                      className="flex items-start justify-between gap-3 rounded border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        {business.primaryPhotoUrl ? (
                          <img
                            src={business.primaryPhotoUrl}
                            alt={business.name}
                            className="h-8 w-8 shrink-0 rounded object-cover border border-slate-200 bg-white"
                            loading="lazy"
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />
                        ) : business.iconMaskBaseUri ? (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-slate-200"
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
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-red-100">
                            <span className="text-sm font-bold text-red-600">
                              {business.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {business.name}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              ({business.location})
                            </span>
                          </p>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5">
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
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-60"
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
