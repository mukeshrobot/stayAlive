import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  team1: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    score: {
      type: Number,
      default: 0
    }
  },
  team2: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    score: {
      type: Number,
      default: 0
    }
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  loser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'scheduled'
  },
  result: {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date
    },
    proof: [{
      type: String, // URLs to proof images/videos
    }],
    message: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date
    },
    disputed: {
      type: Boolean,
      default: false
    },
    disputeReason: {
      type: String
    },
    disputeResolved: {
      type: Boolean,
      default: false
    }
  },
  badgeTransfer: {
    fromTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    toTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    badgeLevel: {
      type: String,
      enum: ['L1', 'L2', 'L3']
    },
    badgeCount: {
      type: Number,
      default: 1
    },
    transferred: {
      type: Boolean,
      default: false
    },
    transferredAt: {
      type: Date
    }
  },
  matchDate: {
    type: Date,
    required: true
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Match = mongoose.model('Match', matchSchema);

export default Match;

