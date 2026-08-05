import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location Management",
  robots: { index: false, follow: false },
};

export default function AdminLocationsPage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold mb-2">Location Management</h1>
      <p className="text-muted-foreground">This page is under construction</p>
    </div>
  );
}
