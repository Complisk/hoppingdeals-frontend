"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PromotionVisualCard } from "@/components/shared/PromotionVisualCard";
import { useSubscriptionService } from "@/services/subscriptionService";
import {
  useBusinessPromotionTemplateService,
  type BusinessPromotionTemplate,
} from "@/services/businessPromotionTemplateService";
import { Eye, Pencil, Plus, Trash2, Wand2 } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

const PromotionTemplates = () => {
  const router = useRouter();
  const { getTemplates, deleteTemplate } =
    useBusinessPromotionTemplateService();
  const { getActive, getCachedActive } = useSubscriptionService();

  const [templates, setTemplates] = useState<BusinessPromotionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<BusinessPromotionTemplate | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [templateToPreview, setTemplateToPreview] =
    useState<BusinessPromotionTemplate | null>(null);

  const hasActiveSubscription = Boolean(activeSubscription);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const list = await getTemplates();
      setTemplates(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const cached = getCachedActive();
    if (cached) setActiveSubscription(cached);

    const refresh = async () => {
      try {
        const sub = await getActive();
        setActiveSubscription(sub);
      } catch {
        setActiveSubscription(null);
      }
    };

    refresh();
  }, []);

  const handleUseTemplate = (template: BusinessPromotionTemplate) => {
    if (!hasActiveSubscription) {
      toast.info(
        "You need an active subscription before using a promotion template.",
      );
      router.push("/business/subscription");
      return;
    }

    router.push(`/business/create-promotion?businessTemplateId=${template.id}`);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      setDeletingTemplateId(templateToDelete.id);
      await deleteTemplate(templateToDelete.id);
      toast.success("Template deleted successfully");
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      await loadTemplates();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete template");
    } finally {
      setDeletingTemplateId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Promotion Templates
          </h1>
          <p className="text-muted-foreground">
            Choose a saved template to launch promotions faster
          </p>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link href="/business/promotion-templates/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      <section className="rounded-2xl  p-4 w-full flex justify-center sm:p-6">
        {loadingTemplates ? (
          <div className="text-sm mx-auto text-center py-4">
            <Spinner />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No templates found. Create your first template.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className="rounded-xl border border-border overflow-hidden bg-background"
              >
                <PromotionVisualCard
                  imageUrl={template.imageUrl}
                  backgroundColor={template.backgroundColor || ""}
                  text={template.text || []}
                  className="aspect-video"
                />
                <div className="space-y-3 p-4">
                  <div>
                    <p className="font-semibold truncate">
                      Template {index + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated{" "}
                      {new Date(template.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTemplateToPreview(template);
                        setPreviewModalOpen(true);
                      }}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      title={
                        hasActiveSubscription
                          ? "Use this template"
                          : "Subscription required before use"
                      }
                    >
                      <Wand2 className="mr-1 h-4 w-4" />
                      Use Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/business/promotion-templates/${template.id}/edit`,
                        )
                      }
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTemplateToDelete(template);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-1 h-4 w-4 text-destructive" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Full template preview before using it in promotion creation
            </DialogDescription>
          </DialogHeader>
          {templateToPreview && (
            <div className="space-y-4">
              <PromotionVisualCard
                imageUrl={templateToPreview.imageUrl}
                backgroundColor={templateToPreview.backgroundColor || ""}
                text={templateToPreview.text || []}
                className="w-full aspect-[4/3] rounded-lg border border-border"
              />
              {templateToPreview?.metadata?.promotionDescription && (
                <p className="text-sm text-muted-foreground">
                  {String(templateToPreview.metadata.promotionDescription)}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewModalOpen(false)}
            >
              Close
            </Button>
            {templateToPreview && (
              <Button onClick={() => handleUseTemplate(templateToPreview)}>
                Use Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              This will permanently delete this promotion template.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={Boolean(deletingTemplateId)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTemplate}
              disabled={Boolean(deletingTemplateId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotionTemplates;
