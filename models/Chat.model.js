import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  media: {
    url: String,
    type: {
      type: String,
      enum: ['image', 'video', 'file']
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [messageSchema],
  type: {
    type: String,
    enum: ['direct', 'team', 'group'],
    default: 'direct'
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  lastMessage: {
    type: Date,
    default: Date.now
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

// Indexes
chatSchema.index({ 'participants.user': 1, lastMessage: -1 });
chatSchema.index({ createdAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;

