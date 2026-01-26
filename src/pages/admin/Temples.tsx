import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Building2, Loader2, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Temple {
  id: string;
  name: string;
  deity: string | null;
  location: string | null;
  state: string | null;
  city: string | null;
  description: string | null;
  image_url: string | null;
  contact_phone: string | null;
  website_url: string | null;
  is_partner: boolean | null;
  is_active: boolean | null;
}

const emptyTemple: Partial<Temple> = {
  name: "",
  deity: "",
  location: "",
  state: "",
  city: "",
  description: "",
  image_url: "",
  contact_phone: "",
  website_url: "",
  is_partner: false,
  is_active: true,
};

const AdminTemples = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState<Partial<Temple> | null>(null);
  const [formData, setFormData] = useState<Partial<Temple>>(emptyTemple);

  const { data: temples = [], isLoading } = useQuery({
    queryKey: ["admin-temples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temples")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Temple[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Temple>) => {
      const { error } = await supabase.from("temples").insert([data as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-temples"] });
      toast({ title: "Temple created successfully" });
      setIsFormOpen(false);
      setFormData(emptyTemple);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Temple> }) => {
      const { error } = await supabase.from("temples").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-temples"] });
      toast({ title: "Temple updated successfully" });
      setIsFormOpen(false);
      setFormData(emptyTemple);
      setSelectedTemple(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("temples").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-temples"] });
      toast({ title: "Temple deleted successfully" });
      setIsDeleteOpen(false);
      setSelectedTemple(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemple?.id) {
      updateMutation.mutate({ id: selectedTemple.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (temple: Temple) => {
    setSelectedTemple(temple);
    setFormData(temple);
    setIsFormOpen(true);
  };

  const handleDelete = (temple: Temple) => {
    setSelectedTemple(temple);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTemple(null);
    setFormData(emptyTemple);
    setIsFormOpen(true);
  };

  const filteredTemples = temples.filter(
    (temple) =>
      temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.deity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mobile Card Component
  const MobileTempleCard = ({ temple }: { temple: Temple }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={temple.image_url || undefined} />
            <AvatarFallback className="rounded-lg">
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{temple.name}</h3>
              {temple.is_partner && (
                <Badge variant="outline" className="text-xs shrink-0">Partner</Badge>
              )}
            </div>
            {temple.deity && (
              <p className="text-sm text-muted-foreground">Deity: {temple.deity}</p>
            )}
            {(temple.city || temple.state) && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[temple.city, temple.state].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <Badge variant={temple.is_active ? "default" : "secondary"}>
                {temple.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(temple)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(temple)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Temples Management
            </h1>
            <p className="text-muted-foreground">Manage temples and partner temples</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Temple
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search temples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile: Card View */}
        {isMobile ? (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading temples...</p>
            ) : filteredTemples.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No temples found</p>
            ) : (
              filteredTemples.map((temple) => (
                <MobileTempleCard key={temple.id} temple={temple} />
              ))
            )}
          </div>
        ) : (
          /* Desktop: Table */
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Deity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredTemples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No temples found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemples.map((temple) => (
                    <TableRow key={temple.id}>
                      <TableCell className="font-medium">{temple.name}</TableCell>
                      <TableCell>{temple.deity || "-"}</TableCell>
                      <TableCell>{temple.city ? `${temple.city}, ${temple.state}` : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={temple.is_active ? "default" : "secondary"}>
                          {temple.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {temple.is_partner && <Badge variant="outline">Partner</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(temple)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(temple)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemple?.id ? "Edit Temple" : "Add New Temple"}</DialogTitle>
            <DialogDescription>
              {selectedTemple?.id ? "Update the temple details below" : "Fill in the details to add a new temple"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Temple Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deity">Deity</Label>
                <Input
                  id="deity"
                  value={formData.deity || ""}
                  onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location/Area</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone || ""}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url || ""}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url || ""}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_partner"
                  checked={formData.is_partner || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_partner: checked })}
                />
                <Label htmlFor="is_partner">Partner Temple</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {selectedTemple?.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Temple</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemple?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTemple?.id && deleteMutation.mutate(selectedTemple.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminTemples;
