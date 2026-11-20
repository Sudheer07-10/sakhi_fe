import {
  type ChatMessage,
  type InsertChatMessage,
  type SakhiSession,
} from "../shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(): Promise<ChatMessage[]>;
  createSession(
    data: Omit<SakhiSession, "sessionId" | "createdAt" | "updatedAt">
  ): Promise<SakhiSession>;
  getSession(sessionId: string): Promise<SakhiSession | undefined>;
  updateSession(
    sessionId: string,
    updates: Partial<SakhiSession>
  ): Promise<SakhiSession | undefined>;
}

export class MemStorage implements IStorage {
  private chatMessages: ChatMessage[];
  private sessions: Map<string, SakhiSession>;

  constructor() {
    this.chatMessages = [];
    this.sessions = new Map<string, SakhiSession>();
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: randomUUID(),
      text: message.text,
      isUser: message.isUser || "false",
      lang: message.lang || "en",
    };
    this.chatMessages.push(chatMessage);
    return chatMessage;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return this.chatMessages;
  }

  async createSession(
    data: Omit<SakhiSession, "sessionId" | "createdAt" | "updatedAt">
  ): Promise<SakhiSession> {
    const sessionId = "sess_" + randomUUID();
    const now = new Date().toISOString();
    const session: SakhiSession = {
      ...data,
      sessionId,
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<SakhiSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SakhiSession>
  ): Promise<SakhiSession | undefined> {
    const current = this.sessions.get(sessionId);
    if (!current) return undefined;
    const updated: SakhiSession = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
