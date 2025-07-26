import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const extractRoomId = (input: string): string => {
    const trimmed = input.trim();
    
    // Check if it's a URL
    if (trimmed.includes('/room/')) {
      const match = trimmed.match(/\/room\/([A-Z0-9]{8})/);
      return match ? match[1] : '';
    }
    
    // Check if it's just a room ID (8 alphanumeric characters)
    if (/^[A-Z0-9]{8}$/.test(trimmed)) {
      return trimmed;
    }
    
    return '';
  };

  const handleJoinRoom = async () => {
    setError("");
    
    const roomId = extractRoomId(roomInput);
    
    if (!roomId) {
      setError("Please enter a valid room ID (8 characters) or room URL");
      return;
    }

    setIsJoining(true);

    try {
      // Check if room exists
      const response = await fetch(`/api/rooms/${roomId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Room not found or may have been deleted");
        } else {
          setError("Failed to join room. Please try again.");
        }
        return;
      }

      // Room exists, navigate to it
      onClose();
      setLocation(`/room/${roomId}`);
      toast({
        title: "Joining room...",
        description: `Connecting to room ${roomId}`,
      });
      
    } catch (error) {
      console.error('Error joining room:', error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isJoining) {
      handleJoinRoom();
    }
  };

  const handleClose = () => {
    setRoomInput("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Join Chat Room
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Enter a room ID or paste a room URL to join an existing conversation.
          </p>
          
          <Input
            type="text"
            placeholder="Room ID (e.g. A7B9X2M1) or full URL"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="focus:border-purple-500 focus:ring-purple-500/20"
            disabled={isJoining}
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinRoom}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={isJoining || !roomInput.trim()}
            >
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
