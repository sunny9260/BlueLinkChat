# OfflineChat Application

## Overview

OfflineChat is a real-time messaging application designed for local network communication. The system provides 1-to-1 messaging between users and admin broadcast capabilities for group announcements. Built with a React frontend and Express backend, it uses WebSockets for real-time communication and PostgreSQL for data persistence. The application is particularly suited for offline or local network environments where users need to communicate without internet connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built using React with TypeScript, utilizing modern development patterns:
- **Component Structure**: Uses shadcn/ui components for consistent UI design with Radix UI primitives
- **State Management**: Combines React Query for server state with Zustand for client-side chat state management
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Routing**: wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration with automatic reconnection logic

### Backend Architecture
The server follows a monolithic Express.js architecture with clear separation of concerns:
- **Route Organization**: Centralized route registration in `routes.ts` with modular endpoint handling
- **Storage Abstraction**: Interface-based storage layer (`IStorage`) with in-memory implementation for development
- **WebSocket Integration**: Real-time communication server using native WebSocket with user authentication
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions

### Authentication & Authorization
- **Replit Auth Integration**: Uses OpenID Connect with Replit's authentication service
- **Session-based Authentication**: Passport.js with session storage in PostgreSQL
- **User Management**: Automatic user creation/updates on authentication with role-based permissions
- **Admin Controls**: Special privileges for broadcast messaging and user management

### Database Design
Uses PostgreSQL with Drizzle ORM for type-safe database operations:
- **Users Table**: Stores user profiles, online status, and admin permissions
- **Messages Table**: Handles both direct messages and broadcast messages with type distinction
- **Sessions Table**: Required for Replit Auth session management
- **Future Extensions**: Schema supports chat rooms and participants for group messaging

### Real-time Communication
- **WebSocket Server**: Custom implementation with user authentication and message broadcasting
- **Message Types**: Supports direct messages, broadcast messages (info/warning/emergency), and typing indicators
- **Client Synchronization**: Automatic query invalidation ensures UI stays current with real-time data

### Development & Build System
- **Vite**: Fast development server with HMR and optimized production builds
- **TypeScript**: Full type safety across client, server, and shared code
- **Path Mapping**: Clean imports using @ aliases for better code organization
- **Environment Configuration**: Separate development and production configurations

## External Dependencies

### Core Infrastructure
- **Neon Database**: PostgreSQL hosting service via `@neondatabase/serverless`
- **Replit Platform**: Authentication service and development environment integration

### Frontend Libraries
- **React Ecosystem**: React 18 with React Query for state management
- **UI Framework**: shadcn/ui with Radix UI components for accessibility
- **Styling**: Tailwind CSS with custom design system configuration
- **Form Handling**: React Hook Form with Zod validation schemas

### Backend Services
- **Express.js**: Web server with middleware for JSON parsing and CORS
- **Authentication**: Passport.js with OpenID Connect strategy for Replit
- **Database ORM**: Drizzle ORM with PostgreSQL adapter for type-safe queries
- **Session Storage**: connect-pg-simple for PostgreSQL session management

### Development Tools
- **Build Tools**: Vite for frontend bundling, esbuild for server compilation
- **Type Safety**: TypeScript with strict configuration across all code
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Development Experience**: Replit-specific plugins for enhanced debugging