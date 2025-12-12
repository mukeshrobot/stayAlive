import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a team name'],
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  logo: {
    type: String,
    default: null
  },
  sport: {
    type: String,
    required: [true, 'Please provide a sport'],
    enum: ['Football', 'Cricket', 'Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Other']
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'India'
  },
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'coach', 'manager'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  winRate: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 1
  },
  totalMatches: {
    type: Number,
    default: 0
  },
  wins: {
    type: Number,
    default: 0
  },
  losses: {
    type: Number,
    default: 0
  },
  draws: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate win rate before saving
teamSchema.pre('save', function(next) {
  if (this.totalMatches > 0) {
    this.winRate = (this.wins / this.totalMatches).toFixed(2);
  }
  next();
});

const Team = mongoose.model('Team', teamSchema);

export default Team;

