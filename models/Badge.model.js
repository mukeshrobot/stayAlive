import mongoose from 'mongoose';

const badgeTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earned', 'transferred', 'received', 'purchased', 'bonus'],
    required: true
  },
  badgeLevel: {
    type: String,
    enum: ['L1', 'L2', 'L3'],
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 1
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fromTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  toTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const BadgeTransaction = mongoose.model('BadgeTransaction', badgeTransactionSchema);

// Badge Inventory Schema
const badgeInventorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  L1: {
    type: Number,
    default: 0,
    min: 0
  },
  L2: {
    type: Number,
    default: 0,
    min: 0
  },
  L3: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update total before saving
badgeInventorySchema.pre('save', function(next) {
  this.total = this.L1 + this.L2 + this.L3;
  next();
});

const BadgeInventory = mongoose.model('BadgeInventory', badgeInventorySchema);

export { BadgeTransaction, BadgeInventory };

