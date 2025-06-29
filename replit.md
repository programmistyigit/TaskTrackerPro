# Replit.md

## Overview

This is a real-time chat application designed to simulate a Telegram security interface. The system provides an admin dashboard for managing users and sending tasks, while users interact through a security-focused chat interface. The application is built with Express.js backend, React frontend, and Socket.io for real-time communication.

## System Architecture

The application follows a full-stack architecture with the following components:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js with TypeScript 
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage for development)
- **Real-time Communication**: Socket.io for bidirectional client-server communication
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Styling**: Modern, clean white interface with responsive design

## Key Components

### Backend Architecture
- **Express Server**: Main server handling HTTP requests and Socket.io connections
- **In-Memory Storage**: Currently using MemStorage class for data persistence (users, messages, tasks)
- **API Routes**: RESTful endpoints for user management, messages, and tasks
- **Socket.io Integration**: Real-time event handling for admin-user communication

### Frontend Architecture
- **React Router**: Using Wouter for client-side routing
- **State Management**: React hooks with TanStack Query for server state
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Real-time Updates**: Socket.io client integration for live chat functionality

### Data Models
- **Users**: ID (UUID), name, phone, avatar, status, activity tracking
- **Messages**: User association, sender type (admin/user), content, timestamps
- **Tasks**: User association, task types (phone, SMS, 2FA, completion), status tracking

## Data Flow

1. **Admin Dashboard**: 
   - Admins view all users in a card-based interface
   - Click on user cards to open individual chat interfaces
   - Send messages and tasks through Socket.io events
   - Receive real-time task responses and user status updates

2. **User Interface**:
   - Users access via unique UUID-based URLs (/user/:id)
   - Start with security-themed landing page
   - Chat interface opens after clicking "Start" button
   - Tasks appear in modal dialogs with form inputs
   - Security completion flow with animated progress

3. **Real-time Communication**:
   - Socket.io rooms for admin and individual users
   - Event-driven architecture for messages and tasks
   - Status updates for user online/offline presence

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection (configured for future use)
- **drizzle-orm**: Database ORM with PostgreSQL dialect
- **socket.io**: Real-time bidirectional communication
- **uuid**: Unique identifier generation for users
- **express**: Web framework for Node.js

### Frontend Dependencies
- **React**: UI library with hooks
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **tailwindcss**: Utility-first CSS framework
- **@radix-ui/***: Accessible UI primitives
- **lucide-react**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

The application is configured for deployment with:

- **Development**: `npm run dev` starts the Express server with Vite integration
- **Production Build**: `npm run build` creates optimized client and server bundles
- **Database**: Drizzle migrations ready for PostgreSQL deployment
- **Environment**: DATABASE_URL environment variable required for production

The build process:
1. Vite builds the React client to `dist/public`
2. ESBuild bundles the Express server to `dist/index.js`
3. Static files served from the dist directory in production

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```