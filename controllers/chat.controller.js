import Chat from '../models/Chat.model.js';
import User from '../models/User.model.js';
import Team from '../models/Team.model.js';
import Notification from '../models/Notification.model.js';
import { io } from '../server.js';

// @desc    Get or create chat
// @route   GET /api/chat/:userId
// @access  Private
export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find existing chat
    let chat = await Chat.findOne({
      type: 'direct',
      participants: {
        $all: [
          { $elemMatch: { user: req.user.id } },
          { $elemMatch: { user: userId } }
        ]
      }
    })
    .populate('participants.user', 'username profileImage')
    .populate('messages.sender', 'username profileImage');

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        type: 'direct',
        participants: [
          { user: req.user.id },
          { user: userId }
        ],
        messages: []
      });

      chat = await Chat.findById(chat._id)
        .populate('participants.user', 'username profileImage')
        .populate('messages.sender', 'username profileImage');
    }

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get chat list
// @route   GET /api/chat
// @access  Private
export const getChatList = async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.user': req.user.id,
      isActive: true
    })
    .populate('participants.user', 'username profileImage')
    .populate('messages.sender', 'username profileImage')
    .sort({ lastMessage: -1 })
    .limit(50);

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { text, media } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat'
      });
    }

    // Add message
    const message = {
      sender: req.user.id,
      text: text || '',
      media: media || null
    };

    chat.messages.push(message);
    chat.lastMessage = new Date();

    // Update last read for sender
    const senderParticipant = chat.participants.find(
      p => p.user.toString() === req.user.id.toString()
    );
    if (senderParticipant) {
      senderParticipant.lastRead = new Date();
    }

    await chat.save();

    const populatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'username profileImage')
      .populate('participants.user', 'username profileImage');

    const newMessage = populatedChat.messages[populatedChat.messages.length - 1];

    // Emit to other participants
    chat.participants.forEach(participant => {
      if (participant.user.toString() !== req.user.id.toString()) {
        io.to(`user_${participant.user}`).emit('new_message', {
          chatId: chat._id,
          message: newMessage
        });

        // Create notification
        Notification.create({
          user: participant.user,
          type: 'system',
          title: 'New Message',
          message: `${req.user.username} sent you a message`,
          relatedUser: req.user.id
        });
      }
    });

    res.json({
      success: true,
      message: 'Message sent',
      data: { message: newMessage }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Update last read for user
    const participant = chat.participants.find(
      p => p.user.toString() === req.user.id.toString()
    );

    if (participant) {
      participant.lastRead = new Date();
      await chat.save();
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

