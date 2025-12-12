# SportSync Backend - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set at minimum:
# - MONGODB_URI (default: mongodb://localhost:27017/sportsync)
# - JWT_SECRET (any random string)
```

### Step 3: Start MongoDB
Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 4: Run the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### Step 5: Test the API
Open your browser or use Postman:
```
GET http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "SportSync API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📝 First API Call

### Register a User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrPhone": "test@example.com",
  "password": "password123"
}
```

Save the `token` from the response for authenticated requests.

### Get Your Profile
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_token_here>
```

## 🎯 Common Endpoints

### Create a Team
```bash
POST http://localhost:5000/api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Thunder FC",
  "sport": "Football",
  "city": "Mumbai"
}
```

### Discover Teams
```bash
GET http://localhost:5000/api/challenges/discover?city=Mumbai
Authorization: Bearer <token>
```

### Create a Challenge
```bash
POST http://localhost:5000/api/challenges
Authorization: Bearer <token>
Content-Type: application/json

{
  "challengedTeamId": "<team_id>",
  "sport": "Football",
  "location": {
    "address": "Mumbai Sports Complex"
  },
  "matchDate": "2024-12-25",
  "matchTime": "15:00",
  "badgeLevel": "L2",
  "badgeCount": 1
}
```

## 🔧 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify connection string in `.env`
- Default: `mongodb://localhost:27017/sportsync`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 5000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall

## 📚 Next Steps

1. Read the full [README.md](./README.md) for detailed documentation
2. Explore all API endpoints
3. Connect your Flutter frontend
4. Set up Socket.IO for real-time features

## 💡 Tips

- Use `npm run dev` during development for auto-restart
- Check console logs for debugging
- All file uploads go to `uploads/` directory
- Socket.IO runs on the same port as HTTP

---

**Happy Coding! 🎉**

