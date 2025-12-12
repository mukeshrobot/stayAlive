import { BadgeTransaction, BadgeInventory } from '../models/Badge.model.js';
import User from '../models/User.model.js';
import Team from '../models/Team.model.js';

// @desc    Get badge inventory
// @route   GET /api/badges/inventory
// @access  Private
export const getBadgeInventory = async (req, res) => {
  try {
    let inventory = await BadgeInventory.findOne({ user: req.user.id });

    if (!inventory) {
      inventory = await BadgeInventory.create({ user: req.user.id });
    }

    res.json({
      success: true,
      data: { inventory }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get badge transactions
// @route   GET /api/badges/transactions
// @access  Private
export const getBadgeTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await BadgeTransaction.find({
      $or: [
        { fromUser: req.user.id },
        { toUser: req.user.id },
        { fromTeam: { $in: await Team.find({ captain: req.user.id }).distinct('_id') } },
        { toTeam: { $in: await Team.find({ captain: req.user.id }).distinct('_id') } }
      ]
    })
    .populate('fromUser', 'username')
    .populate('toUser', 'username')
    .populate('fromTeam', 'name')
    .populate('toTeam', 'name')
    .populate('match')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await BadgeTransaction.countDocuments({
      $or: [
        { fromUser: req.user.id },
        { toUser: req.user.id }
      ]
    });

    res.json({
      success: true,
      data: {
        transactions,
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

