import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Plus, DoorOpen, Zap, Shield, Users, Menu, X } from "lucide-react";
import JoinRoomModal from "@/components/join-room-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    
    try {
      const response = await apiRequest('POST', '/api/rooms');
      const room = await response.json();
      
      toast({
        title: "Room created!",
        description: `Room ${room.id} is ready for chatting`,
      });
      
      setLocation(`/room/${room.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-purple min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <MessageCircle className="text-white h-6 w-6" />
              </div>
              <span className="text-white font-semibold text-xl">EphemChat</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
                How it works
              </a>
              <a href="#privacy" className="text-white/80 hover:text-white transition-colors">
                Privacy
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:bg-white/10 p-2 text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <nav className="flex flex-col space-y-2 p-4">
                <a 
                  href="#features" 
                  className="text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How it works
                </a>
                <a 
                  href="#privacy" 
                  className="text-white/80 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Privacy
                </a>
              </nav>
            </div>
          )}
        </header>

        {/* Main Hero Content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Temporary Chat Rooms
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create instant, anonymous chat rooms that disappear when you're done.
              Perfect for quick conversations and temporary collaboration.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="bg-white text-purple-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg shadow-lg h-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                {isCreating ? "Creating..." : "Create New Room"}
              </Button>
              <Button
                onClick={() => setIsJoinModalOpen(true)}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors border-white/30 text-lg h-auto"
              >
                <DoorOpen className="mr-2 h-5 w-5" />
                Join Existing Room
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">Anonymous</div>
                <div className="text-white/80">No Registration Required</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">Instant</div>
                <div className="text-white/80">Real-time Messaging</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">Temporary</div>
                <div className="text-white/80">Auto-delete When Empty</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Temporary Chat?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the freedom of ephemeral communication with our feature-rich platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Setup</h3>
                <p className="text-gray-600">Create or join a room in seconds. No registration required.</p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
              <CardContent className="p-8 text-center">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Temporary & Private</h3>
                <p className="text-gray-600">Rooms auto-delete when empty. No data is permanently stored.</p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Chat</h3>
                <p className="text-gray-600">Connect instantly with others using shareable room links.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600">See what a chat room looks like</p>
          </div>

          {/* Chat Room Preview */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Chat Header */}
            <div className="gradient-purple text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                    <span>←</span>
                  </button>
                  <div>
                    <div className="font-semibold">Room: A7B9X2M1</div>
                    <div className="text-sm text-white/80">3 users online</div>
                  </div>
                </div>
                <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <span>📋</span>
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex h-96">
              {/* Messages Area */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                {/* Sample Messages */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 avatar-blue rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    G1
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">Guest_1234</span>
                      <span className="text-xs text-gray-500">17:45</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      Hey everyone! Welcome to the room 👋
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 avatar-green rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    G5
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">Guest_5678</span>
                      <span className="text-xs text-gray-500">18:06</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      Thanks! This is pretty cool. Love the interface!
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 justify-end">
                  <div>
                    <div className="flex items-center space-x-2 mb-1 justify-end">
                      <span className="text-xs text-gray-500">18:07</span>
                      <span className="font-semibold text-gray-900">You</span>
                    </div>
                    <div className="bg-purple-600 text-white rounded-lg px-3 py-2">
                      Hello! Great to meet you here
                    </div>
                  </div>
                  <div className="w-8 h-8 avatar-purple rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    You
                  </div>
                </div>
              </div>

              {/* Users Sidebar */}
              <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  USERS ONLINE (3)
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 avatar-blue rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      G1
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Guest_1234</div>
                      <div className="text-xs text-green-500">Online</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 avatar-green rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      G5
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Guest_5678</div>
                      <div className="text-xs text-green-500">Online</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 avatar-purple rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      You
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">You</div>
                      <div className="text-xs text-green-500">Online</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  disabled
                />
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors">
                  <span>✈️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy and Terms Section */}
      <section id="privacy" className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Privacy & Terms</h2>
            <p className="text-xl text-gray-600">
              Your privacy is important to us. Here's how we handle your data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Privacy Policy */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Privacy Policy</h3>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Collection</h4>
                  <p>We collect minimal data to provide our service. This includes:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Chat messages during your session</li>
                    <li>Automatically generated guest names</li>
                    <li>Room participation information</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Storage</h4>
                  <p>All data is stored temporarily in memory only. When you leave a chat room or when a room becomes empty, all associated data is permanently deleted. We do not use databases or persistent storage.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Sharing</h4>
                  <p>We do not sell, trade, or share your data with third parties. Your messages are only visible to other participants in the same chat room during the active session.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cookies & Tracking</h4>
                  <p>We do not use cookies, analytics, or tracking technologies. Your privacy is maintained throughout your entire session.</p>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Terms of Service</h3>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Acceptable Use</h4>
                  <p>When using our service, you agree to:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Be respectful to other users</li>
                    <li>Not share illegal, harmful, or offensive content</li>
                    <li>Not attempt to disrupt the service</li>
                    <li>Not impersonate others or create misleading identities</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Availability</h4>
                  <p>We provide this service "as is" without warranties. The service may be temporarily unavailable due to maintenance or technical issues.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Content Responsibility</h4>
                  <p>You are responsible for the content you share. We do not monitor or moderate chat rooms in real-time. Users can leave rooms at any time.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h4>
                  <p>We are not liable for any damages arising from your use of the service. Use at your own discretion.</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Changes to Terms</h4>
                  <p>We may update these terms occasionally. Continued use of the service constitutes acceptance of any changes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-16 text-center">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Questions?</h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about our privacy policy or terms of service, 
                feel free to reach out to us.
              </p>
              <div className="text-purple-600 font-semibold">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-purple-600 rounded-xl p-3">
                <MessageCircle className="text-white h-6 w-6" />
              </div>
              <span className="text-white font-semibold text-xl">EphemChat</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <span className="text-gray-600">•</span>
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400">
                © {new Date().getFullYear()} EphemChat
              </span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              Temporary, anonymous chat rooms that disappear when you're done. 
              No registration required, no data stored permanently.
            </p>
          </div>
        </div>
      </footer>

      <JoinRoomModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
    </div>
  );
}
