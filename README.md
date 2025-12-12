# SportSync Backend API

A comprehensive Node.js/Express backend API for the SportSync application - Challenge anyone, anywhere, win rewards.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with user registration and login
- **Team Management**: Create and manage teams
- **Challenge System**: Send, accept, and decline challenges
- **Match Results**: Submit and acknowledge match results with badge transfers
- **Social Feed**: Create posts, like, comment, and share
- **Real-time Chat**: Socket.IO powered messaging
- **Notifications**: Real-time notifications for all activities
- **Badge System**: Track and transfer badges (L1, L2, L3)
- **File Uploads**: Handle images and videos with Multer

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/sportsync
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system

6. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/:userId/posts` - Get user posts

### Teams
- `POST /api/teams` - Create team (Protected)
- `GET /api/teams/my-teams` - Get user's teams (Protected)
- `GET /api/teams/:teamId` - Get team details

### Challenges
- `GET /api/challenges/discover` - Discover teams (Protected)
- `GET /api/challenges` - Get challenges (Protected)
- `POST /api/challenges` - Create challenge (Protected)
- `PUT /api/challenges/:challengeId/accept` - Accept challenge (Protected)
- `PUT /api/challenges/:challengeId/decline` - Decline challenge (Protected)

### Matches
- `GET /api/matches/:matchId` - Get match details (Protected)
- `POST /api/matches/:matchId/result` - Submit match result (Protected)
- `PUT /api/matches/:matchId/acknowledge` - Acknowledge result (Protected)
- `PUT /api/matches/:matchId/dispute` - Dispute result (Protected)

### Posts
- `GET /api/posts/feed` - Get feed posts (Protected)
- `POST /api/posts` - Create post (Protected)
- `PUT /api/posts/:postId/like` - Like/Unlike post (Protected)
- `POST /api/posts/:postId/comments` - Add comment (Protected)
- `DELETE /api/posts/:postId` - Delete post (Protected)

### Chat
- `GET /api/chat` - Get chat list (Protected)
- `GET /api/chat/:userId` - Get or create chat (Protected)
- `POST /api/chat/:chatId/messages` - Send message (Protected)
- `PUT /api/chat/:chatId/read` - Mark as read (Protected)

### Notifications
- `GET /api/notifications` - Get notifications (Protected)
- `PUT /api/notifications/:notificationId/read` - Mark as read (Protected)
- `PUT /api/notifications/read-all` - Mark all as read (Protected)
- `DELETE /api/notifications/:notificationId` - Delete notification (Protected)

### Badges
- `GET /api/badges/inventory` - Get badge inventory (Protected)
- `GET /api/badges/transactions` - Get badge transactions (Protected)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📁 Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── socket/          # Socket.IO handlers
├── uploads/         # Uploaded files
├── server.js        # Main server file
└── package.json     # Dependencies
```

## 🗄️ Database Models

- **User**: User accounts and profiles
- **Team**: Sports teams
- **Challenge**: Challenge requests
- **Match**: Match results and outcomes
- **Post**: Social media posts
- **Chat**: Direct messaging
- **Notification**: User notifications
- **BadgeTransaction**: Badge transfer history
- **BadgeInventory**: Current badge counts

## 🔄 Real-time Features

Socket.IO is used for:
- Real-time notifications
- Live chat messaging
- Typing indicators
- Badge transfer updates

## 📤 File Uploads

Files are uploaded to `uploads/` directory:
- `uploads/profiles/` - Profile images
- `uploads/posts/` - Post media
- `uploads/teams/` - Team logos
- `uploads/matches/` - Match proof

## 🧪 Testing

Health check endpoint:
```
GET /api/health
```

## 🚨 Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/sportsync |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for SportSync**

