import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

const PORT = process.env.PORT || 1234;
const MAX_CONNECTIONS_PER_IP = 10;
const MAX_ROOM_NAME_LENGTH = 50;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Track connections per IP for rate limiting
const connectionsPerIP = new Map();

const wss = new WebSocketServer({ 
  port: PORT,
  // Verify client before accepting connection
  verifyClient: (info, callback) => {
    const origin = info.origin || info.req.headers.origin;
    const ip = info.req.socket.remoteAddress || info.req.headers['x-forwarded-for'];
    
    // Check origin in production
    if (process.env.NODE_ENV === 'production' && origin) {
      const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
      if (!isAllowedOrigin) {
        console.log(`❌ Rejected connection from origin: ${origin}`);
        callback(false, 403, 'Forbidden origin');
        return;
      }
    }
    
    // Rate limiting per IP
    const currentConnections = connectionsPerIP.get(ip) || 0;
    if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
      console.log(`❌ Rate limit exceeded for IP: ${ip}`);
      callback(false, 429, 'Too many connections');
      return;
    }
    
    callback(true);
  }
});

console.log(`🚀 CoCode WebSocket Server running on port ${PORT}`);
console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);

wss.on('connection', (conn, req) => {
  const ip = req.socket.remoteAddress || req.headers['x-forwarded-for'];
  
  // Track connection count per IP
  connectionsPerIP.set(ip, (connectionsPerIP.get(ip) || 0) + 1);
  
  // y-websocket client connects to ws://host:port/roomName
  // Extract room name from URL path
  const url = new URL(req.url, `http://${req.headers.host}`);
  // Remove leading slash from pathname to get room name
  let roomName = url.pathname.slice(1) || url.searchParams.get('room') || 'default';
  
  // Sanitize room name - prevent directory traversal and limit length
  roomName = roomName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, MAX_ROOM_NAME_LENGTH);
  if (!roomName) roomName = 'default';
  
  console.log(`✅ New connection to room: ${roomName} from IP: ${ip}`);
  
  // Use y-websocket's setupWSConnection for proper protocol handling
  setupWSConnection(conn, req, {
    docName: roomName,
  });

  conn.on('close', () => {
    // Decrease connection count for this IP
    const currentCount = connectionsPerIP.get(ip) || 1;
    if (currentCount <= 1) {
      connectionsPerIP.delete(ip);
    } else {
      connectionsPerIP.set(ip, currentCount - 1);
    }
    console.log(`❌ Connection closed for room: ${roomName}`);
  });
  
  conn.on('error', (error) => {
    console.error(`WebSocket error in room ${roomName}:`, error.message);
  });
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  wss.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});
