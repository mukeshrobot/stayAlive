import Team from '../models/Team.model.js';
import User from '../models/User.model.js';
import { BadgeInventory } from '../models/Badge.model.js';

// @desc    Create team
// @route   POST /api/teams
// @access  Private
export const createTeam = async (req, res) => {
  try {
    const { name, sport, city, state, country } = req.body;

    const team = await Team.create({
      name,
      sport,
      city,
      state,
      country: country || 'India',
      captain: req.user.id,
      members: [{
        user: req.user.id,
        role: 'member'
      }]
    });

    // Create badge inventory for team
    await BadgeInventory.create({
      team: team._id
    });

    // Update user's team count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { teams: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: { team }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get team details
// @route   GET /api/teams/:teamId
// @access  Public
export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId)
      .populate('captain', 'username profileImage')
      .populate('members.user', 'username profileImage');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Get badge inventory
    const badgeInventory = await BadgeInventory.findOne({ team: team._id });

    res.json({
      success: true,
      data: {
        team,
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

// @desc    Get user's teams
// @route   GET /api/teams/my-teams
// @access  Private
export const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { captain: req.user.id },
        { 'members.user': req.user.id }
      ],
      isActive: true
    })
    .populate('captain', 'username profileImage')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { teams }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

