"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Wifi, 
  FileText, 
  CreditCard, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "CUSTOMER") {
      router.push("/login");
    }
  }, [session, status, router]);

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

  // Mock data for customer dashboard
  const accountInfo = {
    name: session.user.name || "Customer",
    username: session.user.username || "username",
    email: session.user.email || "customer@example.com",
    status: "ACTIVE",
    plan: "Basic 5M",
    balance: 0.00,
    dueDate: "2024-01-15",
  };

  const currentSession = {
    isActive: true,
    ipAddress: "192.168.1.100",
    uptime: "2h 34m",
    downloadSpeed: "4.8 Mbps",
    uploadSpeed: "4.9 Mbps",
    dataUsed: "2.1 GB",
    dataLimit: "Unlimited",
  };

  const recentInvoices = [
    {
      id: "INV-2024-001",
      amount: 19.99,
      status: "PAID",
      dueDate: "2024-01-01",
      paidDate: "2023-12-28",
    },
    {
      id: "INV-2024-002",
      amount: 19.99,
      status: "PENDING",
      dueDate: "2024-02-01",
      paidDate: null,
    },
  ];

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default" className="bg-green-500">Paid</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {accountInfo.name}!</h1>
          <p className="text-muted-foreground">
            Here's your account overview and current service status.
          </p>
        </div>

        {/* Account Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  accountInfo.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                }`} />
                <Badge variant={accountInfo.status === "ACTIVE" ? "default" : "destructive"}>
                  {accountInfo.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accountInfo.plan}</div>
              <p className="text-xs text-muted-foreground">
                Monthly subscription
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${accountInfo.balance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Next payment due {accountInfo.dueDate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  currentSession.isActive ? "bg-green-500" : "bg-gray-500"
                }`} />
                <span className="text-sm font-medium">
                  {currentSession.isActive ? "Online" : "Offline"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Session */}
          <Card>
            <CardHeader>
              <CardTitle>Current Session</CardTitle>
              <CardDescription>
                Your current internet connection details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSession.isActive ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IP Address</span>
                    <span className="text-sm font-medium">{currentSession.ipAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-medium">{currentSession.uptime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Download Speed</span>
                    <span className="text-sm font-medium">{currentSession.downloadSpeed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Upload Speed</span>
                    <span className="text-sm font-medium">{currentSession.uploadSpeed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data Used</span>
                    <span className="text-sm font-medium">
                      {currentSession.dataUsed} / {currentSession.dataLimit}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active session found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Connect to the internet to see session details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Your recent billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {invoice.dueDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                      {getInvoiceStatusBadge(invoice.status)}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Invoices
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common account management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <CreditCard className="h-6 w-6" />
                <span>Make Payment</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>View Invoices</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <User className="h-6 w-6" />
                <span>Update Profile</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Wifi className="h-6 w-6" />
                <span>Change Plan</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}