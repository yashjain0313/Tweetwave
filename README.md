# Tweetwave

A modern social media platform inspired by Twitter, built with a full-stack JavaScript/TypeScript architecture.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Flow of the Application](#flow-of-the-application)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)
- [Code Style and Standards](#code-style-and-standards)
- [Future Roadmap](#future-roadmap)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

Tweetwave is a social media application that allows users to create accounts, post short messages, follow other users, and engage with content through likes and comments. The application features a responsive design, real-time notifications, and supports both traditional email/password authentication and Google OAuth.

## Features

- **User Authentication**:

  - Traditional username/password login
  - Google OAuth integration
  - JWT-based authentication
  - Password encryption and security

- **User Profiles**:

  - Customizable user profiles with cover and profile images
  - Bio and personal link section
  - Follow/unfollow functionality
  - View followers and following lists

- **Post Management**:

  - Create, read, update, and delete posts
  - Support for text content
  - Image uploads for posts
  - Like and unlike posts

- **Social Interactions**:

  - Follow/unfollow users
  - Receive notifications for interactions
  - View a personalized feed based on follows

- **Responsive Design**:
  - Mobile-first approach
  - Consistent experience across devices

## Technology Stack

### Frontend

- **React**: UI library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Data fetching and state management
- **React Router**: Navigation and routing
- **Firebase**: Google authentication
- **Axios**: HTTP client for API requests
- **React Hot Toast**: Toast notifications

### Backend

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Zod**: Input validation
- **Multer**: File uploads

## Project Architecture

### Frontend Structure

- **components/**: Reusable UI components
- **pages/**: Page components for each route
  - _auth/_: Authentication-related pages (Login, Signup)
  - _home/_: Main feed and post creation
  - _notification/_: User notifications
  - _profile/_: User profiles and editing
- **hooks/**: Custom React hooks
- **utils/**: Utility functions and services
  - _firebase/_: Firebase configuration for Google Auth
  - _date/_: Date formatting utilities
  - _db/_: Mock data for development
- **public/**: Static assets like images and icons

### Backend Structure

- **controller/**: Route controllers
  - _auth.js_: Authentication logic
  - _post.js_: Post CRUD operations
  - _user.js_: User profile management
  - _notification.js_: Notification handling
- **model/**: Mongoose schemas
  - _userModel.js_: User data schema
  - _postModel.js_: Post data schema
  - _notification.js_: Notification data schema
- **route/**: API endpoints
- **middleware/**: Custom middleware
  - _protectRoute.js_: Authentication middleware
- **lib/utils/**: Utility functions
  - _generateToken.js_: JWT token generation
- **zod/**: Input validation schemas
- **db/**: Database connection

## Flow of the Application

### Authentication Flow

1. **User Registration**:

   - User fills out signup form or clicks Google Sign-in
   - Form data is validated on client-side
   - If using Google auth, Firebase handles authentication
   - User data is sent to the backend
   - Backend creates a new user document in MongoDB
   - JWT token is generated and stored as an HTTP-only cookie
   - User is redirected to the home page

2. **User Login**:
   - User enters credentials or uses Google Sign-in
   - Backend validates credentials or processes Google auth data
   - JWT token is generated and stored as an HTTP-only cookie
   - User session is established
   - User is redirected to the home page

### Home Feed Flow

1. User logs in and is directed to the home page
2. The frontend fetches posts from users they follow
3. Posts are displayed in chronological order
4. User can create new posts via the CreatePost component
5. Real-time updates are shown for new interactions

### Post Interaction Flow

1. User views a post in their feed
2. They can like the post, triggering an API call
3. If successful, the UI updates to reflect the new like count
4. The post owner receives a notification about the like
5. Similar flows exist for following users and other interactions

### Profile Flow

1. User can view their own or others' profiles
2. Profiles display user information, followers/following counts, and posts
3. Users can edit their own profiles via the EditProfile page
4. Profile updates are sent to the backend and stored in MongoDB

### Notifications Flow

1. User interactions generate notifications in the database
2. Users can view their notifications in the Notifications page
3. Notifications are marked as read when viewed

## Installation

### Prerequisites

- Node.js 14+ installed
- MongoDB installed and running
- npm or yarn installed

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/tweetwave
JWT_SECRET=your_jwt_secret_key
COOKIE_EXPIRES=30
NODE_ENV=development
```

### Frontend (.env)

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_API_URL=http://localhost:5000/api
```

## API Documentation

### Authentication Endpoints

- **POST /api/auth/signup**: Register a new user
- **POST /api/auth/login**: Log in with username/password
- **POST /api/auth/google-login**: Authenticate with Google
- **POST /api/auth/logout**: Log out current user
- **GET /api/auth/me**: Get current user details

### User Endpoints

- **GET /api/user/:username**: Get user profile
- **PUT /api/user**: Update user profile
- **GET /api/user/:userId/followers**: Get user followers
- **GET /api/user/:userId/following**: Get users being followed
- **POST /api/user/:userId/follow**: Follow a user
- **DELETE /api/user/:userId/follow**: Unfollow a user

### Post Endpoints

- **GET /api/post**: Get feed posts
- **POST /api/post**: Create a new post
- **GET /api/post/:postId**: Get a specific post
- **PUT /api/post/:postId**: Update a post
- **DELETE /api/post/:postId**: Delete a post
- **POST /api/post/:postId/like**: Like a post
- **DELETE /api/post/:postId/like**: Unlike a post

### Notification Endpoints

- **GET /api/notification**: Get user notifications
- **PUT /api/notification/:notificationId/read**: Mark notification as read
- **DELETE /api/notification/:notificationId**: Delete a notification

## Authentication Flow

The application uses a combination of JWT tokens and HTTP-only cookies for secure authentication:

1. **Traditional Auth**:

   - User submits credentials
   - Backend validates and creates JWT token
   - Token is set as HTTP-only cookie
   - Frontend detects authenticated state via React Query

2. **Google OAuth**:
   - User clicks "Sign in with Google"
   - Firebase handles OAuth popup and authentication
   - Firebase returns user data and tokens
   - Frontend sends Google user data to backend
   - Backend creates or updates user record
   - JWT token is created and set as cookie
   - User is authenticated in the application

All authenticated requests include the JWT cookie automatically. Protected routes check for valid JWT tokens before processing requests.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## Deployment

### Frontend Deployment

The frontend can be deployed to various platforms. Here's an example deployment to Vercel:

1. Build the production-ready bundle:

   ```bash
   cd frontend
   npm run build
   ```

2. Install the Vercel CLI (if not already installed):

   ```bash
   npm install -g vercel
   ```

3. Deploy to Vercel:

   ```bash
   vercel
   ```

4. Follow the prompts to link to your Vercel account and project.

### Backend Deployment

The backend can be deployed to platforms like Heroku, Railway, or a cloud provider like AWS:

#### Heroku Deployment:

1. Create a Heroku account and install the Heroku CLI
2. Log in to Heroku

   ```bash
   heroku login
   ```

3. Create a new Heroku application:

   ```bash
   heroku create tweetwave-api
   ```

4. Set environment variables:

   ```bash
   heroku config:set MONGO_URI=your_mongo_uri JWT_SECRET=your_jwt_secret NODE_ENV=production
   ```

5. Deploy the application:
   ```bash
   git subtree push --prefix backend heroku main
   ```

## Security Considerations

### Authentication Security

1. **Password Handling**:

   - Passwords are never stored in plain text
   - bcrypt is used for secure password hashing
   - Minimum password requirements are enforced

2. **JWT Implementation**:

   - Tokens are stored as HTTP-only cookies to prevent XSS attacks
   - Tokens have an expiration time
   - CSRF protection is implemented

3. **Google OAuth**:
   - Firebase provides secure Google authentication
   - Only essential user data is stored

### Data Protection

1. **Input Validation**:

   - All user inputs are validated using Zod schemas
   - Protection against injection attacks

2. **Rate Limiting**:

   - API rate limiting is implemented to prevent abuse
   - Protection against brute force attacks

3. **Secure Headers**:
   - Content Security Policy (CSP) headers
   - CORS configuration to restrict access

## Performance Optimization

1. **Frontend Optimization**:

   - Code splitting for faster loading times
   - React.lazy and Suspense for component-level code splitting
   - Tailwind CSS purging for smaller CSS bundles
   - Image optimization for faster loading

2. **Backend Optimization**:

   - Database indexing for faster queries
   - Query optimization and pagination
   - Caching strategies for frequently accessed data

3. **API Performance**:
   - Response compression
   - Efficient database queries
   - Pagination for large data sets

## Testing

### Frontend Testing

- Unit tests with Jest
- Component testing with React Testing Library
- End-to-end testing with Cypress

### Backend Testing

- Unit tests with Jest
- API testing with Supertest
- Integration tests for database operations

## Code Style and Standards

The project follows consistent coding standards to maintain code quality:

- ESLint for code linting
- Prettier for code formatting
- Husky pre-commit hooks for automated linting and formatting
- TypeScript for type safety

## Future Roadmap

1. **Phase 1: Core Features** (Current)

   - User authentication (local & Google)
   - Post creation and interaction
   - User profiles
   - Follow system

2. **Phase 2: Enhanced Features**

   - Media uploads (images, videos)
   - Hashtags and trending topics
   - Direct messaging
   - Advanced notifications

3. **Phase 3: Advanced Features**
   - User verification system
   - Content moderation tools
   - Analytics dashboard
   - API for third-party developers

## Troubleshooting

### Common Issues

1. **Authentication Issues**:

   - Clear your cookies and try logging in again
   - Ensure your Google account has a valid email address
   - Check for correct username/password combination

2. **Post Creation Issues**:

   - Ensure you're logged in
   - Check that the content meets the character limits
   - Verify you have a proper internet connection

3. **Database Connection Issues**:
   - Verify MongoDB connection string
   - Ensure MongoDB service is running
   - Check network permissions

## Project Structure Deep Dive

### Frontend Component Hierarchy

```
App
├── AuthProvider
│   ├── Login
│   └── Signup
├── AppLayout
│   ├── Sidebar
│   ├── MainContent
│   │   ├── Home
│   │   │   ├── CreatePost
│   │   │   └── Posts
│   │   ├── ProfilePage
│   │   │   └── EditProfile
│   │   └── Notifications
│   └── RightPanel
```

### Backend Architecture

```
Server
├── Routes
│   ├── Auth Routes
│   ├── User Routes
│   ├── Post Routes
│   └── Notification Routes
├── Controllers
│   ├── Business Logic
│   └── Data Validation
├── Models
│   └── Database Schemas
└── Middleware
    └── Request Processing
```

## Design System

Tweetwave uses a consistent design system based on Tailwind CSS:

1. **Color Palette**:

   - Primary: Black/White theme
   - Accents: Gray and blue tones
   - System colors: Success (green), Warning (yellow), Error (red)

2. **Typography**:

   - Headings: Inter font, bold
   - Body: Inter font, regular
   - Consistent sizing scale

3. **Components**:
   - Buttons, inputs, cards, and other UI elements follow a consistent style
   - Responsive breakpoints at standard device sizes
   - Dark mode support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the open-source libraries that made this project possible
- Inspiration taken from Twitter/X's design and functionality
- Thanks to all contributors who have helped improve Tweetwave
