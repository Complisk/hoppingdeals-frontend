"use client";
import { useEffect, useMemo, useState } from "react";
import { useBusinessProfileService } from "@/services/businessProfileService";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { setBusinessSuccess } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

const BusinessPublicProfile = () => {
  const dispatch = useAppDispatch();
  const { businessToken } = useAppSelector((state) => state.auth);
  const { getProfile, updateProfile } = useBusinessProfileService();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    personName: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.phone.trim().length > 0
    );
  }, [form]);

  const applyProfile = (nextProfile: any) => {
    setProfile(nextProfile || null);
    setLogoPreview(nextProfile?.logoUrl || null);
    setForm({
      name: String(nextProfile?.name || ""),
      email: String(nextProfile?.email || ""),
      phone: String(nextProfile?.phone || ""),
      personName: String(nextProfile?.personName || ""),
    });
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { response } = await getProfile();
      if (!cancelled) {
        applyProfile(response || null);
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!canSubmit) {
      toast.error("Name, email and phone are required");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("email", form.email.trim().toLowerCase());
    payload.append("phone", form.phone.trim());
    payload.append("personName", form.personName.trim());
    if (logoFile) {
      payload.append("logo", logoFile);
    }

    setSaving(true);
    const { response, error } = await updateProfile(payload);
    setSaving(false);

    if (error) {
      toast.error(error || "Failed to update profile");
      return;
    }

    if (response) {
      applyProfile(response);
      if (businessToken) {
        dispatch(
          setBusinessSuccess({
            business: response,
            token: businessToken,
          }),
        );
      }
    }

    setLogoFile(null);
    setEditOpen(false);
    toast.success("Profile updated successfully");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading public profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Public Profile</h1>
          <p className="text-muted-foreground">
            This is how your business profile appears to visitors
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => setEditOpen(true)}
        >
          Edit Profile
        </Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
            {profile?.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={`${profile?.name || "Business"} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">
                {String(profile?.name || "B")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              {profile?.name || "Business"}
            </h2>
            <p className="text-sm text-muted-foreground">Business profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PublicField label="Email" value={profile?.email} />
          <PublicField label="Phone" value={profile?.phone} />
          <PublicField
            label="Contact Person Name"
            value={profile?.personName}
          />
        </div>
      </section>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Business logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {String(form.name || "B")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Business name"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="business@example.com"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1..."
              />
            </div>

            <div className="space-y-2">
              <Label>Contact Person Name</Label>
              <Input
                value={form.personName}
                onChange={(e) => handleChange("personName", e.target.value)}
                placeholder="Owner / manager name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSubmit || saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PublicField = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value?: string | null;
  className?: string;
}) => (
  <div className={className}>
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="text-sm text-foreground">{String(value || "-")}</p>
  </div>
);

export default BusinessPublicProfile;
