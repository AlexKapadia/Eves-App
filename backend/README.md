# Girls Hike United Backend

This is the backend API for the Girls Hike United application. It provides routes for authentication, users, events, and community posts.

## Features

- User authentication using Supabase
- RESTful API for users, events, and posts
- File uploads for profile images, event images, and post images
- Error handling and validation

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account and project

### Setup

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on the `.env.example` file
5. Update the environment variables with your Supabase credentials

### Running the Backend

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (Protected)

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/profile` - Update user profile (Protected)
- `PUT /api/users/:id/follow` - Follow/unfollow a user (Protected)

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create a new event (Protected)
- `PUT /api/events/:id` - Update an event (Protected)
- `DELETE /api/events/:id` - Delete an event (Protected)
- `POST /api/events/:id/register` - Register for an event (Protected)
- `DELETE /api/events/:id/register` - Unregister from an event (Protected)

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a new post (Protected)
- `PUT /api/posts/:id` - Update a post (Protected)
- `DELETE /api/posts/:id` - Delete a post (Protected)
- `PUT /api/posts/:id/like` - Like/unlike a post (Protected)
- `POST /api/posts/:id/comments` - Add a comment to a post (Protected)
- `DELETE /api/posts/:id/comments/:commentId` - Delete a comment (Protected)

## Database

This API can work with either:
- **Supabase** (preferred) - Set `USE_SUPABASE=true` in .env
- **MongoDB** - Set `USE_MONGODB=true` in .env
- **Mock Database** - If neither is configured, a mock in-memory database will be used automatically 