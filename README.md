# OfflineChat - Local Network Messaging App

A real-time messaging application designed for local network communication with 1-to-1 messaging and admin broadcast capabilities. Perfect for offline or local network environments where users need to communicate without internet connectivity.

## Features

- **Real-time Messaging**: Instant 1-to-1 messaging using WebSocket connections
- **Admin Broadcast System**: Admins can send info, warning, or emergency messages to all users
- **User Authentication**: Secure login using Replit Auth (OpenID Connect)
- **Custom Logo & Branding**: Modern design with Bluetooth-inspired logo
- **Responsive Design**: Works on desktop and mobile devices
- **Online Status**: See which users are currently online
- **Message History**: Persistent chat history stored in PostgreSQL

## Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern styling
- **shadcn/ui** components for consistent UI design
- **React Query** for server state management
- **Zustand** for client-side state management
- **WebSocket** for real-time communication

### Backend
- **Node.js** with Express.js web framework
- **TypeScript** for full-stack type safety
- **PostgreSQL** with Drizzle ORM for database operations
- **WebSocket** server for real-time messaging
- **Passport.js** with OpenID Connect for authentication
- **Express Sessions** with PostgreSQL storage

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── chat/       # Chat-specific components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Application pages/routes
│   │   ├── assets/         # Static assets (logo, images)
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes and WebSocket setup
│   ├── storage.ts          # Database operations interface
│   ├── replitAuth.ts       # Authentication configuration
│   └── vite.ts             # Vite integration for development
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and TypeScript types
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Replit account for authentication (or modify auth system)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd offlinechat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file with the following variables:
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your_domain.com
ISSUER_URL=https://replit.com/oidc
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Build and Deployment

### Development
```bash
npm run dev          # Start development server with hot reload
npm run check        # Run TypeScript type checking
npm run db:push      # Push database schema changes
```

### Production Build
```bash
npm run build        # Build both frontend and backend
npm start            # Start production server
```

## Key Features Explained

### Real-time Messaging
- WebSocket connections provide instant message delivery
- Automatic reconnection on connection loss
- Typing indicators and online status updates

### Admin Broadcast System
- Admins can send messages to all connected users
- Three message types: Info (blue), Warning (yellow), Emergency (red)
- Broadcast messages appear prominently in all user chats

### Authentication & Security
- Secure authentication using OpenID Connect
- Session-based authentication with PostgreSQL storage
- Admin privileges controlled through database flags

### Database Schema
- **Users**: Profile information, online status, admin permissions
- **Messages**: Direct messages and broadcast messages with type distinction
- **Sessions**: Secure session management for authentication

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout and redirect
- `GET /api/callback` - OAuth callback handler
- `GET /api/auth/user` - Get current user info

### Chat API
- `GET /api/messages` - Get message history
- `POST /api/messages` - Send new message
- `GET /api/users/online` - Get online users list
- `POST /api/broadcast` - Send broadcast message (admin only)

### WebSocket Events
- `message` - New chat message received
- `broadcast` - Broadcast message from admin
- `user_connected` / `user_disconnected` - User online status changes

## Configuration

### Admin Setup
To make a user an admin, update the `replitAuth.ts` file and add their user ID to the admin check:

```typescript
isAdmin: claims["sub"] === "YOUR_USER_ID", // Replace with actual user ID
```

### Database Configuration
The app uses Drizzle ORM for type-safe database operations. Schema is defined in `shared/schema.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit changes: `git commit -am 'Add new feature'`
5. Push to branch: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact the maintainers.

---

Built with ❤️ for local network communication