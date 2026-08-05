"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OptimizeImage from "../shared/OptimizeImage";
import Spinner from "@/components/shared/Spinner";
import { uploadImageToCloudinary } from "@/utils/cloudinaryUtils";

interface Template {
  id: string;
  name: string;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 5MB for single file
const UPLOAD_TIMEOUT_MS = 60000; // 60 seconds for single file

const AdminTemplateUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const getAdminToken = () => localStorage.getItem("adminToken");

  const readJsonSafe = async <T,>(res: Response): Promise<T | null> => {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    setFetchingTemplates(true);
    try {
      const token = getAdminToken();
      if (!token) {
        throw new Error("Admin token is missing. Please log in again.");
      }

      const res = await fetch(`${API_BASE}/admin/templates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await readJsonSafe<Template[] | { message?: string }>(res);

      if (!res.ok) {
        throw new Error(
          !Array.isArray(data) && data?.message
            ? data.message
            : "Failed to load templates",
        );
      }

      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Failed to load templates",
        description:
          error instanceof Error ? error.message : "Please try again shortly",
        variant: "destructive",
      });
    } finally {
      setFetchingTemplates(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // File select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) {
      setFile(null);
      return;
    }

    // Validate file type and size
    if (!selected.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description: `File must be under 10MB (file is ${(selected.size / 1024 / 1024).toFixed(2)}MB)`,
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }

    setFile(selected);
  };

  // Upload
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    const token = getAdminToken();
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again and retry upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      UPLOAD_TIMEOUT_MS,
    );

    try {
      // Step 1: Upload image directly to Cloudinary
      toast({
        title: "Uploading to Cloudinary...",
        description: "Please wait while your image is being uploaded",
      });

      const { url: cloudinaryUrl, publicId: cloudinaryPublicId } = await uploadImageToCloudinary(file);

      // Step 2: Save template to backend with Cloudinary URL and Public ID
      const templateName =
        file.name.replace(/\.[^/.]+$/, "").trim() || "template";

      const res = await fetch(`${API_BASE}/admin/templates/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: templateName,
          imageUrl: cloudinaryUrl,
          cloudinaryPublicId: cloudinaryPublicId,
        }),
        signal: controller.signal,
      });

      const data = await readJsonSafe<{
        message?: string;
        id?: string;
        name?: string;
      }>(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save template");
      }

      toast({
        title: "Success",
        description: "Template uploaded successfully",
      });

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchTemplates();
    } catch (error) {
      const description =
        error instanceof DOMException && error.name === "AbortError"
          ? "Upload timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to upload image";

      toast({
        title: "Upload failed",
        description,
        variant: "destructive",
      });
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;

    const token = getAdminToken();
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in again to delete templates",
        variant: "destructive",
      });
      return;
    }

    setDeletingTemplateId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/templates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await readJsonSafe<{ message?: string }>(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete template");
      }

      toast({
        title: "Template deleted",
        description: data?.message || "Template deleted successfully",
      });
      await fetchTemplates();
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setDeletingTemplateId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Template</CardTitle>
          <CardDescription>
            Upload a single template image (fast and reliable)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading || Boolean(deletingTemplateId)}
          />
          <p className="text-sm text-muted-foreground">
            {file
              ? `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
              : "Allowed: image files only, up to 5MB."}
          </p>

          {file && (
            <div className="border rounded-lg overflow-hidden bg-gray-100">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="w-full h-64 object-contain"
              />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || loading || Boolean(deletingTemplateId)}
            className="w-full"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Template
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchingTemplates ? (
            <Spinner className="animate-spin" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.length ? (
                templates.map((t) => (
                  <div key={t.id} className="border rounded">
                    {t.cloudinaryPublicId ? (
                      <OptimizeImage
                        publicId={t.cloudinaryPublicId}
                        alt={t.name}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-2">
                      <p className="text-sm mb-2 break-all">{t.name}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="w-full"
                        disabled={Boolean(deletingTemplateId) || loading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingTemplateId === t.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-full">
                  No templates uploaded yet.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTemplateUpload;
