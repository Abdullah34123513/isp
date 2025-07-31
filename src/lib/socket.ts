import { Server } from 'socket.io';

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

export const setupSocket = (io: Server) => {
  // Store for real-time data
  let realTimeStats: RealTimeStats = {
    totalActiveSessions: 0,
    totalBytesIn: 0,
    totalBytesOut: 0,
    averageSpeed: 0,
    topUsers: [],
    recentActivity: []
  };

  // Simulated session data for demo
  const mockSessions: SessionData[] = [
    {
      id: "1",
      sessionId: "active-1",
      customer: { id: "1", username: "customer1", name: "John Doe" },
      router: { id: "1", name: "Main Router" },
      ipAddress: "192.168.1.100",
      macAddress: "00:11:22:33:44:55",
      uptime: 9255,
      bytesIn: 123456789,
      bytesOut: 98765432,
      startTime: new Date().toISOString(),
      endTime: null,
      isActive: true,
      downloadSpeed: 4.8,
      uploadSpeed: 4.9,
    },
    {
      id: "2",
      sessionId: "active-2",
      customer: { id: "2", username: "customer2", name: "Jane Smith" },
      router: { id: "1", name: "Main Router" },
      ipAddress: "192.168.1.101",
      macAddress: "00:11:22:33:44:56",
      uptime: 4353,
      bytesIn: 98765432,
      bytesOut: 123456789,
      startTime: new Date().toISOString(),
      endTime: null,
      isActive: true,
      downloadSpeed: 9.8,
      uploadSpeed: 9.9,
    },
  ];

  // Update stats based on current sessions
  const updateStats = () => {
    const activeSessions = mockSessions.filter(s => s.isActive);
    realTimeStats.totalActiveSessions = activeSessions.length;
    realTimeStats.totalBytesIn = activeSessions.reduce((sum, s) => sum + s.bytesIn, 0);
    realTimeStats.totalBytesOut = activeSessions.reduce((sum, s) => sum + s.bytesOut, 0);
    realTimeStats.averageSpeed = activeSessions.length > 0 
      ? activeSessions.reduce((sum, s) => sum + s.downloadSpeed, 0) / activeSessions.length 
      : 0;
    realTimeStats.topUsers = activeSessions.slice(0, 5);
  };

  // Simulate real-time updates
  const simulateRealTimeUpdates = () => {
    // Update session data
    mockSessions.forEach(session => {
      if (session.isActive) {
        session.uptime += 1;
        session.bytesIn += Math.floor(Math.random() * 1000000);
        session.bytesOut += Math.floor(Math.random() * 800000);
        session.downloadSpeed = 4.5 + Math.random() * 0.5;
        session.uploadSpeed = 4.5 + Math.random() * 0.5;
      }
    });

    updateStats();

    // Broadcast updated stats
    io.emit('stats-updated', realTimeStats);

    // Simulate random session events
    if (Math.random() < 0.1) { // 10% chance
      if (Math.random() < 0.7 && mockSessions.length < 10) {
        // Add new session
        const newSession: SessionData = {
          id: Date.now().toString(),
          sessionId: `session-${Date.now()}`,
          customer: { 
            id: (mockSessions.length + 1).toString(), 
            username: `customer${mockSessions.length + 1}`, 
            name: `Customer ${mockSessions.length + 1}` 
          },
          router: { id: "1", name: "Main Router" },
          ipAddress: `192.168.1.${100 + mockSessions.length}`,
          macAddress: `00:11:22:33:44:${55 + mockSessions.length}`,
          uptime: 0,
          bytesIn: 0,
          bytesOut: 0,
          startTime: new Date().toISOString(),
          endTime: null,
          isActive: true,
          downloadSpeed: 5 + Math.random() * 15,
          uploadSpeed: 5 + Math.random() * 15,
        };
        mockSessions.push(newSession);
        io.emit('session-started', newSession);
        realTimeStats.recentActivity.unshift(`${newSession.customer.name} connected`);
        if (realTimeStats.recentActivity.length > 10) {
          realTimeStats.recentActivity.pop();
        }
      } else {
        // End random session
        const activeSessions = mockSessions.filter(s => s.isActive);
        if (activeSessions.length > 0) {
          const randomIndex = Math.floor(Math.random() * activeSessions.length);
          const sessionToEnd = activeSessions[randomIndex];
          sessionToEnd.isActive = false;
          sessionToEnd.endTime = new Date().toISOString();
          io.emit('session-ended', { sessionId: sessionToEnd.sessionId });
          realTimeStats.recentActivity.unshift(`${sessionToEnd.customer.name} disconnected`);
          if (realTimeStats.recentActivity.length > 10) {
            realTimeStats.recentActivity.pop();
          }
        }
      }
    }

    // Update random active session
    const activeSessions = mockSessions.filter(s => s.isActive);
    if (activeSessions.length > 0) {
      const randomSession = activeSessions[Math.floor(Math.random() * activeSessions.length)];
      randomSession.bytesIn += Math.floor(Math.random() * 1000000);
      randomSession.bytesOut += Math.floor(Math.random() * 800000);
      io.emit('session-updated', randomSession);
    }
  };

  // Start simulation
  const simulationInterval = setInterval(simulateRealTimeUpdates, 2000);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send initial data
    updateStats();
    socket.emit('stats-updated', realTimeStats);
    
    // Send current sessions
    mockSessions.forEach(session => {
      if (session.isActive) {
        socket.emit('session-started', session);
      }
    });

    // Handle manual session events (for demo purposes)
    socket.on('manual-session-start', (data: Partial<SessionData>) => {
      const newSession: SessionData = {
        id: Date.now().toString(),
        sessionId: `session-${Date.now()}`,
        customer: data.customer || { id: "1", username: "customer1", name: "John Doe" },
        router: data.router || { id: "1", name: "Main Router" },
        ipAddress: data.ipAddress || "192.168.1.100",
        macAddress: data.macAddress || "00:11:22:33:44:55",
        uptime: 0,
        bytesIn: 0,
        bytesOut: 0,
        startTime: new Date().toISOString(),
        endTime: null,
        isActive: true,
        downloadSpeed: data.downloadSpeed || 5,
        uploadSpeed: data.uploadSpeed || 5,
      };
      
      mockSessions.push(newSession);
      updateStats();
      io.emit('session-started', newSession);
      io.emit('stats-updated', realTimeStats);
      
      realTimeStats.recentActivity.unshift(`${newSession.customer.name} connected`);
      if (realTimeStats.recentActivity.length > 10) {
        realTimeStats.recentActivity.pop();
      }
    });

    socket.on('manual-session-end', (data: { sessionId: string }) => {
      const session = mockSessions.find(s => s.sessionId === data.sessionId);
      if (session && session.isActive) {
        session.isActive = false;
        session.endTime = new Date().toISOString();
        updateStats();
        io.emit('session-ended', { sessionId: data.sessionId });
        io.emit('stats-updated', realTimeStats);
        
        realTimeStats.recentActivity.unshift(`${session.customer.name} disconnected`);
        if (realTimeStats.recentActivity.length > 10) {
          realTimeStats.recentActivity.pop();
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Connected to ISP Real-time Session Monitor!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });

  // Cleanup on server shutdown
  process.on('SIGINT', () => {
    clearInterval(simulationInterval);
    io.close();
  });
};