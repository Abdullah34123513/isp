"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Clock, 
  Download, 
  Upload, 
  Calendar,
  Monitor,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface SessionData {
  id: string;
  sessionId: string;
  ipAddress: string;
  macAddress: string;
  uptime: number;
  bytesIn: number;
  bytesOut: number;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  downloadSpeed: number;
  uploadSpeed: number;
}

interface UsageStats {
  totalSessions: number;
  totalBytesIn: number;
  totalBytesOut: number;
  averageSessionDuration: number;
  currentSession: SessionData | null;
}

export default function CustomerSessionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "CUSTOMER") {
      router.push("/login");
    } else {
      fetchSessions();
      fetchUsageStats();
    }
  }, [session, status, router]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockSessions: SessionData[] = [
        {
          id: "1",
          sessionId: "active-1",
          ipAddress: "192.168.1.100",
          macAddress: "00:11:22:33:44:55",
          uptime: 9255, // 2h34m15s in seconds
          bytesIn: 123456789,
          bytesOut: 98765432,
          startTime: "2024-01-10T08:00:00Z",
          endTime: null,
          isActive: true,
          downloadSpeed: 4.8,
          uploadSpeed: 4.9,
        },
        {
          id: "2",
          sessionId: "session-2",
          ipAddress: "192.168.1.100",
          macAddress: "00:11:22:33:44:55",
          uptime: 4353, // 1h12m33s in seconds
          bytesIn: 98765432,
          bytesOut: 123456789,
          startTime: "2024-01-09T18:30:00Z",
          endTime: "2024-01-09T19:42:33Z",
          isActive: false,
          downloadSpeed: 4.9,
          uploadSpeed: 4.8,
        },
        {
          id: "3",
          sessionId: "session-3",
          ipAddress: "192.168.1.100",
          macAddress: "00:11:22:33:44:55",
          uptime: 7200, // 2h in seconds
          bytesIn: 234567890,
          bytesOut: 345678901,
          startTime: "2024-01-08T14:00:00Z",
          endTime: "2024-01-08T16:00:00Z",
          isActive: false,
          downloadSpeed: 5.0,
          uploadSpeed: 5.0,
        },
        {
          id: "4",
          sessionId: "session-4",
          ipAddress: "192.168.1.100",
          macAddress: "00:11:22:33:44:55",
          uptime: 1800, // 30m in seconds
          bytesIn: 12345678,
          bytesOut: 23456789,
          startTime: "2024-01-07T20:00:00Z",
          endTime: "2024-01-07T20:30:00Z",
          isActive: false,
          downloadSpeed: 4.7,
          uploadSpeed: 4.8,
        },
      ];
      setSessions(mockSessions);
    } catch (error) {
      toast.error("Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      // Mock data for now - will be replaced with actual API call
      const mockStats: UsageStats = {
        totalSessions: 156,
        totalBytesIn: 123456789012,
        totalBytesOut: 98765432109,
        averageSessionDuration: 7200, // 2 hours in seconds
        currentSession: sessions.find(s => s.isActive) || null,
      };
      setUsageStats(mockStats);
    } catch (error) {
      toast.error("Failed to fetch usage stats");
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getCurrentSession = () => {
    return sessions.find(session => session.isActive);
  };

  const getPastSessions = () => {
    return sessions.filter(session => !session.isActive);
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

  const currentSession = getCurrentSession();
  const pastSessions = getPastSessions();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
            <p className="text-muted-foreground">
              View your internet connection history and usage statistics.
            </p>
          </div>
          <Button onClick={() => {
            fetchSessions();
            fetchUsageStats();
          }} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Current Session */}
        {currentSession ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-green-500" />
                Current Session
              </CardTitle>
              <CardDescription>
                You are currently connected to the internet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-3">
                  <Wifi className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Monitor className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">IP Address</p>
                    <p className="text-sm text-muted-foreground">{currentSession.ipAddress}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Uptime</p>
                    <p className="text-sm text-muted-foreground">{formatDuration(currentSession.uptime)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Started</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(currentSession.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Download className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Download</span>
                  </div>
                  <p className="text-2xl font-bold">{currentSession.downloadSpeed.toFixed(1)} Mbps</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(currentSession.bytesIn)}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Upload className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Upload</span>
                  </div>
                  <p className="text-2xl font-bold">{currentSession.uploadSpeed.toFixed(1)} Mbps</p>
                  <p className="text-sm text-muted-foreground">{formatBytes(currentSession.bytesOut)}</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Total Data</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatBytes(currentSession.bytesIn + currentSession.bytesOut)}
                  </p>
                  <p className="text-sm text-muted-foreground">This session</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <WifiOff className="mr-2 h-5 w-5 text-gray-500" />
                Current Session
              </CardTitle>
              <CardDescription>
                You are currently not connected to the internet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active session found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Connect to the internet to see session details
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Statistics */}
        {usageStats && (
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Your internet usage overview for this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total Sessions</span>
                  </div>
                  <p className="text-2xl font-bold">{usageStats.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Download className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Downloaded</span>
                  </div>
                  <p className="text-2xl font-bold">{formatBytes(usageStats.totalBytesIn)}</p>
                  <p className="text-sm text-muted-foreground">Total data</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Upload className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Uploaded</span>
                  </div>
                  <p className="text-2xl font-bold">{formatBytes(usageStats.totalBytesOut)}</p>
                  <p className="text-sm text-muted-foreground">Total data</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Avg Duration</span>
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(usageStats.averageSessionDuration)}</p>
                  <p className="text-sm text-muted-foreground">Per session</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>
              Your recent internet connection sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Data Downloaded</TableHead>
                  <TableHead>Data Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
                    <TableCell>
                      {session.endTime ? new Date(session.endTime).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>{formatDuration(session.uptime)}</TableCell>
                    <TableCell>{session.ipAddress}</TableCell>
                    <TableCell>{formatBytes(session.bytesIn)}</TableCell>
                    <TableCell>{formatBytes(session.bytesOut)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Completed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Usage Tips */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your usage statistics are updated in real-time. You can check your data consumption and monitor your connection quality here.
          </AlertDescription>
        </Alert>
      </div>
    </MainLayout>
  );
}