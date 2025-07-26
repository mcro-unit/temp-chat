import { Message, User, Room } from "@shared/schema";

export interface SocketMessage {
  type: string;
  [key: string]: any;
}

export class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnecting = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        resolve();
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.handleMessage({ type: 'disconnected' });
      };
    });
  }

  private handleMessage(message: SocketMessage) {
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(listener => listener(message));
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  send(message: SocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  joinRoom(roomId: string) {
    this.send({
      type: 'join_room',
      roomId
    });
  }

  sendMessage(content: string) {
    this.send({
      type: 'send_message',
      content
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN || false;
  }
}

export const chatSocket = new ChatSocket();
