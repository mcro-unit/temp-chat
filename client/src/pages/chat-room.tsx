import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Copy, Send, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatSocket } from "@/lib/socket";
import type { Message, User, Room } from "@shared/schema";

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const avatarColors = [
    'avatar-blue', 'avatar-green', 'avatar-orange', 'avatar-purple', 
    'avatar-red', 'avatar-indigo', 'avatar-pink', 'avatar-teal'
  ];

  const getUserAvatarColor = (userId: string) => {
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[index % avatarColors.length];
  };

  const getUserInitials = (name: string) => {
    if (name === 'You') return 'You';
    if (name === 'System') return 'S';
    if (name.startsWith('Guest_')) {
      return name.replace('Guest_', 'G').slice(0, 2);
    }
    return name.slice(0, 2).toUpperCase();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!roomId) {
      setLocation('/');
      return;
    }

    const connectAndJoin = async () => {
      try {
        setIsConnecting(true);
        setError("");

        // Connect to WebSocket
        await chatSocket.connect();
        setIsConnected(true);

        // Set up event listeners
        chatSocket.on('joined_room', (data: any) => {
          setCurrentUser(data.user);
          setRoom(data.room);
          setIsConnecting(false);
          toast({
            title: "Connected!",
            description: `Welcome to room ${roomId}`,
          });
        });

        chatSocket.on('messages_history', (data: any) => {
          setMessages(data.messages);
        });

        chatSocket.on('users_list', (data: any) => {
          setUsers(data.users);
        });

        chatSocket.on('new_message', (data: any) => {
          setMessages(prev => [...prev, data.message]);
        });

        chatSocket.on('user_joined', (data: any) => {
          setUsers(prev => [...prev, data.user]);
          setMessages(prev => [...prev, data.message]);
          setRoom(prev => prev ? { ...prev, userCount: data.userCount } : null);
          toast({
            title: "User joined",
            description: `${data.user.name} joined the room`,
          });
        });

        chatSocket.on('user_left', (data: any) => {
          setUsers(prev => prev.filter(user => user.id !== data.userId));
          setMessages(prev => [...prev, data.message]);
          setRoom(prev => prev ? { ...prev, userCount: data.userCount } : null);
        });

        chatSocket.on('error', (data: any) => {
          setError(data.message);
          setIsConnecting(false);
        });

        chatSocket.on('disconnected', () => {
          setIsConnected(false);
          toast({
            title: "Disconnected",
            description: "Connection to the chat room was lost",
            variant: "destructive",
          });
        });

        // Join the room
        chatSocket.joinRoom(roomId);

      } catch (error) {
        console.error('Failed to connect:', error);
        setError("Failed to connect to the chat room");
        setIsConnecting(false);
      }
    };

    connectAndJoin();

    // Cleanup on unmount
    return () => {
      chatSocket.disconnect();
    };
  }, [roomId, setLocation, toast]);

  useEffect(() => {
    // Focus input when connected
    if (isConnected && !isConnecting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isConnected, isConnecting]);

  const handleSendMessage = () => {
    const content = messageInput.trim();
    if (!content || !isConnected) return;

    chatSocket.sendMessage(content);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleCopyRoomLink = async () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(roomUrl);
      toast({
        title: "Link copied!",
        description: "Room link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy room link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleBackToLanding = () => {
    setLocation('/');
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to room {roomId}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleBackToLanding}
            className="w-full mt-4"
            variant="outline"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Chat Header */}
      <header className="gradient-purple text-white">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToLanding}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="font-semibold flex items-center space-x-2">
                  <span>Room: {roomId}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyRoomLink}
                    className="hover:bg-white/10 p-1 rounded transition-colors text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-white/80 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {room?.userCount || 0} users online
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleCopyRoomLink}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-white hidden sm:flex"
              >
                <Copy className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.authorId === currentUser?.id;
              const isSystem = message.authorId === 'system';
              
              if (isSystem) {
                return (
                  <div key={message.id} className="text-center">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {message.content}
                    </span>
                  </div>
                );
              }

              if (isCurrentUser) {
                return (
                  <div key={message.id} className="flex items-start space-x-3 justify-end message-enter">
                    <div>
                      <div className="flex items-center space-x-2 mb-1 justify-end">
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="font-semibold text-gray-900">You</span>
                      </div>
                      <div className="bg-purple-600 text-white rounded-lg px-4 py-2 shadow-sm max-w-xs break-words">
                        {message.content}
                      </div>
                    </div>
                    <div className="w-10 h-10 avatar-purple rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      You
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className="flex items-start space-x-3 message-enter">
                  <div className={`w-10 h-10 ${getUserAvatarColor(message.authorId)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {getUserInitials(message.authorName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">{message.authorName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 max-w-xs break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex space-x-3">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-gray-300 rounded-xl focus:border-purple-600 focus:ring-purple-600/20"
                disabled={!isConnected}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !isConnected}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Users Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              USERS ONLINE ({users.length})
            </h3>
          </div>
          
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser?.id;
              const displayName = isCurrentUser ? 'You' : user.name;
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isCurrentUser ? 'bg-purple-50 border border-purple-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 ${isCurrentUser ? 'avatar-purple' : getUserAvatarColor(user.id)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                    {getUserInitials(displayName)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{displayName}</div>
                    <div className="text-xs text-green-500 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                      Online
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
