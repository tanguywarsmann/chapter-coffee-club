import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type RequestStatus = "pending" | "processing" | "completed";

export default function AdminBookRequests() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-book-requests", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("book_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data: requestsData, error } = await query;
      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(requestsData?.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, email")
        .in("id", userIds);

      // Merge profiles with requests
      const profilesMap = new Map(profiles?.map((p) => [p.id, p]));
      return requestsData?.map((req) => ({
        ...req,
        profile: profilesMap.get(req.user_id),
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
      const { error } = await supabase
        .from("book_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-book-requests"] });
      toast.success("Statut mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-h3 font-medium">Demandes de livres</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="processing">En traitement</SelectItem>
              <SelectItem value="completed">Complété</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="text-sm">
                      {format(new Date(request.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {request.profile?.username || request.profile?.email || "—"}
                    </TableCell>
                    <TableCell className="font-medium">{request.book_title}</TableCell>
                    <TableCell className="text-sm">{request.book_author || "—"}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {request.reason || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          request.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : request.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {request.status === "pending" && "En attente"}
                        {request.status === "processing" && "En traitement"}
                        {request.status === "completed" && "Complété"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={request.status}
                        onValueChange={(value: RequestStatus) =>
                          updateStatusMutation.mutate({ id: request.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="processing">En traitement</SelectItem>
                          <SelectItem value="completed">Complété</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {!requests?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
