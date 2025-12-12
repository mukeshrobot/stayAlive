# Environment Setup

## Quick Fix for JWT Secret Error

The error "secret or private key must have value" occurs because the `.env` file is missing.

### Steps to Fix:

1. **Create a `.env` file in the `backend` directory**

2. **Copy the contents below into the `.env` file:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sportsync

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
```

3. **Restart your backend server:**

```bash
cd backend
npm run dev
```

### Important Notes:

- **JWT_SECRET**: Change this to a secure random string in production (minimum 32 characters)
- **MONGODB_URI**: Make sure MongoDB is running and accessible at this URI
- The `.env` file is in `.gitignore` and won't be committed to version control

### Quick Command (Windows PowerShell):

```powershell
cd backend
@"
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sportsync

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-characters
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
"@ | Out-File -FilePath .env -Encoding utf8
```

