import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  challenger: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  challenged: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  sport: {
    type: String,
    required: true,
    enum: ['Football', 'Cricket', 'Basketball', 'Tennis', 'Badminton', 'Volleyball', 'Other']
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    city: String
  },
  matchDate: {
    type: Date,
    required: true
  },
  matchTime: {
    type: String,
    required: true
  },
  badgeLevel: {
    type: String,
    required: true,
    enum: ['L1', 'L2', 'L3']
  },
  badgeCount: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  acceptedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;

