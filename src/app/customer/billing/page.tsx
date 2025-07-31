"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Receipt
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceData {
  id: string;
  invoiceNo: string;
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
  name: string;
  email: string;
  balance: number;
  plan: {
    id: string;
    name: string;
    price: number;
  };
}

export default function CustomerBillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "CUSTOMER") {
      router.push("/login");
    } else {
      fetchCustomerData();
      fetchInvoices();
    }
  }, [session, status, router]);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockCustomer: CustomerData = {
        id: session?.user?.customerId || "1",
        name: "John Doe",
        email: "john@example.com",
        balance: 0.00,
        plan: {
          id: "1",
          name: "Basic 5M",
          price: 19.99,
        },
      };
      setCustomer(mockCustomer);
    } catch (error) {
      toast.error("Failed to fetch customer data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockInvoices: InvoiceData[] = [
        {
          id: "1",
          invoiceNo: "INV-2024-001",
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
          amount: 19.99,
          status: "PENDING",
          dueDate: "2024-02-15",
          paidAt: null,
          description: "Monthly internet service - Basic 5M plan",
          createdAt: "2024-02-01T00:00:00Z",
          payments: [],
        },
        {
          id: "3",
          invoiceNo: "INV-2024-003",
          amount: 19.99,
          status: "OVERDUE",
          dueDate: "2024-01-15",
          paidAt: null,
          description: "Monthly internet service - Basic 5M plan",
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

  const handleMakePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsLoading(true);
    try {
      // Mock API call - will be replaced with actual implementation
      if (customer) {
        setCustomer({
          ...customer,
          balance: customer.balance + paymentAmount,
        });
      }
      setIsPaymentDialogOpen(false);
      setPaymentAmount(0);
      toast.success("Payment processed successfully");
    } catch (error) {
      toast.error("Failed to process payment");
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

  const getOverdueInvoices = () => {
    return invoices.filter(invoice => invoice.status === "OVERDUE");
  };

  const getPendingInvoices = () => {
    return invoices.filter(invoice => invoice.status === "PENDING");
  };

  const getTotalAmountDue = () => {
    return invoices
      .filter(invoice => invoice.status === "PENDING" || invoice.status === "OVERDUE")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
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

  if (!session || session.user.role !== "CUSTOMER") {
    return null;
  }

  if (!customer) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Failed to load customer data</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const overdueInvoices = getOverdueInvoices();
  const pendingInvoices = getPendingInvoices();
  const totalAmountDue = getTotalAmountDue();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
            <p className="text-muted-foreground">
              View your invoices, payment history, and manage your account.
            </p>
          </div>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Make Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Make Payment</DialogTitle>
                <DialogDescription>
                  Enter the amount you would like to pay towards your account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Payment Amount ($)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="19.99"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Current balance: ${customer.balance.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total amount due: ${totalAmountDue.toFixed(2)}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMakePayment} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Pay Now"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Billing Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${customer.balance.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmountDue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueInvoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Plan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${customer.plan.price.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {overdueInvoices.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {overdueInvoices.length} overdue invoice(s). Please make a payment to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        {pendingInvoices.length > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You have {pendingInvoices.length} pending invoice(s) totaling ${totalAmountDue.toFixed(2)}.
            </AlertDescription>
          </Alert>
        )}

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>
              View and download your billing invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
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
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          disabled={isLoading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {(invoice.status === "PENDING" || invoice.status === "OVERDUE") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPaymentAmount(invoice.amount);
                              setIsPaymentDialogOpen(true);
                            }}
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
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
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
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
                <Button onClick={() => handleDownloadInvoice(selectedInvoice.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}