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
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, UserCheck, Loader2, CheckCircle, MapPin, Briefcase } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Pundit {
  id: string;
  name: string;
  photo_url: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  experience_years: number | null;
  location: string | null;
  bio: string | null;
  is_verified: boolean | null;
  is_active: boolean | null;
  approval_status: string | null;
}

const emptyPundit: Partial<Pundit> = {
  name: "",
  photo_url: "",
  specializations: [],
  languages: [],
  experience_years: null,
  location: "",
  bio: "",
  is_verified: false,
  is_active: true,
  approval_status: "approved",
};

const AdminPundits = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPundit, setSelectedPundit] = useState<Partial<Pundit> | null>(null);
  const [formData, setFormData] = useState<Partial<Pundit>>(emptyPundit);
  const [specializationsInput, setSpecializationsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");

  const { data: pundits = [], isLoading } = useQuery({
    queryKey: ["admin-pundits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pundits")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Pundit[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Pundit>) => {
      const { error } = await supabase.from("pundits").insert([data as any]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pundits"] });
      toast({ title: "Pundit created successfully" });
      setIsFormOpen(false);
      setFormData(emptyPundit);
      setSpecializationsInput("");
      setLanguagesInput("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pundit> }) => {
      const { error } = await supabase.from("pundits").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pundits"] });
      toast({ title: "Pundit updated successfully" });
      setIsFormOpen(false);
      setFormData(emptyPundit);
      setSelectedPundit(null);
      setSpecializationsInput("");
      setLanguagesInput("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pundits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pundits"] });
      toast({ title: "Pundit deleted successfully" });
      setIsDeleteOpen(false);
      setSelectedPundit(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      specializations: specializationsInput.split(",").map((s) => s.trim()).filter(Boolean),
      languages: languagesInput.split(",").map((l) => l.trim()).filter(Boolean),
    };
    if (selectedPundit?.id) {
      updateMutation.mutate({ id: selectedPundit.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (pundit: Pundit) => {
    setSelectedPundit(pundit);
    setFormData(pundit);
    setSpecializationsInput(pundit.specializations?.join(", ") || "");
    setLanguagesInput(pundit.languages?.join(", ") || "");
    setIsFormOpen(true);
  };

  const handleDelete = (pundit: Pundit) => {
    setSelectedPundit(pundit);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setSelectedPundit(null);
    setFormData(emptyPundit);
    setSpecializationsInput("");
    setLanguagesInput("");
    setIsFormOpen(true);
  };

  const filteredPundits = pundits.filter(
    (pundit) =>
      pundit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pundit.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pundit.specializations?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Mobile Card Component
  const MobilePunditCard = ({ pundit }: { pundit: Pundit }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={pundit.photo_url || undefined} />
            <AvatarFallback>{pundit.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{pundit.name}</h3>
              {pundit.is_verified && (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              )}
            </div>
            {pundit.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {pundit.location}
              </p>
            )}
            {pundit.experience_years && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {pundit.experience_years} years experience
              </p>
            )}
            <div className="flex gap-1 mt-2 flex-wrap">
              <Badge variant={pundit.is_active ? "default" : "secondary"}>
                {pundit.is_active ? "Active" : "Inactive"}
              </Badge>
              {pundit.approval_status === 'pending' && (
                <Badge variant="outline" className="text-amber-600">Pending</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(pundit)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(pundit)}>
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
              <UserCheck className="h-6 w-6" />
              Pundits Management
            </h1>
            <p className="text-muted-foreground">Manage verified pundits and priests</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pundit
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pundits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile: Card View */}
        {isMobile ? (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading pundits...</p>
            ) : filteredPundits.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No pundits found</p>
            ) : (
              filteredPundits.map((pundit) => (
                <MobilePunditCard key={pundit.id} pundit={pundit} />
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
                  <TableHead>Location</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredPundits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No pundits found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPundits.map((pundit) => (
                    <TableRow key={pundit.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={pundit.photo_url || undefined} />
                            <AvatarFallback>{pundit.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {pundit.name}
                        </div>
                      </TableCell>
                      <TableCell>{pundit.location || "-"}</TableCell>
                      <TableCell>
                        {pundit.experience_years ? `${pundit.experience_years} years` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {pundit.languages?.slice(0, 2).map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          {(pundit.languages?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(pundit.languages?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pundit.is_active ? "default" : "secondary"}>
                          {pundit.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pundit.is_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(pundit)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(pundit)}>
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
            <DialogTitle>{selectedPundit?.id ? "Edit Pundit" : "Add New Pundit"}</DialogTitle>
            <DialogDescription>
              {selectedPundit?.id ? "Update the pundit details below" : "Fill in the details to add a new pundit"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years || ""}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  type="url"
                  value={formData.photo_url || ""}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations (comma-separated)</Label>
              <Input
                id="specializations"
                value={specializationsInput}
                onChange={(e) => setSpecializationsInput(e.target.value)}
                placeholder="e.g., Vedic Poojas, Homam, Satyanarayan Katha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="languages">Languages (comma-separated)</Label>
              <Input
                id="languages"
                value={languagesInput}
                onChange={(e) => setLanguagesInput(e.target.value)}
                placeholder="e.g., Hindi, Sanskrit, English"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-6 flex-wrap">
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
                  id="is_verified"
                  checked={formData.is_verified || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
                <Label htmlFor="is_verified">Verified</Label>
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
                {selectedPundit?.id ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pundit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPundit?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedPundit?.id && deleteMutation.mutate(selectedPundit.id)}
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

export default AdminPundits;
