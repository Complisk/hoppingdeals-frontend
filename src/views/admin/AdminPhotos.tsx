"use client";
import { useEffect, useMemo, useState } from "react";
import { Images, Pencil, Plus, Search, Trash2, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  PermissionButton,
  PermissionGuard,
} from "@/components/shared/PermissionGuard";
import OptimizeImage from "@/components/shared/OptimizeImage";
import Spinner from "@/components/shared/Spinner";
import { useToast } from "@/hooks/use-toast";
import {
  photoService,
  type PhotoFormValues,
  type PhotoItem,
} from "@/services/photoService";

const defaultFormState: PhotoFormValues = {
  title: "",
  description: "",
  altText: "",
  isActive: true,
  sortOrder: 0,
  image: null,
};

// File size constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const AdminPhotos = () => {
  const { toast } = useToast();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [formValues, setFormValues] =
    useState<PhotoFormValues>(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await photoService.getAdminPhotos(
        appliedSearch,
        statusFilter,
      );
      setPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Failed to load photos",
        description:
          error instanceof Error ? error.message : "Please try again shortly",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [appliedSearch, statusFilter]);

  const stats = useMemo(() => {
    const active = photos.filter((photo) => photo.isActive).length;
    return {
      total: photos.length,
      active,
      inactive: photos.length - active,
    };
  }, [photos]);

  const resetForm = () => {
    setEditingPhoto(null);
    setFormValues(defaultFormState);
    setFileError(null);
    setSelectedFileName(null);
    setSelectedFileSize(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError(null);

    if (!file) {
      setFormValues((current) => ({
        ...current,
        image: null,
      }));
      setSelectedFileName(null);
      setSelectedFileSize(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError(
        `Invalid file type. Allowed types: JPEG, PNG, WebP, GIF. You selected: ${file.type || "unknown"}`
      );
      setFormValues((current) => ({
        ...current,
        image: null,
      }));
      setSelectedFileName(null);
      setSelectedFileSize(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File size (${formatFileSize(file.size)}) exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB`
      );
      setFormValues((current) => ({
        ...current,
        image: null,
      }));
      setSelectedFileName(null);
      setSelectedFileSize(null);
      return;
    }

    // File is valid
    setFormValues((current) => ({
      ...current,
      image: file,
    }));
    setSelectedFileName(file.name);
    setSelectedFileSize(formatFileSize(file.size));
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (photo: PhotoItem) => {
    setEditingPhoto(photo);
    setFormValues({
      title: photo.title || "",
      description: photo.description || "",
      altText: photo.altText || photo.title || "",
      isActive: photo.isActive,
      sortOrder: Number(photo.sortOrder || 0),
      image: null,
    });
    setDialogOpen(true);
  };

  const closeDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
      setFileError(null);
    }
  };

  const handleSave = async () => {
    if (!formValues.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a photo header/title.",
        variant: "destructive",
      });
      return;
    }

    if (fileError) {
      toast({
        title: "Invalid file",
        description: fileError,
        variant: "destructive",
      });
      return;
    }

    if (!editingPhoto && !formValues.image) {
      toast({
        title: "Missing image",
        description: "Please select a photo image to upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingPhoto) {
        await photoService.updatePhoto(editingPhoto.id, formValues);
        toast({
          title: "Photo updated",
          description: "The gallery item was updated successfully.",
        });
      } else {
        await photoService.createPhoto(formValues);
        toast({
          title: "Photo created",
          description: "The gallery item was added successfully.",
        });
      }

      closeDialog(false);
      await loadPhotos();
    } catch (error) {
      toast({
        title: editingPhoto ? "Update failed" : "Create failed",
        description:
          error instanceof Error ? error.message : "Please try again shortly",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photo: PhotoItem) => {
    if (!window.confirm(`Delete "${photo.title}" from the gallery?`)) {
      return;
    }

    try {
      setDeletingId(photo.id);
      await photoService.deletePhoto(photo.id);
      toast({
        title: "Photo deleted",
        description: "The gallery item was removed successfully.",
      });
      await loadPhotos();
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Please try again shortly",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PermissionGuard
      module="photos"
      action="view"
      fallback={
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to view photo gallery management.
            </CardDescription>
          </CardHeader>
        </Card>
      }
      silent={false}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Photos Gallery
            </h1>
            <p className="text-muted-foreground">
              Manage the public photos page with image, header, and paragraph
              content.
            </p>
          </div>

          <PermissionGuard module="photos" action="create">
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Photo
            </Button>
          </PermissionGuard>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Items</CardDescription>
              <CardTitle>{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active on Public Page</CardDescription>
              <CardTitle>{stats.active}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Inactive Items</CardDescription>
              <CardTitle>{stats.inactive}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Photos</CardTitle>
            <CardDescription>
              Search by title, paragraph, or alt text.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setAppliedSearch(searchQuery);
                  }
                }}
                placeholder="Search photos..."
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "all" | "active" | "inactive")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All photos</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="inactive">Inactive only</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setAppliedSearch(searchQuery)}
              disabled={loading}
            >
              Search
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gallery Items</CardTitle>
            <CardDescription>
              Active items are visible on the public photos page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : photos.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed">
                <Images className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-base font-medium">No gallery items found</p>
                <p className="text-sm text-muted-foreground">
                  Add your first photo to show it on the public page.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-xl border bg-card"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {photo.cloudinaryPublicId ? (
                        <OptimizeImage
                          publicId={photo.cloudinaryPublicId}
                          alt={photo.altText || photo.title}
                          className="h-full w-full "
                        />
                      ) : (
                        <img
                          src={photo.imageUrl}
                          alt={photo.altText || photo.title}
                          className="h-full w-full "
                          loading="lazy"
                        />
                      )}
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-1 text-lg font-semibold">
                            {photo.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Sort Order: {photo.sortOrder}
                          </p>
                        </div>
                        <Badge
                          variant={photo.isActive ? "default" : "secondary"}
                        >
                          {photo.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {photo.description || "No paragraph added yet."}
                      </p>

                      <div className="flex gap-2">
                        <PermissionButton
                          module="photos"
                          action="edit"
                          onClick={() => openEditDialog(photo)}
                          className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </PermissionButton>

                        <PermissionButton
                          module="photos"
                          action="delete"
                          onClick={() => handleDelete(photo)}
                          disabled={deletingId === photo.id}
                          className="inline-flex items-center rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === photo.id ? "Deleting..." : "Delete"}
                        </PermissionButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPhoto ? "Edit Photo" : "Add Photo"}
              </DialogTitle>
              <DialogDescription>
                Save the image, header, and paragraph that should appear on the
                public gallery page.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-title">Header / Title</Label>
                <Input
                  id="photo-title"
                  value={formValues.title}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. Hopping Deals App Installation Guide"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo-description">
                  Paragraph / Description
                </Label>
                <Textarea
                  id="photo-description"
                  value={formValues.description}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Write the paragraph to show below the photo..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="photo-sort-order">Sort Order</Label>
                  <Input
                    id="photo-sort-order"
                    type="number"
                    value={String(formValues.sortOrder)}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        sortOrder: Number(event.target.value || 0),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo-image">Image</Label>
                  <Input
                    id="photo-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    {editingPhoto
                      ? "Choose a new file only if you want to replace the current image."
                      : "Upload the image that should appear on the public page."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: {MAX_FILE_SIZE_MB}MB • Formats: JPEG, PNG, WebP, GIF
                  </p>
                  {selectedFileName && !fileError && (
                    <div className="rounded bg-green-50 p-2">
                      <p className="text-xs text-green-700">
                        ✓ Selected: {selectedFileName} ({selectedFileSize})
                      </p>
                    </div>
                  )}
                  {fileError && (
                    <div className="flex gap-2 rounded border border-red-200 bg-red-50 p-3">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
                      <p className="text-xs text-red-700">{fileError}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Show on public gallery</p>
                  <p className="text-xs text-muted-foreground">
                    Turn this off to hide the photo without deleting it.
                  </p>
                </div>
                <Switch
                  checked={formValues.isActive}
                  onCheckedChange={(checked) =>
                    setFormValues((current) => ({
                      ...current,
                      isActive: checked,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => closeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingPhoto ? (
                  "Update Photo"
                ) : (
                  "Create Photo"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default AdminPhotos;
