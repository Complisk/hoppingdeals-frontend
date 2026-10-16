"use server";

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./tags";

/** Immediate hard expiry: the next read fetches fresh data. */
const IMMEDIATE = { expire: 0 };

function invalidateTags(tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag, IMMEDIATE);
  }
}

/** Any promotion changed — invalidate the shared promotions list. */
export async function revalidatePromotionsCache() {
  invalidateTags([CACHE_TAGS.promotions]);
}

/** A single promotion changed — invalidate its entry and the list. */
export async function revalidatePromotionCache(id: string | number) {
  invalidateTags([CACHE_TAGS.promotions, CACHE_TAGS.promotion(id)]);
}

export async function revalidatePhotosCache() {
  invalidateTags([CACHE_TAGS.photos]);
}

export async function revalidatePhotoCache(id: string | number) {
  invalidateTags([CACHE_TAGS.photos, CACHE_TAGS.photo(id)]);
}

export async function revalidateTemplatesCache() {
  invalidateTags([CACHE_TAGS.templates]);
}

export async function revalidateBusinessesCache() {
  invalidateTags([CACHE_TAGS.businesses]);
}

export async function revalidateBusinessCache(id: string | number) {
  invalidateTags([CACHE_TAGS.businesses, CACHE_TAGS.business(id)]);
}

export async function revalidateCategoriesCache() {
  invalidateTags([CACHE_TAGS.categories]);
}

export async function revalidateSubscriptionTemplatesCache() {
  invalidateTags([CACHE_TAGS.subscriptionTemplates]);
}

export async function revalidateSupportMessagesCache() {
  invalidateTags([CACHE_TAGS.supportMessages]);
}

export async function revalidateBusinessTaggingsCache() {
  invalidateTags([CACHE_TAGS.businessTaggings]);
}
