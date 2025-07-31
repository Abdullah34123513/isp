"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  RefreshCw,
  Users,
  Router as RouterIcon,
  Zap,
  Signal
} from "lucide-react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface SessionData {
  id: string;
  sessionId: string;
  customer: {
    id: string;
    username: string;
    name: string;
  };
  router: {
    id: string;
    name: string;
  };
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

interface RealTimeStats {
  totalActiveSessions: number;
  totalBytesIn: number;
  totalBytesOut: number;
  averageSpeed: number;
  topUsers: SessionData[];
  recentActivity: string[];
}

export default function SessionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ISP_OWNER") {
      router.push("/login");
    } else {
      fetchSessions();
      fetchRealTimeStats();
      initializeWebSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [session, status, router]);

  const initializeWebSocket = () => {
    try {
      const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected to real-time updates');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        toast.error('Disconnected from real-time updates');
      });

      newSocket.on('session-started', (data: SessionData) => {
        setSessions(prev => [data, ...prev]);
        toast.info(`New session started: ${data.customer.name}`);
      });

      newSocket.on('session-ended', (data: { sessionId: string }) => {
        setSessions(prev => prev.map(session => 
          session.sessionId === data.sessionId 
            ? { ...session, isActive: false, endTime: new Date().toISOString() }
            : session
        ));
        toast.info('Session ended');
      });

      newSocket.on('session-updated', (data: SessionData) => {
        setSessions(prev => prev.map(session => 
          session.sessionId === data.sessionId ? data : session
        ));
      });

      newSocket.on('stats-updated', (data: RealTimeStats) => {
        setRealTimeStats(data);
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      toast.error('Failed to connect to real-time updates');
    }
  };

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API call
      const mockSessions: SessionData[] = [
        {
          id: "1",
          sessionId: "active-1",
          customer: {
            id: "1",
            username: "customer1",
            name: "John Doe",
          },
          router: {
            id: "1",
            name: "Main Router",
          },
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
          sessionId: "active-2",
          customer: {
            id: "2",
            username: "customer2",
            name: "Jane Smith",
          },
          router: {
            id: "1",
            name: "Main Router",
          },
          ipAddress: "192.168.1.101",
          macAddress: "00:11:22:33:44:56",
          uptime: 4353, // 1h12m33s in seconds
          bytesIn: 98765432,
          bytesOut: 123456789,
          startTime: "2024-01-10T09:15:00Z",
          endTime: null,
          isActive: true,
          downloadSpeed: 9.8,
          uploadSpeed: 9.9,
        },
        {
          id: "3",
          sessionId: "session-3",
          customer: {
            id: "3",
            username: "customer3",
            name: "Mike Johnson",
          },
          router: {
            id: "2",
            name: "Backup Router",
          },
          ipAddress: "192.168.2.100",
          macAddress: "00:11:22:33:44:57",
          uptime: 7200, // 2h in seconds
          bytesIn: 234567890,
          bytesOut: 345678901,
          startTime: "2024-01-09T14:00:00Z",
          endTime: "2024-01-09T16:00:00Z",
          isActive: false,
          downloadSpeed: 19.5,
          uploadSpeed: 19.8,
        },
      ];
      setSessions(mockSessions);
    } catch (error) {
      toast.error("Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRealTimeStats = async () => {
    try {
      // Mock data for now - will be replaced with actual API call
      const mockStats: RealTimeStats = {
        totalActiveSessions: 89,
        totalBytesIn: 123456789012,
        totalBytesOut: 98765432109,
        averageSpeed: 12.5,
        topUsers: sessions.filter(s => s.isActive).slice(0, 5),
        recentActivity: [
          "John Doe connected",
          "Jane Smith disconnected",
          "Mike Johnson connected",
          "Router sync completed",
          "New customer registered"
        ],
      };
      setRealTimeStats(mockStats);
    } catch (error) {
      toast.error("Failed to fetch real-time stats");
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

  const getActiveSessions = () => {
    return sessions.filter(session => session.isActive);
  };

  const getInactiveSessions = () => {
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

  if (!session || session.user.role !== "ISP_OWNER") {
    return null;
  }

  const activeSessions = getActiveSessions();
  const inactiveSessions = getInactiveSessions();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Real-time Sessions</h1>
            <p className="text-muted-foreground">
              Monitor active PPPoE sessions and network activity in real-time.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button onClick={() => {
              fetchSessions();
              fetchRealTimeStats();
            }} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Statistics */}
        {realTimeStats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realTimeStats.totalActiveSessions}</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Download</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(realTimeStats.totalBytesIn)}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Upload</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(realTimeStats.totalBytesOut)}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Speed</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realTimeStats.averageSpeed.toFixed(1)} Mbps</div>
                <p className="text-xs text-muted-foreground">Network average</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connection Status */}
        <Alert>
          <Signal className="h-4 w-4" />
          <AlertDescription>
            {isConnected 
              ? "Real-time updates are active. You'll see live session changes as they happen."
              : "Real-time updates are disconnected. Please check your connection and refresh the page."
            }
          </AlertDescription>
        </Alert>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-green-500" />
              Active Sessions ({activeSessions.length})
            </CardTitle>
            <CardDescription>
              Currently connected users and their session details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Router</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Speed</TableHead>
                  <TableHead>Data Usage</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{session.customer.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{session.router.name}</TableCell>
                    <TableCell>{session.ipAddress}</TableCell>
                    <TableCell>{formatDuration(session.uptime)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {session.downloadSpeed.toFixed(1)}/{session.uploadSpeed.toFixed(1)} Mbps
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatBytes(session.bytesIn + session.bytesOut)}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(session.startTime).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {realTimeStats && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest network events and user activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {realTimeStats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span>{activity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-gray-500" />
              Session History ({inactiveSessions.length})
            </CardTitle>
            <CardDescription>
              Recently completed sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Router</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Data Usage</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Ended</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveSessions.slice(0, 10).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{session.customer.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{session.router.name}</TableCell>
                    <TableCell>{session.ipAddress}</TableCell>
                    <TableCell>{formatDuration(session.uptime)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatBytes(session.bytesIn + session.bytesOut)}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
                    <TableCell>
                      {session.endTime ? new Date(session.endTime).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Completed</Badge>
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