# Eve's App - Girls Hike United

A community platform for women who love hiking and outdoor adventures, built with React + Vite and Supabase.

## 🏔️ Project Overview

Eve's App is a platform built to empower women through hiking and outdoor activities. The app features community posts, events, and resources for hikers of all experience levels.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: TailwindCSS + Shadcn UI components
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage)
- **State Management**: React Context
- **Animations**: Framer Motion

## ✨ Features

- **User Authentication**: Sign up, sign in, and account management
- **Community Posts**: Create, like, and comment on posts
- **User Profiles**: Personalized profiles with hiking preferences
- **Events**: Discover and join upcoming hikes and outdoor events
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## 🔒 Authentication Architecture

The app uses Supabase Authentication with a custom auth context:

- **AuthProvider**: Context provider that handles user state and auth operations
- **Session Management**: Automatic token refresh and session persistence
- **Profile Integration**: Automatic user profile creation on signup

## 🗄️ Database Schema

```
profiles
  - id (uuid, PK, FK to auth.users)
  - name (text)
  - email (text)
  - profile_image (text, nullable)
  - bio (text, nullable)
  - location (text, nullable)
  - experience_level (text, nullable)
  - joined_date (timestamp)

posts
  - id (uuid, PK)
  - user_id (uuid, FK to profiles)
  - title (text, nullable)
  - content (text)
  - image_url (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)

post_likes
  - user_id (uuid, FK to profiles)
  - post_id (uuid, FK to posts)
  - created_at (timestamp)
  
post_comments
  - id (uuid, PK)
  - post_id (uuid, FK to posts)
  - user_id (uuid, FK to profiles)
  - content (text)
  - created_at (timestamp)
  - updated_at (timestamp)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A Supabase account and project

### Installation

1. Clone the repository
   ```
   git clone https://github.com/AlexKapadia/Eves-App.git
   cd Eves-App
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:8080](http://localhost:8080) to view the app in your browser

## 📁 Project Structure

```
src/
├── components/       # UI components
│   ├── community/    # Community-related components
│   ├── ui/           # Shadcn UI components
│   └── auth/         # Authentication components
├── lib/              # Core libraries and utilities
│   ├── auth-context.tsx   # Authentication provider
│   ├── supabase.ts        # Supabase client
│   └── community-service.ts # Community features logic
├── pages/            # Application pages
├── hooks/            # Custom React hooks
└── main.tsx          # Application entry point
```

## 🔧 Development

### Running Tests

```
npm test
```

### Building for Production

```
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Supabase](https://supabase.io/) for the backend infrastructure
- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for the build tool
