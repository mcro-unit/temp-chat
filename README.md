# EphemChat - Temporary Anonymous Chat Rooms

A lightweight, real-time chat application where users can create and join temporary chat rooms without any registration. All data is stored in memory only and automatically deleted when rooms become empty.


## ✨ Features

- **🚀 Instant Setup** - Create or join a room in seconds, no registration required
- **🔒 Temporary & Private** - Rooms auto-delete when empty, no data stored permanently
- **💬 Real-time Chat** - Connect instantly with others using shareable room links
- **👥 Anonymous Users** - Automatic guest naming system (Guest_1234 format)
- **📱 Responsive Design** - Mobile-first design with purple gradient theme
- **🌐 WebSocket Communication** - Real-time messaging and user presence

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** with custom purple theme

### Backend
- **Node.js** with Express.js framework
- **WebSocket** server for real-time messaging
- **In-memory storage** with automatic cleanup
- **TypeScript** with ES modules

### Key Components
- **Room Management** - Unique 8-character room IDs with collision resistance
- **User System** - Automatic guest naming and presence tracking
- **Message System** - Real-time broadcasting with timestamps
- **Auto Cleanup** - Rooms deleted when last user disconnects

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mcro-unit/ephemchat.git
   cd ephemchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 📱 Usage

### Creating a Room
1. Click "Create New Room" on the landing page
2. You'll be redirected to your new room with a unique 8-character ID
3. Share the room URL with others to invite them

### Joining a Room
1. Click "Join Existing Room" on the landing page
2. Enter either a room ID (e.g., `A7B9X2M1`) or full room URL
3. You'll be connected instantly with an auto-generated guest name

### Chat Features
- **Send Messages** - Type and press Enter or click Send
- **User List** - See all online users in the sidebar
- **Room Info** - View room ID and user count in the header
- **Share Room** - Copy room link to invite others
- **Auto Cleanup** - Room automatically deletes when empty

## 🛠️ Development

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components (Landing, ChatRoom)
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes and WebSocket handling
│   └── storage.ts        # In-memory storage implementation
├── shared/               # Shared types and schemas
│   └── schema.ts        # Zod schemas and TypeScript types
└── package.json         # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### WebSocket Events

**Client → Server:**
- `join_room` - Join a specific room
- `send_message` - Send a chat message

**Server → Client:**
- `joined_room` - Confirmation of room join
- `messages_history` - Past messages in room
- `users_list` - Current users in room
- `new_message` - New message broadcast
- `user_joined` - User joined notification
- `user_left` - User left notification
- `error` - Error message

## 🚀 Deployment

For deployment on platforms that support full-stack Node.js applications:

**Vercel:**
```bash
npm run build
# Deploy dist/ folder
```

**Railway/Render/Heroku:**
```bash
git push [platform] main
```

**Environment Variables:**
- `NODE_ENV` - Set to `production` for production builds
- `PORT` - Server port (defaults to 5000)

## 🔒 Privacy & Security

- **No Registration** - No user accounts or personal data collection
- **Memory Only** - All data stored temporarily in server memory
- **Auto Cleanup** - Rooms and messages deleted when empty
- **No Tracking** - No cookies, analytics, or tracking technologies
- **No Persistence** - No databases or permanent storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing code style and conventions
- Add appropriate error handling
- Test WebSocket functionality thoroughly
- Ensure mobile responsiveness



## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check existing [GitHub Issues](https://github.com/mcro-unit/ephemchat/issues)
2. Create a new issue with detailed description
3. Include steps to reproduce the problem

## 🚧 Roadmap

- [ ] Room moderation features
- [ ] File/image sharing support
- [ ] Custom room names
- [ ] Message reactions
- [ ] Dark/light theme toggle
- [ ] Room password protection
- [ ] Message encryption

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Styling with [Tailwind CSS](https://tailwindcss.com)

---

**Made with ❤️ for temporary, anonymous conversations**

> Perfect for quick discussions, temporary collaboration, or when you need a chat room that disappears when you're done.
