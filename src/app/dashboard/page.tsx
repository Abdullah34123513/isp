"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Router, 
  Wifi, 
  FileText, 
  Activity, 
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ISP_OWNER") {
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

  if (!session || session.user.role !== "ISP_OWNER") {
    return null;
  }

  // Mock data for dashboard
  const stats = [
    {
      title: "Total Customers",
      value: "156",
      description: "+12% from last month",
      icon: Users,
      trend: "up",
    },
    {
      title: "Active Routers",
      value: "3",
      description: "All systems operational",
      icon: Router,
      trend: "stable",
    },
    {
      title: "Monthly Revenue",
      value: "$4,567",
      description: "+8% from last month",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Active Sessions",
      value: "89",
      description: "Currently online",
      icon: Activity,
      trend: "stable",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "customer_added",
      customer: "John Doe",
      time: "2 minutes ago",
      description: "New customer registered",
    },
    {
      id: 2,
      type: "payment_received",
      customer: "Jane Smith",
      time: "1 hour ago",
      description: "Payment of $39.99 received",
    },
    {
      id: 3,
      type: "router_sync",
      router: "Main Router",
      time: "3 hours ago",
      description: "Router synchronized successfully",
    },
    {
      id: 4,
      type: "invoice_generated",
      customer: "Mike Johnson",
      time: "5 hours ago",
      description: "Monthly invoice generated",
    },
  ];

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "High Bandwidth Usage",
      description: "Customer: Alice Cooper - Using 95% of data limit",
      time: "30 minutes ago",
    },
    {
      id: 2,
      type: "info",
      title: "Router Maintenance",
      description: "Scheduled maintenance for Backup Router at 2:00 AM",
      time: "2 hours ago",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your ISP business.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Activities */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest activities in your ISP management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === "customer_added" && (
                        <Users className="h-4 w-4 text-green-500" />
                      )}
                      {activity.type === "payment_received" && (
                        <DollarSign className="h-4 w-4 text-blue-500" />
                      )}
                      {activity.type === "router_sync" && (
                        <Router className="h-4 w-4 text-purple-500" />
                      )}
                      {activity.type === "invoice_generated" && (
                        <FileText className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.customer || activity.router}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>
                System alerts and important notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.title}
                        </p>
                        <Badge variant={alert.type === "warning" ? "destructive" : "secondary"}>
                          {alert.type === "warning" ? "Warning" : "Info"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {alert.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Add Customer</p>
                  <p className="text-sm text-gray-500">Register new customer</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Router className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Add Router</p>
                  <p className="text-sm text-gray-500">Configure new router</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <FileText className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">Generate Invoices</p>
                  <p className="text-sm text-gray-500">Create monthly invoices</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Wifi className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium">Manage Plans</p>
                  <p className="text-sm text-gray-500">Update service plans</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}