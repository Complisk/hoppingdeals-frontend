"use client";
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  submitSupportMessage,
  type SupportSenderType,
} from "@/services/supportService";
import { useToast } from "@/hooks/use-toast";

type Props = {
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerSize?: React.ComponentProps<typeof Button>["size"];
  defaultSenderType?: SupportSenderType;
};

const SupportMessageDialog = ({
  triggerLabel = "Message Support",
  triggerClassName,
  triggerVariant = "secondary",
  triggerSize = "default",
  defaultSenderType = "customer",
}: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [senderType, setSenderType] =
    useState<SupportSenderType>(defaultSenderType);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const canSubmit = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      email.trim().length >= 3 &&
      subject.trim().length >= 2 &&
      body.trim().length >= 2
    );
  }, [name, email, subject, body]);

  const reset = () => {
    setSenderType(defaultSenderType);
    setName("");
    setEmail("");
    setSubject("");
    setBody("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      await submitSupportMessage({
        senderType,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });
      toast({ title: "Sent", description: "Your message has been submitted." });
      reset();
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err?.message || "Could not send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={triggerClassName}
          variant={triggerVariant}
          size={triggerSize}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Support Message</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>I am a</Label>
            <Select
              value={senderType}
              onValueChange={(v) => setSenderType(v as SupportSenderType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">User</SelectItem>
                <SelectItem value="business">Business owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="support-name">Name</Label>
              <Input
                id="support-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Email</Label>
              <Input
                id="support-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What do you need help with?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="support-body">Message</Label>
            <Textarea
              id="support-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportMessageDialog;
