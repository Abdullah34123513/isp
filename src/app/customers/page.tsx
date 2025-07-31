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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Wifi, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Router as RouterIcon,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface CustomerData {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "ACTIVE" | "SUSPENDED" | "DISABLED" | "PENDING";
  balance: number;
  router: {
    id: string;
    name: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
  };
  pppoeSecret: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

interface RouterData {
  id: string;
  name: string;
}

interface PlanData {
  id: string;
  name: string;
  price: number;
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [routers, setRouters] = useState<RouterData[]>([]);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [newCustomer, setNewCustomer] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    routerId: "",
    planId: "",
    password: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ISP_OWNER") {
      router.push("/login");
    } else {
      fetchCustomers();
      fetchRouters();
      fetchPlans();
    }
  }, [session, status, router]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockCustomers: CustomerData[] = [
        {
          id: "1",
          username: "customer1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          address: "123 Main St, City, State",
          status: "ACTIVE",
          balance: 0.00,
          router: { id: "1", name: "Main Router" },
          plan: { id: "1", name: "Basic 5M", price: 19.99 },
          pppoeSecret: "secret-1",
          lastLoginAt: "2024-01-10T10:30:00Z",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          username: "customer2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1234567891",
          address: "456 Oak St, City, State",
          status: "ACTIVE",
          balance: 19.99,
          router: { id: "1", name: "Main Router" },
          plan: { id: "2", name: "Standard 10M", price: 39.99 },
          pppoeSecret: "secret-2",
          lastLoginAt: "2024-01-10T09:15:00Z",
          createdAt: "2024-01-02T00:00:00Z",
        },
        {
          id: "3",
          username: "customer3",
          name: "Mike Johnson",
          email: "mike@example.com",
          phone: "+1234567892",
          address: "789 Pine St, City, State",
          status: "SUSPENDED",
          balance: 59.99,
          router: { id: "1", name: "Main Router" },
          plan: { id: "3", name: "Premium 20M", price: 59.99 },
          pppoeSecret: "secret-3",
          lastLoginAt: "2024-01-09T16:45:00Z",
          createdAt: "2024-01-03T00:00:00Z",
        },
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRouters = async () => {
    try {
      // Mock data for now
      const mockRouters: RouterData[] = [
        { id: "1", name: "Main Router" },
        { id: "2", name: "Backup Router" },
        { id: "3", name: "Branch Router" },
      ];
      setRouters(mockRouters);
    } catch (error) {
      toast.error("Failed to fetch routers");
    }
  };

  const fetchPlans = async () => {
    try {
      // Mock data for now
      const mockPlans: PlanData[] = [
        { id: "1", name: "Basic 5M", price: 19.99 },
        { id: "2", name: "Standard 10M", price: 39.99 },
        { id: "3", name: "Premium 20M", price: 59.99 },
      ];
      setPlans(mockPlans);
    } catch (error) {
      toast.error("Failed to fetch plans");
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.username || !newCustomer.name || !newCustomer.routerId || !newCustomer.planId || !newCustomer.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      const newCustomerData: CustomerData = {
        id: Date.now().toString(),
        ...newCustomer,
        status: "ACTIVE",
        balance: 0,
        router: routers.find(r => r.id === newCustomer.routerId)!,
        plan: plans.find(p => p.id === newCustomer.planId)!,
        pppoeSecret: null,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      };
      
      setCustomers([...customers, newCustomerData]);
      setIsAddDialogOpen(false);
      setNewCustomer({
        username: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        routerId: "",
        planId: "",
        password: "",
      });
      toast.success("Customer added successfully");
    } catch (error) {
      toast.error("Failed to add customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
      setEditingCustomer(null);
      toast.success("Customer updated successfully");
    } catch (error) {
      toast.error("Failed to update customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setCustomers(customers.filter(c => c.id !== customerId));
      toast.success("Customer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCustomerStatus = async (customerId: string, status: "ACTIVE" | "SUSPENDED") => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      setCustomers(customers.map(c => 
        c.id === customerId ? { ...c, status } : c
      ));
      toast.success(`Customer ${status === "ACTIVE" ? "activated" : "suspended"} successfully`);
    } catch (error) {
      toast.error("Failed to update customer status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncWithRouter = async (customerId: string) => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      toast.success("Customer synchronized with router successfully");
    } catch (error) {
      toast.error("Failed to synchronize customer with router");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "SUSPENDED":
        return <Badge variant="secondary">Suspended</Badge>;
      case "DISABLED":
        return <Badge variant="destructive">Disabled</Badge>;
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customers and their PPPoE accounts.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer account with PPPoE access.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={newCustomer.username}
                    onChange={(e) => setNewCustomer({ ...newCustomer, username: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={newCustomer.password}
                    onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="router">Router</Label>
                  <Select value={newCustomer.routerId} onValueChange={(value) => setNewCustomer({ ...newCustomer, routerId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select router" />
                    </SelectTrigger>
                    <SelectContent>
                      {routers.map((router) => (
                        <SelectItem key={router.id} value={router.id}>
                          {router.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select value={newCustomer.planId} onValueChange={(value) => setNewCustomer({ ...newCustomer, planId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} (${plan.price}/month)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCustomer} disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Customer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Customer Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.status === "ACTIVE").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspended</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.status === "SUSPENDED").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${customers.reduce((sum, c) => sum + c.plan.price, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>
              All registered customers in your ISP system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Router</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.username}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.plan.name}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>{customer.router.name}</TableCell>
                    <TableCell>${customer.balance.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Switch
                          checked={customer.status === "ACTIVE"}
                          onCheckedChange={(checked) => 
                            handleToggleCustomerStatus(customer.id, checked ? "ACTIVE" : "SUSPENDED")
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncWithRouter(customer.id)}
                          disabled={isLoading}
                        >
                          <RouterIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCustomer(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
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
      </div>
    </MainLayout>
  );
}