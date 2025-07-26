import { type Message, type User, type Room, type InsertMessage, type InsertUser, type InsertRoom } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(id: string): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<void>;
  getRoomUserCount(roomId: string): Promise<number>;
  
  // User operations
  addUserToRoom(user: InsertUser): Promise<User>;
  removeUserFromRoom(userId: string, roomId: string): Promise<void>;
  getUsersInRoom(roomId: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  
  // Message operations
  addMessage(message: InsertMessage): Promise<Message>;
  getMessagesInRoom(roomId: string): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room> = new Map();
  private users: Map<string, User> = new Map();
  private messages: Map<string, Message> = new Map();
  private roomUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds
  private roomMessages: Map<string, string[]> = new Map(); // roomId -> messageIds

  constructor() {}

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      ...insertRoom,
      createdAt: new Date().toISOString(),
      userCount: 0,
    };
    this.rooms.set(room.id, room);
    this.roomUsers.set(room.id, new Set());
    this.roomMessages.set(room.id, []);
    return room;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async deleteRoom(id: string): Promise<void> {
    this.rooms.delete(id);
    // Clean up associated data
    const userIds = this.roomUsers.get(id) || new Set();
    userIds.forEach(userId => this.users.delete(userId));
    this.roomUsers.delete(id);
    
    const messageIds = this.roomMessages.get(id) || [];
    messageIds.forEach(messageId => this.messages.delete(messageId));
    this.roomMessages.delete(id);
  }

  async getRoomUserCount(roomId: string): Promise<number> {
    const userIds = this.roomUsers.get(roomId);
    return userIds ? userIds.size : 0;
  }

  async addUserToRoom(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      joinedAt: new Date().toISOString(),
    };
    
    this.users.set(user.id, user);
    
    const roomUserIds = this.roomUsers.get(user.roomId) || new Set();
    roomUserIds.add(user.id);
    this.roomUsers.set(user.roomId, roomUserIds);
    
    // Update room user count
    const room = this.rooms.get(user.roomId);
    if (room) {
      room.userCount = roomUserIds.size;
      this.rooms.set(user.roomId, room);
    }
    
    return user;
  }

  async removeUserFromRoom(userId: string, roomId: string): Promise<void> {
    this.users.delete(userId);
    
    const roomUserIds = this.roomUsers.get(roomId);
    if (roomUserIds) {
      roomUserIds.delete(userId);
      
      // Update room user count
      const room = this.rooms.get(roomId);
      if (room) {
        room.userCount = roomUserIds.size;
        this.rooms.set(roomId, room);
      }
      
      // If room is empty, delete it
      if (roomUserIds.size === 0) {
        await this.deleteRoom(roomId);
      }
    }
  }

  async getUsersInRoom(roomId: string): Promise<User[]> {
    const userIds = this.roomUsers.get(roomId) || new Set();
    const users: User[] = [];
    
    userIds.forEach(userId => {
      const user = this.users.get(userId);
      if (user) {
        users.push(user);
      }
    });
    
    return users;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      ...insertMessage,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    
    this.messages.set(message.id, message);
    
    const messageIds = this.roomMessages.get(message.roomId) || [];
    messageIds.push(message.id);
    this.roomMessages.set(message.roomId, messageIds);
    
    return message;
  }

  async getMessagesInRoom(roomId: string): Promise<Message[]> {
    const messageIds = this.roomMessages.get(roomId) || [];
    const messages: Message[] = [];
    
    messageIds.forEach(messageId => {
      const message = this.messages.get(messageId);
      if (message) {
        messages.push(message);
      }
    });
    
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
}

export const storage = new MemStorage();
