import { z } from "zod";

export const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  timestamp: z.string(),
  roomId: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  roomId: z.string(),
  joinedAt: z.string(),
});

export const roomSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  userCount: z.number(),
});

export const insertMessageSchema = messageSchema.omit({ id: true, timestamp: true });
export const insertUserSchema = userSchema.omit({ joinedAt: true });
export const insertRoomSchema = roomSchema.omit({ createdAt: true, userCount: true });

export type Message = z.infer<typeof messageSchema>;
export type User = z.infer<typeof userSchema>;
export type Room = z.infer<typeof roomSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
