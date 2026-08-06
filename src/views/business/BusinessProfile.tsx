"use client";
import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { setBusinessSuccess } from "@/store/authSlice";
import { Plus, Trash2, Pencil, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import Header from "@/components/homePage/Header";
import BusinessSearchInput from "@/components/shared/BusinessSearchInput";
import PromotionCard from "@/components/public/PromotionCard";
import { useBusinessProfileService } from "@/services/businessProfileService";
import {
  getWishlist,
  WishlistItem,
  WishlistResponse,
} from "@/services/wishlistService";
import Spinner from "@/components/shared/Spinner";
import {
  createBusinessTagging,
  deleteBusinessTagging,
  listMyBusinessTaggings,
  type BusinessTaggingRow,
} from "@/services/businessTaggingService";
import { readCachedBusinessSubscription } from "@/services/subscriptionService";
import fetchData from "@/utils/apiAction";

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

interface BusinessLookup {
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

const BusinessProfile = () => {
  const business = useAppSelector((state) => state.auth.business);
  const token = useAppSelector((state) => state.auth.businessToken);
  const dispatch = useAppDispatch();
  const { updateProfile } = useBusinessProfileService();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    (business as any)?.logoUrl || null,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

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

  useEffect(() => {
    setAvatarPreview((business as any)?.logoUrl || null);
  }, [business?.logoUrl]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!business?.id) return;

      setIsLoadingSubscription(true);
      try {
        // Try to fetch fresh data from API
        const { response } = await fetchData(
          "/subscription/active",
          { method: "GET" },
          () => {},
          "business",
        );

        if (response) {
          setActiveSubscription(response);
        } else {
          // Fallback to cached subscription
          const cached = readCachedBusinessSubscription();
          setActiveSubscription(cached);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        // Fallback to cached subscription
        const cached = readCachedBusinessSubscription();
        setActiveSubscription(cached);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, [business?.id]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const { response, error } = await updateProfile(formData);
      if (error) {
        toast.error(error || "Failed to update logo");
        setAvatarPreview((business as any)?.logoUrl || null);
        return;
      }

      if (response) {
        dispatch(
          setBusinessSuccess({
            business: response,
            token: token || "",
          }),
        );
        setAvatarPreview(response.logoUrl || localPreview);
        toast.success("Logo updated");
      }
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploadingAvatar(false);
    }
  };

  const fetchWishlist = useCallback(async () => {
    if (!business?.id) return;
    setIsLoadingWishlist(true);
    try {
      const result = (await getWishlist(1, 50, "business")) as WishlistResponse;
      if (result?.success) {
        setWishlistItems(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setIsLoadingWishlist(false);
    }
  }, [business?.id]);

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
      const res = await listMyBusinessTaggings("business", 1, 200);
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

  const handleTagBusiness = async (selectedBusiness: BusinessLookup) => {
    setIsTaggingBusiness(true);
    try {
      const res = await createBusinessTagging("business", {
        placeId: selectedBusiness.id,
        name: selectedBusiness.name,
        address: selectedBusiness.businessAddress || undefined,
        iconMaskBaseUri: selectedBusiness.iconMaskBaseUri,
        iconBackgroundColor: selectedBusiness.iconBackgroundColor,
        primaryPhotoUrl: selectedBusiness.primaryPhotoUrl,
        rating: selectedBusiness.rating,
        userRatingsTotal: selectedBusiness.userRatingsTotal,
        website: selectedBusiness.website,
        url: selectedBusiness.url,
        formattedPhoneNumber: selectedBusiness.formattedPhoneNumber,
        internationalPhoneNumber: selectedBusiness.internationalPhoneNumber,
        types: selectedBusiness.types,
        reviews: selectedBusiness.reviews,
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
      const res = await deleteBusinessTagging("business", taggingId);
      if (res.success) {
        setTaggedBusinesses((prev) =>
          prev.filter((item) => item.taggingId !== taggingId),
        );
      }
    } finally {
      setDeletingTaggingId(null);
    }
  };

  const handleRemoveFromWishlist = async (promotionId: string) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.Promotion?.id !== promotionId),
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isSubscriptionActive = () => {
    if (!activeSubscription) return false;
    const endDate = new Date(activeSubscription.endDate);
    return endDate > new Date() && activeSubscription.status === "active";
  };

  return (
    <>
      <Header light />
      <div className="p-4 md:p-8">
        <div className="flex md:flex-row flex-col max-w-7xl mx-auto justify-between gap-6">
          <div className="flex-1">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Business logo"
                    className="h-20 w-20 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
                    {(business?.name || "B").charAt(0)}
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
                      <Spinner className="animate-spin h-4 w-4" />
                    ) : (
                      <Pencil className="h-3.5 w-3.5" />
                    )}
                  </div>
                </label>
              </div>

              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {business?.name || "Business"}
                </p>
                <p className="text-sm text-slate-500">
                  {business?.email || "-"}
                </p>
                {business?.phone && (
                  <p className="text-sm text-slate-500">{business?.phone}</p>
                )}

                {/* Subscription Info */}
                <div className="mt-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {isLoadingSubscription ? (
                    <Spinner className="h-4 w-4 animate-spin" />
                  ) : activeSubscription && isSubscriptionActive() ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                      <span className="text-xs text-slate-600">
                        {formatDate(activeSubscription.startDate)} -{" "}
                        {formatDate(activeSubscription.endDate)}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href="/business/subscription"
                      className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
                    >
                      Subscribe now
                    </Link>
                  )}
                </div>
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
                  taggedBusinesses.map((item) => (
                    <div
                      key={item.taggingId}
                      className="flex items-start justify-between gap-3 rounded border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        {item.primaryPhotoUrl ? (
                          <img
                            src={item.primaryPhotoUrl}
                            alt={item.name}
                            className="h-8 w-8 shrink-0 rounded object-cover border border-slate-200 bg-white"
                            loading="lazy"
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />
                        ) : item.iconMaskBaseUri ? (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-slate-200"
                            style={{
                              backgroundColor:
                                item.iconBackgroundColor || "#fee2e2",
                            }}
                          >
                            <img
                              src={`${item.iconMaskBaseUri}.png`}
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
                              {item.name.charAt(0)}
                            </span>
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.name}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              ({item.location})
                            </span>
                          </p>
                          <div className="text-xs text-slate-500 flex flex-wrap gap-x-2 gap-y-0.5">
                            {item.formattedPhoneNumber && (
                              <span className="truncate">
                                {item.formattedPhoneNumber}
                              </span>
                            )}
                            {item.rating !== null &&
                              item.rating !== undefined && (
                                <span className="whitespace-nowrap">
                                  {Number(item.rating).toFixed(1)}
                                  {item.userRatingsTotal
                                    ? ` (${item.userRatingsTotal})`
                                    : ""}
                                </span>
                              )}
                            {item.website && (
                              <a
                                href={item.website}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-2"
                              >
                                Website
                              </a>
                            )}
                            {!item.website && item.googleUrl && (
                              <a
                                href={item.googleUrl}
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
                        onClick={() => handleDeleteTagging(item.taggingId)}
                        disabled={deletingTaggingId === item.taggingId}
                        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                        title="Remove tag"
                      >
                        {deletingTaggingId === item.taggingId ? (
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

export default BusinessProfile;
