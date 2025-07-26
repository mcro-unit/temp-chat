import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertUserSchema, insertMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Generate unique room ID
  function generateRoomId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate guest name
  function generateGuestName(): string {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `Guest_${randomNum}`;
  }

  // Create room endpoint
  app.post('/api/rooms', async (req, res) => {
    try {
      const roomId = generateRoomId();
      const room = await storage.createRoom({ id: roomId });
      res.json(room);
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ message: 'Failed to create room' });
    }
  });

  // Get room endpoint
  app.get('/api/rooms/:id', async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(500).json({ message: 'Failed to get room' });
    }
  });

  // Get room messages
  app.get('/api/rooms/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesInRoom(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ message: 'Failed to get messages' });
    }
  });

  // Get room users
  app.get('/api/rooms/:id/users', async (req, res) => {
    try {
      const users = await storage.getUsersInRoom(req.params.id);
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ message: 'Failed to get users' });
    }
  });

  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  interface ClientConnection {
    ws: WebSocket;
    userId: string;
    roomId: string;
    userName: string;
  }

  const connections = new Map<string, ClientConnection>();

  wss.on('connection', (ws) => {
    let clientConnection: ClientConnection | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'join_room':
            try {
              const { roomId } = message;
              
              // Check if room exists
              const room = await storage.getRoom(roomId);
              if (!room) {
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Room not found'
                }));
                return;
              }

              const userId = randomUUID();
              const userName = generateGuestName();

              // Add user to room
              const user = await storage.addUserToRoom({
                id: userId,
                name: userName,
                roomId: roomId
              });

              clientConnection = {
                ws,
                userId,
                roomId,
                userName
              };
              connections.set(userId, clientConnection);

              // Send join confirmation
              ws.send(JSON.stringify({
                type: 'joined_room',
                user,
                room: await storage.getRoom(roomId)
              }));

              // Send existing messages
              const messages = await storage.getMessagesInRoom(roomId);
              ws.send(JSON.stringify({
                type: 'messages_history',
                messages
              }));

              // Send current users
              const users = await storage.getUsersInRoom(roomId);
              ws.send(JSON.stringify({
                type: 'users_list',
                users
              }));

              // Broadcast user joined to other users in room
              const joinMessage = await storage.addMessage({
                content: `${userName} joined the room`,
                authorId: 'system',
                authorName: 'System',
                roomId
              });

              broadcastToRoom(roomId, {
                type: 'user_joined',
                user,
                message: joinMessage,
                userCount: await storage.getRoomUserCount(roomId)
              }, userId);

            } catch (error) {
              console.error('Error joining room:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to join room'
              }));
            }
            break;

          case 'send_message':
            if (!clientConnection) {
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Not connected to a room'
              }));
              return;
            }

            try {
              const { content } = message;
              
              const newMessage = await storage.addMessage({
                content,
                authorId: clientConnection.userId,
                authorName: clientConnection.userName,
                roomId: clientConnection.roomId
              });

              // Broadcast message to all users in room
              broadcastToRoom(clientConnection.roomId, {
                type: 'new_message',
                message: newMessage
              });

            } catch (error) {
              console.error('Error sending message:', error);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to send message'
              }));
            }
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', async () => {
      if (clientConnection) {
        try {
          // Remove user from room
          await storage.removeUserFromRoom(clientConnection.userId, clientConnection.roomId);
          connections.delete(clientConnection.userId);

          // Broadcast user left to other users in room
          const leaveMessage = await storage.addMessage({
            content: `${clientConnection.userName} left the room`,
            authorId: 'system',
            authorName: 'System',
            roomId: clientConnection.roomId
          });

          broadcastToRoom(clientConnection.roomId, {
            type: 'user_left',
            userId: clientConnection.userId,
            message: leaveMessage,
            userCount: await storage.getRoomUserCount(clientConnection.roomId)
          });

        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });
  });

  function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    connections.forEach((connection) => {
      if (connection.roomId === roomId && 
          connection.userId !== excludeUserId && 
          connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
