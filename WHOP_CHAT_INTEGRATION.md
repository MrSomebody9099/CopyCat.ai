# Whop Chat Integration

This document explains how the Whop chat integration works in the CopyCat.ai application.

## Overview

The Whop chat integration allows persisting chat conversations using Whop's built-in chat system. This enables users to have their conversations saved and accessible across sessions.

## Key Components

### 1. WhopChatService (`app/lib/whop-chat-service.ts`)

The core service that handles all Whop chat functionality:

- **findOrCreateChatExperience**: Creates or finds an existing chat experience for a user session
- **getMessagesFromChat**: Retrieves messages from a Whop chat experience
- **sendMessageToChat**: Sends a message to a Whop chat experience
- **syncLocalSessionWithWhop**: Syncs local session messages with Whop
- **loadSessionFromWhop**: Loads a session from Whop chat data
- **enableWhopIntegration**: Enables Whop integration for a session

### 2. API Routes (`app/api/whop-chat/route.ts`)

REST API endpoints for Whop chat operations:

- **GET /api/whop-chat**: Check availability and load sessions
- **POST /api/whop-chat**: Enable integration, sync sessions, and send messages
- **PUT /api/whop-chat**: Refresh session from Whop

### 3. Session Manager Hook (`app/hooks/useSessionManager.ts`)

Custom React hook that manages chat sessions and integrates with Whop:

- **enableWhopIntegration**: Enable Whop integration for current session
- **loadSessionFromWhop**: Load session data from Whop
- **syncSessionWithWhop**: Sync local session with Whop

### 4. UI Component (`app/components/WhopChatIntegration.tsx`)

A React component that demonstrates and controls the Whop chat integration.

## How It Works

### 1. Enabling Integration

When a user starts a session, the application attempts to enable Whop integration:

1. Check if Whop integration is available
2. Find or create a chat experience for the session using an access pass
3. Store the experience ID for future operations

### 2. Message Persistence

Messages are automatically synced with Whop:

1. When a new message is added locally, it's synced with Whop
2. When loading a session, messages can be retrieved from Whop
3. Existing Whop messages are converted to the application's message format

### 3. Access Pass Handling

The integration uses a simplified approach for access pass handling:

1. It first checks for a cached access pass ID for the user
2. If not found, it uses a default access pass ID from environment variables
3. In a production environment, you would implement more sophisticated access pass management

## API Endpoints

### Enable Integration
```bash
POST /api/whop-chat
{
  "action": "enable-integration",
  "sessionId": "session_123"
}
```

### Sync Session
```bash
POST /api/whop-chat
{
  "action": "sync-session",
  "sessionId": "session_123",
  "messages": [...]
}
```

### Load Session
```bash
GET /api/whop-chat?action=load-session&sessionId=session_123
```

### Send Message
```bash
POST /api/whop-chat
{
  "action": "send-message",
  "experienceId": "exp_123",
  "message": "Hello World"
}
```

## Configuration

The integration requires the following environment variables:

- `WHOP_API_KEY`: Your Whop API key
- `NEXT_PUBLIC_WHOP_APP_ID`: Your Whop app ID
- `NEXT_PUBLIC_WHOP_COMPANY_ID`: Your Whop company ID
- `NEXT_PUBLIC_WHOP_AGENT_USER_ID`: Agent user ID for API requests
- `NEXT_PUBLIC_WHOP_DEFAULT_ACCESS_PASS_ID`: (Optional) Default access pass ID for chat creation

## Error Handling

The integration includes comprehensive error handling:

- Network errors are caught and logged
- Failed operations fall back to local storage
- User-friendly error messages are displayed

## Future Improvements

1. Enhanced access pass creation logic for production use
2. Better message synchronization conflict resolution
3. Rich message content support (images, attachments)
4. Real-time message updates using WebSockets
5. User-specific access pass querying for more personalized experiences