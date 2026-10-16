"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { TextCustomizer } from "@/components/business/TextCustomizer";
import {
  TemplateSelector,
  type TemplateSelection,
} from "@/components/business/TemplateSelector";
import { useBusinessPromotionTemplateService } from "@/services/businessPromotionTemplateService";

interface TextItem {
  id: string;
  content: string;
  color: string;
  fontSize: string;
  x: number;
  y: number;
}

const createDefaultText = (): TextItem[] => [
  {
    id: Date.now().toString(),
    content: "",
    color: "#ffffff",
    fontSize: "24",
    x: 50,
    y: 50,
  },
];

const PromotionTemplateEditor = () => {
  const router = useRouter();
  const { templateId } = useParams<{ templateId: string }>();
  const isEditMode = Boolean(templateId);
  const { getTemplateById, createTemplate, updateTemplate } =
    useBusinessPromotionTemplateService();

  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [templateColors, setTemplateColors] = useState<string[] | null>(null);
  const [promotionText, setPromotionText] = useState<TextItem[]>(
    createDefaultText(),
  );
  const [backgroundColor, setBackgroundColor] = useState<string | number | null>(
    null,
  );
  const [promotionDescription, setPromotionDescription] = useState("");

  const canSubmit = useMemo(() => {
    return Boolean(customImage);
  }, [customImage]);

  useEffect(() => {
    if (!isEditMode || !templateId) return;
    let cancelled = false;

    const loadTemplate = async () => {
      try {
        setLoadingTemplate(true);
        const template = await getTemplateById(templateId);
        if (!template || cancelled) return;

        setSelectedTemplate(template.templateId || null);
        setSelectedTemplateId(template.templateId || null);
        setCustomImage(template.imageUrl || null);
        setPromotionText(
          Array.isArray(template.text) && template.text.length
            ? template.text
            : createDefaultText(),
        );
        setBackgroundColor(template.backgroundColor ?? null);
        setTemplateColors(
          Array.isArray(template?.metadata?.templateColors)
            ? template.metadata.templateColors
            : null,
        );
        setPromotionDescription(
          String(template?.metadata?.promotionDescription || ""),
        );
      } catch (error: any) {
        toast.error(error?.message || "Failed to load template");
        router.push("/business/promotion-templates");
      } finally {
        if (!cancelled) setLoadingTemplate(false);
      }
    };

    loadTemplate();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, templateId, router]);

  const handleTemplateSelect = (template: TemplateSelection) => {
    setSelectedTemplate(template.id);
    setCustomImage(template.imageUrl);
    const resolvedTemplateId =
      template.templateId === undefined ? template.id : template.templateId;
    setSelectedTemplateId(resolvedTemplateId);
    setTemplateColors(template.colors ?? null);
  };

  const handleImageUpload = (imageData: string) => {
    setCustomImage(imageData);
    setSelectedTemplate(null);
    setSelectedTemplateId(null);
    setTemplateColors(null);
  };

  const handleSaveTemplate = async () => {
    if (!canSubmit) {
      toast.error("Template image is required");
      return;
    }

    const payload = {
      templateId: selectedTemplateId || null,
      imageUrl: customImage || "",
      text: promotionText,
      backgroundColor,
      metadata: {
        promotionDescription,
        ...(templateColors?.length ? { templateColors } : {}),
      },
    };

    try {
      setSavingTemplate(true);
      if (isEditMode && templateId) {
        await updateTemplate(templateId, payload);
        toast.success("Template saved successfully");
      } else {
        await createTemplate(payload);
        toast.success("Template saved successfully");
      }
      router.push("/business/promotion-templates");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save template");
    } finally {
      setSavingTemplate(false);
    }
  };

  if (loadingTemplate) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Loading template...
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {isEditMode ? "Edit Template" : "Create Template"}
          </h1>
          <p className="text-muted-foreground">
            Build your style template now and save it for quick reuse
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/business/promotion-templates">Back to Templates</Link>
        </Button>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-6">
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          onTemplateSelect={handleTemplateSelect}
          onImageUpload={handleImageUpload}
        />

        <TextCustomizer
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          promotionText={promotionText}
          backgroundColor={backgroundColor}
          onTextChange={(text) => {
            if (Array.isArray(text)) {
              setPromotionText(text as TextItem[]);
            }
          }}
          onBackgroundColorChange={setBackgroundColor}
          promotionDescription={promotionDescription}
          onPromotionDescriptionChange={setPromotionDescription}
          onImageUpload={handleImageUpload}
        />

        <div className="flex justify-end">
          <Button onClick={handleSaveTemplate} disabled={!canSubmit || savingTemplate}>
            {savingTemplate ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PromotionTemplateEditor;
