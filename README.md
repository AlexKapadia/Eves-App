# OutdoorWomen United

A beautiful, modern web platform dedicated to empowering women through outdoor activities, hiking adventures, and community connections.

![OutdoorWomen United](https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1470&auto=format&fit=crop)

## Features

- **Responsive Design**: Beautiful, mobile-friendly UI built with React and Tailwind CSS
- **Community Platform**: Share and interact with posts from fellow outdoor enthusiasts
- **Events Calendar**: Discover and filter hiking events by location and difficulty
- **Modern UI Components**: Using Shadcn UI components for a consistent design system
- **User Authentication**: Full user registration, login, and profile management
- **MongoDB Database**: Store user profiles, events, posts, and interactions
- **RESTful API**: Backend implemented with Express and TypeScript

## Tech Stack

### Frontend
- **Framework**: React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Routing**: React Router
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm/bun

### Backend
- **Framework**: Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: Local file system (with options for cloud storage)
- **API Documentation**: Comprehensive API endpoints

## Project Structure

```
outdoorwomen-united/
├── backend/             # Express backend API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # API controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── index.ts     # Application entry point
├── public/              # Static frontend files
├── src/                 # Frontend React application
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and constants
│   ├── pages/           # Page components
│   ├── App.tsx          # Main application component with routing
│   ├── index.css        # Global styles
│   └── main.tsx         # Entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.ts   # Tailwind configuration
└── vite.config.ts       # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or bun
- MongoDB (local installation or MongoDB Atlas)

### Frontend Installation

1. Install dependencies
   ```bash
   npm install
   # or if you're using bun
   bun install
   ```

2. Start the development server
   ```bash
   npm run dev
   # or
   bun run dev
   ```

3. Open your browser and navigate to http://localhost:8080

### Backend Installation

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file

4. Start the backend server
   ```bash
   npm run dev
   ```

For detailed backend setup instructions, see the [backend README](./backend/README.md).

## Development Notes

- The front and backend can be run simultaneously to create a full-stack development environment
- Backend API runs on port 5000 by default
- Frontend development server runs on port 8080 by default
- Look at the API documentation in the backend README for available endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Images from [Unsplash](https://unsplash.com)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
