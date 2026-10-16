import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/auth",
        "/login",
        "/user",
        "/control",
        "/business/login",
        "/business/register",
        "/business/visitor",
        "/business/forgot-password",
        "/business/reset-password",
        "/business/dashboard",
        "/business/promotions",
        "/business/create-promotion",
        "/business/edit-promotion",
        "/business/promotion-templates",
        "/business/checkout",
        "/business/subscription",
        "/business/payment-success",
        "/business/subscription-success",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
