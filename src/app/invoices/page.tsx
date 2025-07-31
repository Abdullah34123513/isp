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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  FileText, 
  Download, 
  Send, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Eye,
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceData {
  id: string;
  invoiceNo: string;
  customer: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  paidAt: string | null;
  description: string;
  createdAt: string;
  payments: PaymentData[];
}

interface PaymentData {
  id: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "MOBILE_MONEY" | "OTHER";
  transactionId: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paidAt: string;
}

interface CustomerData {
  id: string;
  username: string;
  name: string;
  email: string;
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

export default function InvoicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  const [generateForm, setGenerateForm] = useState({
    customerId: "",
    amount: 0,
    dueDate: "",
    description: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ISP_OWNER") {
      router.push("/login");
    } else {
      fetchInvoices();
      fetchCustomers();
    }
  }, [session, status, router]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockInvoices: InvoiceData[] = [
        {
          id: "1",
          invoiceNo: "INV-2024-001",
          customer: {
            id: "1",
            username: "customer1",
            name: "John Doe",
            email: "john@example.com",
          },
          amount: 19.99,
          status: "PAID",
          dueDate: "2024-01-31",
          paidAt: "2024-01-15",
          description: "Monthly internet service - Basic 5M plan",
          createdAt: "2024-01-01T00:00:00Z",
          payments: [
            {
              id: "1",
              amount: 19.99,
              method: "CREDIT_CARD",
              transactionId: "txn_123456789",
              status: "COMPLETED",
              paidAt: "2024-01-15T10:30:00Z",
            }
          ],
        },
        {
          id: "2",
          invoiceNo: "INV-2024-002",
          customer: {
            id: "2",
            username: "customer2",
            name: "Jane Smith",
            email: "jane@example.com",
          },
          amount: 39.99,
          status: "PENDING",
          dueDate: "2024-02-15",
          paidAt: null,
          description: "Monthly internet service - Standard 10M plan",
          createdAt: "2024-02-01T00:00:00Z",
          payments: [],
        },
        {
          id: "3",
          invoiceNo: "INV-2024-003",
          customer: {
            id: "3",
            username: "customer3",
            name: "Mike Johnson",
            email: "mike@example.com",
          },
          amount: 59.99,
          status: "OVERDUE",
          dueDate: "2024-01-15",
          paidAt: null,
          description: "Monthly internet service - Premium 20M plan",
          createdAt: "2024-01-01T00:00:00Z",
          payments: [],
        },
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      // Mock data for now
      const mockCustomers: CustomerData[] = [
        {
          id: "1",
          username: "customer1",
          name: "John Doe",
          email: "john@example.com",
          plan: { id: "1", name: "Basic 5M", price: 19.99 },
        },
        {
          id: "2",
          username: "customer2",
          name: "Jane Smith",
          email: "jane@example.com",
          plan: { id: "2", name: "Standard 10M", price: 39.99 },
        },
        {
          id: "3",
          username: "customer3",
          name: "Mike Johnson",
          email: "mike@example.com",
          plan: { id: "3", name: "Premium 20M", price: 59.99 },
        },
      ];
      setCustomers(mockCustomers);
    } catch (error) {
      toast.error("Failed to fetch customers");
    }
  };

  const handleGenerateInvoice = async () => {
    if (!generateForm.customerId || generateForm.amount <= 0 || !generateForm.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const customer = customers.find(c => c.id === generateForm.customerId);
      if (!customer) {
        toast.error("Customer not found");
        return;
      }

      // Mock API call - will be replaced with actual implementation
      const newInvoice: InvoiceData = {
        id: Date.now().toString(),
        invoiceNo: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        customer: {
          id: customer.id,
          username: customer.username,
          name: customer.name,
          email: customer.email,
        },
        amount: generateForm.amount,
        status: "PENDING",
        dueDate: generateForm.dueDate,
        paidAt: null,
        description: generateForm.description || `Monthly internet service - ${customer.plan.name} plan`,
        createdAt: new Date().toISOString(),
        payments: [],
      };
      
      setInvoices([...invoices, newInvoice]);
      setIsGenerateDialogOpen(false);
      setGenerateForm({
        customerId: "",
        amount: 0,
        dueDate: "",
        description: "",
      });
      toast.success("Invoice generated successfully");
    } catch (error) {
      toast.error("Failed to generate invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMonthlyInvoices = async () => {
    if (!confirm("Are you sure you want to generate monthly invoices for all active customers?")) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      const activeCustomers = customers.filter(c => c.plan.price > 0);
      const newInvoices = activeCustomers.map(customer => ({
        id: Date.now().toString() + Math.random(),
        invoiceNo: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        customer: {
          id: customer.id,
          username: customer.username,
          name: customer.name,
          email: customer.email,
        },
        amount: customer.plan.price,
        status: "PENDING" as const,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        paidAt: null,
        description: `Monthly internet service - ${customer.plan.name} plan`,
        createdAt: new Date().toISOString(),
        payments: [],
      }));

      setInvoices([...invoices, ...newInvoices]);
      toast.success(`Generated ${newInvoices.length} monthly invoices successfully`);
    } catch (error) {
      toast.error("Failed to generate monthly invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      toast.success("Invoice sent successfully");
    } catch (error) {
      toast.error("Failed to send invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">
              Manage customer billing and invoices.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleGenerateMonthlyInvoices} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Monthly
            </Button>
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate New Invoice</DialogTitle>
                  <DialogDescription>
                    Create a custom invoice for a customer.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select value={generateForm.customerId} onValueChange={(value) => setGenerateForm({ ...generateForm, customerId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="19.99"
                      value={generateForm.amount}
                      onChange={(e) => setGenerateForm({ ...generateForm, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={generateForm.dueDate}
                      onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Invoice description"
                      value={generateForm.description}
                      onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleGenerateInvoice} disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Invoice"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Invoice Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.filter(i => i.status === "PAID").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.filter(i => i.status === "PENDING").length}
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
                ${invoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
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
                    placeholder="Search invoices..."
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
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>
              All customer invoices in your billing system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.customer.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendInvoice(invoice.id)}
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          disabled={isLoading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Details Dialog */}
        {selectedInvoice && (
          <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Invoice Details</DialogTitle>
                <DialogDescription>
                  Full invoice information and payment history
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Invoice Number</Label>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.invoiceNo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div>{getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.customer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-sm text-muted-foreground">${selectedInvoice.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Paid Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleDateString() : "Not paid"}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.description}</p>
                </div>
                {selectedInvoice.payments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Payment History</Label>
                    <div className="mt-2 space-y-2">
                      {selectedInvoice.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">${payment.amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{payment.method}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={payment.status === "COMPLETED" ? "default" : "secondary"}>
                              {payment.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(payment.paidAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}