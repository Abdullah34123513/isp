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
  Router, 
  Wifi, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface RouterData {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  isActive: boolean;
  lastSyncAt: string | null;
  customerCount: number;
  activeSessions: number;
}

export default function RoutersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [routers, setRouters] = useState<RouterData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRouter, setEditingRouter] = useState<RouterData | null>(null);

  const [newRouter, setNewRouter] = useState({
    name: "",
    host: "",
    port: 8728,
    username: "",
    password: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ISP_OWNER") {
      router.push("/login");
    } else {
      fetchRouters();
    }
  }, [session, status, router]);

  const fetchRouters = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockRouters: RouterData[] = [
        {
          id: "1",
          name: "Main Router",
          host: "192.168.1.1",
          port: 8728,
          username: "admin",
          password: "••••••••",
          isActive: true,
          lastSyncAt: "2024-01-10T10:30:00Z",
          customerCount: 156,
          activeSessions: 89,
        },
        {
          id: "2",
          name: "Backup Router",
          host: "192.168.1.2",
          port: 8728,
          username: "admin",
          password: "••••••••",
          isActive: true,
          lastSyncAt: "2024-01-10T09:15:00Z",
          customerCount: 45,
          activeSessions: 23,
        },
        {
          id: "3",
          name: "Branch Router",
          host: "192.168.2.1",
          port: 8728,
          username: "admin",
          password: "••••••••",
          isActive: false,
          lastSyncAt: "2024-01-09T16:45:00Z",
          customerCount: 32,
          activeSessions: 0,
        },
      ];
      setRouters(mockRouters);
    } catch (error) {
      toast.error("Failed to fetch routers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRouter = async () => {
    if (!newRouter.name || !newRouter.host || !newRouter.username || !newRouter.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      const newRouterData: RouterData = {
        id: Date.now().toString(),
        ...newRouter,
        isActive: true,
        lastSyncAt: null,
        customerCount: 0,
        activeSessions: 0,
      };
      
      setRouters([...routers, newRouterData]);
      setIsAddDialogOpen(false);
      setNewRouter({
        name: "",
        host: "",
        port: 8728,
        username: "",
        password: "",
      });
      toast.success("Router added successfully");
    } catch (error) {
      toast.error("Failed to add router");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRouter = async () => {
    if (!editingRouter) return;

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setRouters(routers.map(r => r.id === editingRouter.id ? editingRouter : r));
      setEditingRouter(null);
      toast.success("Router updated successfully");
    } catch (error) {
      toast.error("Failed to update router");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRouter = async (routerId: string) => {
    if (!confirm("Are you sure you want to delete this router? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setRouters(routers.filter(r => r.id !== routerId));
      toast.success("Router deleted successfully");
    } catch (error) {
      toast.error("Failed to delete router");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRouterStatus = async (routerId: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setRouters(routers.map(r => 
        r.id === routerId ? { ...r, isActive } : r
      ));
      toast.success(`Router ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error("Failed to update router status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncRouter = async (routerId: string) => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setRouters(routers.map(r => 
        r.id === routerId ? { ...r, lastSyncAt: new Date().toISOString() } : r
      ));
      toast.success("Router synchronized successfully");
    } catch (error) {
      toast.error("Failed to synchronize router");
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Routers</h1>
            <p className="text-muted-foreground">
              Manage your MikroTik routers and monitor their status.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Router
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Router</DialogTitle>
                <DialogDescription>
                  Configure a new MikroTik router for your ISP network.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Router Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Router"
                    value={newRouter.name}
                    onChange={(e) => setNewRouter({ ...newRouter, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="host">Host/IP Address</Label>
                  <Input
                    id="host"
                    placeholder="e.g., 192.168.1.1"
                    value={newRouter.host}
                    onChange={(e) => setNewRouter({ ...newRouter, host: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={newRouter.port}
                    onChange={(e) => setNewRouter({ ...newRouter, port: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">API Username</Label>
                  <Input
                    id="username"
                    placeholder="e.g., admin"
                    value={newRouter.username}
                    onChange={(e) => setNewRouter({ ...newRouter, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">API Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter API password"
                    value={newRouter.password}
                    onChange={(e) => setNewRouter({ ...newRouter, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRouter} disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Router"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Router Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Routers</CardTitle>
              <Router className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Routers</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routers.filter(r => r.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routers.reduce((sum, r) => sum + r.customerCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {routers.reduce((sum, r) => sum + r.activeSessions, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Routers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Router List</CardTitle>
            <CardDescription>
              All configured MikroTik routers in your network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Host:Port</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Active Sessions</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routers.map((router) => (
                  <TableRow key={router.id}>
                    <TableCell className="font-medium">{router.name}</TableCell>
                    <TableCell>{router.host}:{router.port}</TableCell>
                    <TableCell>
                      <Badge variant={router.isActive ? "default" : "secondary"}>
                        {router.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{router.customerCount}</TableCell>
                    <TableCell>{router.activeSessions}</TableCell>
                    <TableCell>
                      {router.lastSyncAt ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(router.lastSyncAt).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Switch
                          checked={router.isActive}
                          onCheckedChange={(checked) => handleToggleRouterStatus(router.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncRouter(router.id)}
                          disabled={isLoading}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingRouter(router)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRouter(router.id)}
                          disabled={isLoading}
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

        {/* Edit Router Dialog */}
        {editingRouter && (
          <Dialog open={!!editingRouter} onOpenChange={() => setEditingRouter(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Router</DialogTitle>
                <DialogDescription>
                  Update router configuration details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Router Name</Label>
                  <Input
                    id="edit-name"
                    value={editingRouter.name}
                    onChange={(e) => setEditingRouter({ ...editingRouter, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-host">Host/IP Address</Label>
                  <Input
                    id="edit-host"
                    value={editingRouter.host}
                    onChange={(e) => setEditingRouter({ ...editingRouter, host: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-port">Port</Label>
                  <Input
                    id="edit-port"
                    type="number"
                    value={editingRouter.port}
                    onChange={(e) => setEditingRouter({ ...editingRouter, port: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-username">API Username</Label>
                  <Input
                    id="edit-username"
                    value={editingRouter.username}
                    onChange={(e) => setEditingRouter({ ...editingRouter, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-password">API Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Enter new password (leave blank to keep current)"
                    onChange={(e) => setEditingRouter({ ...editingRouter, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingRouter(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRouter} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Router"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}