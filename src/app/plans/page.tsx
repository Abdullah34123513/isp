"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wifi, 
  Zap, 
  Settings, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  Activity,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

interface PlanData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  downloadSpeed: number;
  uploadSpeed: number;
  dataLimit: number | null;
  pppProfile: string;
  isActive: boolean;
  customerCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);

  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    price: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    dataLimit: null as number | null,
    pppProfile: "",
    isActive: true,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ISP_OWNER") {
      router.push("/login");
    } else {
      fetchPlans();
    }
  }, [session, status, router]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockPlans: PlanData[] = [
        {
          id: "1",
          name: "Basic 5M",
          description: "Perfect for light browsing and email",
          price: 19.99,
          downloadSpeed: 5,
          uploadSpeed: 5,
          dataLimit: null,
          pppProfile: "basic-5m",
          isActive: true,
          customerCount: 45,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Standard 10M",
          description: "Great for streaming and video calls",
          price: 39.99,
          downloadSpeed: 10,
          uploadSpeed: 10,
          dataLimit: null,
          pppProfile: "standard-10m",
          isActive: true,
          customerCount: 78,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Premium 20M",
          description: "Ideal for heavy users and multiple devices",
          price: 59.99,
          downloadSpeed: 20,
          uploadSpeed: 20,
          dataLimit: null,
          pppProfile: "premium-20m",
          isActive: true,
          customerCount: 33,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "4",
          name: "Basic 5M (Limited)",
          description: "Budget option with 100GB data limit",
          price: 14.99,
          downloadSpeed: 5,
          uploadSpeed: 5,
          dataLimit: 100,
          pppProfile: "basic-5m-limited",
          isActive: false,
          customerCount: 0,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];
      setPlans(mockPlans);
    } catch (error) {
      toast.error("Failed to fetch plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.pppProfile || newPlan.price <= 0 || newPlan.downloadSpeed <= 0 || newPlan.uploadSpeed <= 0) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      const newPlanData: PlanData = {
        id: Date.now().toString(),
        ...newPlan,
        description: newPlan.description || null,
        customerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setPlans([...plans, newPlanData]);
      setIsAddDialogOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
        dataLimit: null,
        pppProfile: "",
        isActive: true,
      });
      toast.success("Plan added successfully");
    } catch (error) {
      toast.error("Failed to add plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...editingPlan, updatedAt: new Date().toISOString() } : p));
      setEditingPlan(null);
      toast.success("Plan updated successfully");
    } catch (error) {
      toast.error("Failed to update plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan && plan.customerCount > 0) {
      toast.error("Cannot delete plan with active customers");
      return;
    }

    if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setPlans(plans.filter(p => p.id !== planId));
      toast.success("Plan deleted successfully");
    } catch (error) {
      toast.error("Failed to delete plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlanStatus = async (planId: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setPlans(plans.map(p => 
        p.id === planId ? { ...p, isActive, updatedAt: new Date().toISOString() } : p
      ));
      toast.success(`Plan ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error("Failed to update plan status");
    } finally {
      setIsLoading(false);
    }
  };

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(1)}G`;
    }
    return `${speed}M`;
  };

  const formatDataLimit = (limit: number | null) => {
    if (limit === null) return "Unlimited";
    if (limit >= 1000) return `${(limit / 1000).toFixed(1)}TB`;
    return `${limit}GB`;
  };

  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!session || session.user.role !== "ISP_OWNER") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bandwidth Plans</h1>
            <p className="text-muted-foreground">
              Manage your service plans and pricing.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Plan</DialogTitle>
                <DialogDescription>
                  Create a new bandwidth plan for your customers.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Basic 5M"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Plan description"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Monthly Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="19.99"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="downloadSpeed">Download Speed (Mbps)</Label>
                    <Input
                      id="downloadSpeed"
                      type="number"
                      placeholder="5"
                      value={newPlan.downloadSpeed}
                      onChange={(e) => setNewPlan({ ...newPlan, downloadSpeed: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="uploadSpeed">Upload Speed (Mbps)</Label>
                    <Input
                      id="uploadSpeed"
                      type="number"
                      placeholder="5"
                      value={newPlan.uploadSpeed}
                      onChange={(e) => setNewPlan({ ...newPlan, uploadSpeed: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dataLimit">Data Limit (GB, leave empty for unlimited)</Label>
                  <Input
                    id="dataLimit"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={newPlan.dataLimit || ""}
                    onChange={(e) => setNewPlan({ ...newPlan, dataLimit: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pppProfile">PPP Profile Name</Label>
                  <Input
                    id="pppProfile"
                    placeholder="e.g., basic-5m"
                    value={newPlan.pppProfile}
                    onChange={(e) => setNewPlan({ ...newPlan, pppProfile: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPlan} disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Plan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Plan Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plans.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans.filter(p => p.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plans.reduce((sum, p) => sum + p.customerCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${plans.reduce((sum, p) => sum + (p.price * p.customerCount), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle>Plan List</CardTitle>
            <CardDescription>
              All available bandwidth plans in your ISP system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Data Limit</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>PPP Profile</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        {plan.description && (
                          <div className="text-sm text-muted-foreground">{plan.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatSpeed(plan.downloadSpeed)}/{formatSpeed(plan.uploadSpeed)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDataLimit(plan.dataLimit)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${plan.price.toFixed(2)}/mo</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {plan.pppProfile}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{plan.customerCount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Switch
                          checked={plan.isActive}
                          onCheckedChange={(checked) => 
                            handleTogglePlanStatus(plan.id, checked)
                          }
                          disabled={plan.customerCount > 0}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={plan.customerCount > 0 || isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Plan Dialog */}
        {editingPlan && (
          <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Plan</DialogTitle>
                <DialogDescription>
                  Update plan configuration details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Plan Name</Label>
                  <Input
                    id="edit-name"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingPlan.description || ""}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Monthly Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-downloadSpeed">Download Speed (Mbps)</Label>
                    <Input
                      id="edit-downloadSpeed"
                      type="number"
                      value={editingPlan.downloadSpeed}
                      onChange={(e) => setEditingPlan({ ...editingPlan, downloadSpeed: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-uploadSpeed">Upload Speed (Mbps)</Label>
                    <Input
                      id="edit-uploadSpeed"
                      type="number"
                      value={editingPlan.uploadSpeed}
                      onChange={(e) => setEditingPlan({ ...editingPlan, uploadSpeed: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dataLimit">Data Limit (GB, leave empty for unlimited)</Label>
                  <Input
                    id="edit-dataLimit"
                    type="number"
                    value={editingPlan.dataLimit || ""}
                    onChange={(e) => setEditingPlan({ ...editingPlan, dataLimit: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-pppProfile">PPP Profile Name</Label>
                  <Input
                    id="edit-pppProfile"
                    value={editingPlan.pppProfile}
                    onChange={(e) => setEditingPlan({ ...editingPlan, pppProfile: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePlan} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Plan"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}