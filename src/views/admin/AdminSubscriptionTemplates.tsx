"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionTemplateService } from "@/services/subscriptionTemplateService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit2 } from "lucide-react";
import type { SubscriptionTemplate } from "@/services/subscriptionTemplateService";
import Spinner from "@/components/shared/Spinner";

const AdminSubscriptionTemplates = () => {
  const { toast } = useToast();
  const { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } =
    useSubscriptionTemplateService();

  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    durationMonths: 1,
    price: 0,
    freeCities: 2,
    freeStates: 0,
    freeTimezones: 0,
  });

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error: any) {
      console.error("Failed to fetch templates:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      durationMonths: 1,
      price: 0,
      freeCities: 2,
      freeStates: 0,
      freeTimezones: 0,
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setEditingTemplateId(null);
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: SubscriptionTemplate) => {
    setEditingTemplateId(template.id);
    setFormData({
      name: template.name,
      durationMonths: Number(template.durationMonths || 1),
      price: Number(template.price || 0),
      freeCities: Number(template.freeCities || 0),
      freeStates: Number(template.freeStates || 0),
      freeTimezones: Number(template.freeTimezones || 0),
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate form
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Template name is required",
          variant: "destructive",
        });
        return;
      }

      if (formData.durationMonths < 1) {
        toast({
          title: "Validation Error",
          description: "Duration must be at least 1 month",
          variant: "destructive",
        });
        return;
      }

      if (formData.price < 0) {
        toast({
          title: "Validation Error",
          description: "Price cannot be negative",
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      if (editingTemplateId) {
        await updateTemplate(editingTemplateId, {
          ...formData,
          isActive: true,
        });
      } else {
        await createTemplate({
          ...formData,
          isActive: true,
        });
      }

      toast({
        title: "Success",
        description: editingTemplateId
          ? "Subscription template updated successfully"
          : "Subscription template created successfully",
      });

      setIsDialogOpen(false);
      setEditingTemplateId(null);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error("Failed to create template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await deleteTemplate(id);

      toast({
        title: "Success",
        description: "Subscription template deleted successfully",
      });

      fetchTemplates();
    } catch (error: any) {
      console.error("Failed to delete template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscription template",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    const value =
      field === "name"
        ? e.target.value
        : field === "price"
          ? parseFloat(e.target.value) || 0
          : parseInt(e.target.value) || 0;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscription Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage subscription plans available for businesses
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-8 w-8 animate-spin"  />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground mb-4">
            No subscription templates created yet.
          </p>
          <Button onClick={handleOpenDialog} variant="outline">
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Free Cities</TableHead>
                <TableHead className="text-center">Free States</TableHead>
                <TableHead className="text-center">Free Timezones</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="text-right">
                    {template.durationMonths} month
                    {template.durationMonths > 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    ${Number(template.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {template.freeCities}
                  </TableCell>
                  <TableCell className="text-center">
                    {template.freeStates}
                  </TableCell>
                  <TableCell className="text-center">
                    {template.freeTimezones}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        template.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mr-1"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      disabled={isDeleting === template.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === template.id ? (
                        <Spinner className="h-4 w-4 animate-spin"  />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTemplateId
                ? "Edit Subscription Template"
                : "Create New Subscription Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Template Name */}
            <div>
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Starter Plan, Pro Plan"
                value={formData.name}
                onChange={(e) => handleInputChange(e, "name")}
                className="mt-1"
              />
            </div>

            {/* Duration Months */}
            <div>
              <Label htmlFor="durationMonths">Duration (Months)</Label>
              <Input
                id="durationMonths"
                type="number"
                min="1"
                value={formData.durationMonths}
                onChange={(e) => handleInputChange(e, "durationMonths")}
                className="mt-1"
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange(e, "price")}
                className="mt-1"
              />
            </div>

            {/* Free Cities */}
            <div>
              <Label htmlFor="freeCities">Free Cities</Label>
              <Input
                id="freeCities"
                type="number"
                min="0"
                value={formData.freeCities}
                onChange={(e) => handleInputChange(e, "freeCities")}
                className="mt-1"
              />
            </div>

            {/* Free States */}
            <div>
              <Label htmlFor="freeStates">Free States</Label>
              <Input
                id="freeStates"
                type="number"
                min="0"
                value={formData.freeStates}
                onChange={(e) => handleInputChange(e, "freeStates")}
                className="mt-1"
              />
            </div>

            {/* Free Timezones */}
            <div>
              <Label htmlFor="freeTimezones">Free Timezones</Label>
              <Input
                id="freeTimezones"
                type="number"
                min="0"
                value={formData.freeTimezones}
                onChange={(e) => handleInputChange(e, "freeTimezones")}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingTemplateId(null);
                resetForm();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner className="mr-2 h-4 w-4 animate-spin"  />
                  {editingTemplateId ? "Updating..." : "Creating..."}
                </>
              ) : (
                `${editingTemplateId ? "Update" : "Create"} Template`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptionTemplates;
