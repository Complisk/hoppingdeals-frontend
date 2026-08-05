"use client";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { downloadSupportMessagesCsv, getSupportMessages, type SupportMessageRow, type SupportSenderTypeFilter } from "@/services/adminSupportService";
import { Search } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

const AdminSupportMessages = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [messages, setMessages] = useState<SupportMessageRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [senderType, setSenderType] = useState<SupportSenderTypeFilter>("all");

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await getSupportMessages({ page, limit, search, senderType });
      setMessages(res.messages || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to fetch messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, senderType]);

  const onSearch = () => {
    setPage(1);
    fetchList();
  };

  const typeBadge = (type: SupportMessageRow["senderType"]) =>
    type === "business" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800";

  const onExport = async () => {
    try {
      setExporting(true);
      await downloadSupportMessagesCsv({ search, senderType });
    } catch (e: any) {
      toast({
        title: "Export failed",
        description: e?.message || "Could not download CSV",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const pageLabel = useMemo(() => {
    return `Page ${page} of ${totalPages}`;
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Messages</h1>
          <p className="text-muted-foreground">Customer and business support inbox</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {total} Total
          </Badge>
          <Button variant="outline" onClick={onExport} disabled={exporting}>
            {exporting && <Spinner className="w-4 h-4 mr-2 animate-spin"  />}
            Download CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, subject, body..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pl-10"
          />
        </div>
        <Select
          value={senderType}
          onValueChange={(v) => {
            setSenderType(v as SupportSenderTypeFilter);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sender type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onSearch} disabled={loading}>
          {loading && <Spinner className="w-4 h-4 mr-2 animate-spin"  />}
          Search
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <Spinner className="h-8 w-8 animate-spin mx-auto mb-2"  />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No messages found.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">From</th>
                <th className="text-left p-4 font-medium">Subject</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-right p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <Badge className={typeBadge(m.senderType)}>{m.senderType}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{m.subject}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{m.body}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{m.subject}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{m.name}</span>{" "}
                            <span>({m.senderType})</span>{" "}
                            <span className="ml-2">{m.email}</span>
                          </div>
                          <div className="rounded-md border border-border bg-muted/20 p-4 whitespace-pre-wrap">
                            {m.body}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Received: {new Date(m.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pageLabel}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportMessages;
