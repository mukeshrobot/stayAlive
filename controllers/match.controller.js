import Match from '../models/Match.model.js';
import Challenge from '../models/Challenge.model.js';
import Team from '../models/Team.model.js';
import User from '../models/User.model.js';
import { BadgeTransaction, BadgeInventory } from '../models/Badge.model.js';
import Notification from '../models/Notification.model.js';
import { io } from '../server.js';

// @desc    Submit match result
// @route   POST /api/matches/:matchId/result
// @access  Private
export const submitMatchResult = async (req, res) => {
  try {
    const { team1Score, team2Score, message, proof } = req.body;
    const matchId = req.params.matchId;

    const match = await Match.findById(matchId).populate('challenge');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is authorized (must be captain of one of the teams)
    const userTeam = await Team.findOne({
      $or: [
        { _id: match.team1.team, captain: req.user.id },
        { _id: match.team2.team, captain: req.user.id }
      ]
    });

    if (!userTeam) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit results for this match'
      });
    }

    // Update scores
    match.team1.score = team1Score;
    match.team2.score = team2Score;

    // Determine winner
    if (team1Score > team2Score) {
      match.winner = match.team1.team;
      match.loser = match.team2.team;
    } else if (team2Score > team1Score) {
      match.winner = match.team2.team;
      match.loser = match.team1.team;
    }

    // Update match result
    match.result = {
      submittedBy: req.user.id,
      submittedAt: new Date(),
      proof: proof || [],
      message: message || ''
    };

    match.status = 'completed';
    match.completedAt = new Date();
    await match.save();

    // Update challenge status
    if (match.challenge) {
      match.challenge.status = 'completed';
      match.challenge.completedAt = new Date();
      await match.challenge.save();
    }

    // Create notification for opponent
    const opponentTeam = match.team1.team.toString() === userTeam._id.toString()
      ? match.team2.team
      : match.team1.team;

    const opponentTeamData = await Team.findById(opponentTeam);

    await Notification.create({
      user: opponentTeamData.captain,
      type: 'match_result',
      title: 'Match Result Received',
      message: `${userTeam.name} submitted match results`,
      relatedMatch: match._id,
      relatedTeam: userTeam._id
    });

    // Emit real-time notification
    io.to(`user_${opponentTeamData.captain}`).emit('notification', {
      type: 'match_result',
      message: 'Match result received!'
    });

    res.json({
      success: true,
      message: 'Match result submitted successfully',
      data: { match }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Acknowledge match result
// @route   PUT /api/matches/:matchId/acknowledge
// @access  Private
export const acknowledgeMatchResult = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId).populate('challenge');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Check if user is authorized (must be captain of losing team)
    const losingTeam = await Team.findById(match.loser);
    if (losingTeam.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to acknowledge this result'
      });
    }

    // Acknowledge result
    match.result.acknowledged = true;
    match.result.acknowledgedBy = req.user.id;
    match.result.acknowledgedAt = new Date();
    await match.save();

    // Transfer badges
    if (match.challenge && match.winner && match.loser) {
      const badgeLevel = match.challenge.badgeLevel;
      const badgeCount = match.challenge.badgeCount || 1;

      // Get badge inventories
      const winnerInventory = await BadgeInventory.findOne({
        team: match.winner
      });
      const loserInventory = await BadgeInventory.findOne({
        team: match.loser
      });

      // Transfer badges
      if (loserInventory && loserInventory[badgeLevel] >= badgeCount) {
        loserInventory[badgeLevel] -= badgeCount;
        await loserInventory.save();

        if (winnerInventory) {
          winnerInventory[badgeLevel] += badgeCount;
          await winnerInventory.save();
        } else {
          await BadgeInventory.create({
            team: match.winner,
            [badgeLevel]: badgeCount
          });
        }

        // Create badge transaction
        await BadgeTransaction.create({
          type: 'transferred',
          badgeLevel,
          count: badgeCount,
          fromTeam: match.loser,
          toTeam: match.winner,
          match: match._id,
          challenge: match.challenge._id,
          description: `Badge transferred from ${losingTeam.name} to winner`
        });

        // Update match badge transfer
        match.badgeTransfer = {
          fromTeam: match.loser,
          toTeam: match.winner,
          badgeLevel,
          badgeCount,
          transferred: true,
          transferredAt: new Date()
        };
        await match.save();

        // Update team stats
        const winnerTeam = await Team.findById(match.winner);
        const loserTeam = await Team.findById(match.loser);

        winnerTeam.wins += 1;
        winnerTeam.totalMatches += 1;
        winnerTeam.winRate = (winnerTeam.wins / winnerTeam.totalMatches).toFixed(2);
        await winnerTeam.save();

        loserTeam.losses += 1;
        loserTeam.totalMatches += 1;
        loserTeam.winRate = (loserTeam.wins / loserTeam.totalMatches).toFixed(2);
        await loserTeam.save();

        // Create notifications
        await Notification.create([
          {
            user: winnerTeam.captain,
            type: 'badge_transferred',
            title: 'Badge Received!',
            message: `You won ${badgeCount} ${badgeLevel} badge(s) from ${losingTeam.name}`,
            relatedMatch: match._id,
            relatedTeam: match.loser
          },
          {
            user: loserTeam.captain,
            type: 'badge_transferred',
            title: 'Badge Transferred',
            message: `${badgeCount} ${badgeLevel} badge(s) transferred to ${winnerTeam.name}`,
            relatedMatch: match._id,
            relatedTeam: match.winner
          }
        ]);

        // Emit real-time notifications
        io.to(`user_${winnerTeam.captain}`).emit('badge_transfer', {
          type: 'received',
          badgeLevel,
          count: badgeCount
        });
      }
    }

    res.json({
      success: true,
      message: 'Match result acknowledged and badges transferred'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Dispute match result
// @route   PUT /api/matches/:matchId/dispute
// @access  Private
export const disputeMatchResult = async (req, res) => {
  try {
    const { reason } = req.body;
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    match.result.disputed = true;
    match.result.disputeReason = reason;
    match.status = 'disputed';
    await match.save();

    res.json({
      success: true,
      message: 'Match result disputed. Admin will review.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get match details
// @route   GET /api/matches/:matchId
// @access  Private
export const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('team1.team', 'name logo')
      .populate('team2.team', 'name logo')
      .populate('winner', 'name logo')
      .populate('loser', 'name logo')
      .populate('challenge');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: { match }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

