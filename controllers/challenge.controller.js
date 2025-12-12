import Challenge from '../models/Challenge.model.js';
import Team from '../models/Team.model.js';
import Match from '../models/Match.model.js';
import Notification from '../models/Notification.model.js';
import { io } from '../server.js';

// @desc    Create challenge
// @route   POST /api/challenges
// @access  Private
export const createChallenge = async (req, res) => {
  try {
    const {
      challengedTeamId,
      sport,
      location,
      matchDate,
      matchTime,
      badgeLevel,
      badgeCount,
      message
    } = req.body;

    const challengerTeam = await Team.findOne({ captain: req.user.id });
    if (!challengerTeam) {
      return res.status(404).json({
        success: false,
        message: 'You must be a team captain to create challenges'
      });
    }

    const challengedTeam = await Team.findById(challengedTeamId);
    if (!challengedTeam) {
      return res.status(404).json({
        success: false,
        message: 'Challenged team not found'
      });
    }

    const challenge = await Challenge.create({
      challenger: {
        team: challengerTeam._id,
        userId: req.user.id
      },
      challenged: {
        team: challengedTeam._id,
        userId: challengedTeam.captain
      },
      sport,
      location,
      matchDate,
      matchTime,
      badgeLevel,
      badgeCount: badgeCount || 1,
      message,
      status: 'pending'
    });

    // Create notification for challenged team
    await Notification.create({
      user: challengedTeam.captain,
      type: 'challenge_received',
      title: 'New Challenge Received',
      message: `${challengerTeam.name} has challenged you!`,
      relatedTeam: challengerTeam._id,
      relatedChallenge: challenge._id
    });

    // Emit real-time notification
    io.to(`user_${challengedTeam.captain}`).emit('notification', {
      type: 'challenge_received',
      message: `${challengerTeam.name} has challenged you!`
    });

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: { challenge }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get challenges
// @route   GET /api/challenges
// @access  Private
export const getChallenges = async (req, res) => {
  try {
    const { status, type = 'received' } = req.query;
    const userId = req.user.id;

    let query = {};

    if (type === 'received') {
      query['challenged.userId'] = userId;
    } else if (type === 'sent') {
      query['challenger.userId'] = userId;
    }

    if (status) {
      query.status = status;
    }

    const challenges = await Challenge.find(query)
      .populate('challenger.team', 'name logo sport city winRate')
      .populate('challenged.team', 'name logo sport city winRate')
      .populate('challenger.userId', 'username profileImage')
      .populate('challenged.userId', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { challenges }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Accept challenge
// @route   PUT /api/challenges/:challengeId/accept
// @access  Private
export const acceptChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.challenged.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept this challenge'
      });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Challenge is not in pending status'
      });
    }

    challenge.status = 'accepted';
    challenge.acceptedAt = new Date();
    await challenge.save();

    // Create match
    const match = await Match.create({
      challenge: challenge._id,
      team1: {
        team: challenge.challenger.team,
        score: 0
      },
      team2: {
        team: challenge.challenged.team,
        score: 0
      },
      matchDate: challenge.matchDate,
      location: challenge.location,
      status: 'scheduled'
    });

    // Create notifications
    await Notification.create([
      {
        user: challenge.challenger.userId,
        type: 'challenge_accepted',
        title: 'Challenge Accepted',
        message: `${challenge.challenged.team.name} accepted your challenge!`,
        relatedTeam: challenge.challenged.team,
        relatedChallenge: challenge._id,
        relatedMatch: match._id
      },
      {
        user: challenge.challenged.userId,
        type: 'challenge_accepted',
        title: 'Challenge Accepted',
        message: 'You accepted the challenge!',
        relatedTeam: challenge.challenger.team,
        relatedChallenge: challenge._id,
        relatedMatch: match._id
      }
    ]);

    // Emit real-time notifications
    io.to(`user_${challenge.challenger.userId}`).emit('notification', {
      type: 'challenge_accepted',
      message: 'Your challenge was accepted!'
    });

    res.json({
      success: true,
      message: 'Challenge accepted successfully',
      data: { challenge, match }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Decline challenge
// @route   PUT /api/challenges/:challengeId/decline
// @access  Private
export const declineChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.challenged.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to decline this challenge'
      });
    }

    challenge.status = 'declined';
    await challenge.save();

    // Create notification
    await Notification.create({
      user: challenge.challenger.userId,
      type: 'challenge_declined',
      title: 'Challenge Declined',
      message: `${challenge.challenged.team.name} declined your challenge`,
      relatedTeam: challenge.challenged.team,
      relatedChallenge: challenge._id
    });

    res.json({
      success: true,
      message: 'Challenge declined'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get discoverable teams
// @route   GET /api/challenges/discover
// @access  Private
export const discoverTeams = async (req, res) => {
  try {
    const { sport, city, limit = 20 } = req.query;
    const userId = req.user.id;

    let query = {
      isActive: true,
      captain: { $ne: userId } // Exclude user's own teams
    };

    if (sport) {
      query.sport = sport;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const teams = await Team.find(query)
      .populate('captain', 'username profileImage')
      .select('name logo sport city winRate totalMatches wins')
      .limit(parseInt(limit))
      .sort({ winRate: -1, totalMatches: -1 });

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

