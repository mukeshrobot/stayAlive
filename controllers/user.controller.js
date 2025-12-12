import User from '../models/User.model.js';
import Team from '../models/Team.model.js';
import Post from '../models/Post.model.js';
import { BadgeInventory } from '../models/Badge.model.js';

// @desc    Get user profile
// @route   GET /api/users/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's teams
    const teams = await Team.find({
      $or: [
        { captain: user._id },
        { 'members.user': user._id }
      ]
    });

    // Get badge inventory
    const badgeInventory = await BadgeInventory.findOne({ user: user._id });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          bio: user.bio,
          wins: user.wins,
          teams: teams.length,
          winRate: user.winRate,
          level: user.level,
          streak: user.streak,
          createdAt: user.createdAt
        },
        teams,
        badges: badgeInventory || { L1: 0, L2: 0, L3: 0, total: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user posts
// @route   GET /api/users/:userId/posts
// @access  Public
export const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username profileImage')
      .populate('team', 'name logo')
      .populate('opponent', 'name logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ user: req.params.userId });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
    .select('username email profileImage bio wins winRate')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

