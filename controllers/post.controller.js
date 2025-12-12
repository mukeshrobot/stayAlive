import Post from '../models/Post.model.js';
import User from '../models/User.model.js';
import Team from '../models/Team.model.js';
import Notification from '../models/Notification.model.js';
import { io } from '../server.js';

// @desc    Create post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { caption, badgeWon, location, taggedUsers, opponent, match } = req.body;
    
    // Handle uploaded files
    const media = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        media.push({
          url: `/uploads/posts/${file.filename}`,
          type: file.mimetype.startsWith('video/') ? 'video' : 'image'
        });
      });
    }

    const post = await Post.create({
      user: req.user.id,
      caption,
      media: media || [],
      badgeWon,
      location,
      taggedUsers: taggedUsers || [],
      opponent,
      match
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'username profileImage')
      .populate('team', 'name logo')
      .populate('opponent', 'name logo')
      .populate('taggedUsers', 'username profileImage');

    // Create notifications for tagged users
    if (taggedUsers && taggedUsers.length > 0) {
      const notifications = taggedUsers.map(userId => ({
        user: userId,
        type: 'post_comment',
        title: 'You were tagged',
        message: `${req.user.username} tagged you in a post`,
        relatedPost: post._id,
        relatedUser: req.user.id
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: populatedPost }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get feed posts
// @route   GET /api/posts/feed
// @access  Private
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get posts from users and teams user follows (simplified - get all posts for now)
    const posts = await Post.find({ isActive: true })
      .populate('user', 'username profileImage')
      .populate('team', 'name logo')
      .populate('opponent', 'name logo')
      .populate('taggedUsers', 'username profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments({ isActive: true });

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

// @desc    Like/Unlike post
// @route   PUT /api/posts/:postId/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      await post.save();

      res.json({
        success: true,
        message: 'Post unliked',
        data: { liked: false, likesCount: post.likes.length }
      });
    } else {
      // Like
      post.likes.push({ user: req.user.id });
      await post.save();

      // Create notification (if not own post)
      if (post.user.toString() !== req.user.id.toString()) {
        await Notification.create({
          user: post.user,
          type: 'post_like',
          title: 'New Like',
          message: `${req.user.username} liked your post`,
          relatedPost: post._id,
          relatedUser: req.user.id
        });

        io.to(`user_${post.user}`).emit('notification', {
          type: 'post_like',
          message: 'Someone liked your post'
        });
      }

      res.json({
        success: true,
        message: 'Post liked',
        data: { liked: true, likesCount: post.likes.length }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:postId/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: req.user.id,
      text
    });
    await post.save();

    const comment = post.comments[post.comments.length - 1];
    await comment.populate('user', 'username profileImage');

    // Create notification (if not own post)
    if (post.user.toString() !== req.user.id.toString()) {
      await Notification.create({
        user: post.user,
        type: 'post_comment',
        title: 'New Comment',
        message: `${req.user.username} commented on your post`,
        relatedPost: post._id,
        relatedUser: req.user.id
      });

      io.to(`user_${post.user}`).emit('notification', {
        type: 'post_comment',
        message: 'Someone commented on your post'
      });
    }

    res.json({
      success: true,
      message: 'Comment added',
      data: { comment }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:postId
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

