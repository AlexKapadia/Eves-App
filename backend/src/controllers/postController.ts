import { Request, Response } from 'express';
import { Post, User } from '../models';
import mongoose from 'mongoose';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    
    // Get image paths from multer middleware (if any)
    const images = req.files ? 
      (req.files as Express.Multer.File[]).map(file => file.path.replace(/\\/g, '/')) : 
      [];
    
    const post = await Post.create({
      author: req.user._id,
      content,
      images,
    });
    
    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id },
    });
    
    // Populate author data
    const populatedPost = await Post.findById(post._id).populate('author', 'name profileImage');
    
    res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, sort = 'latest' } = req.query;
    
    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort options
    let sortOption = {};
    if (sort === 'latest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { likes: -1 };
    }
    
    const posts = await Post.find()
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip)
      .populate('author', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    // Get total count
    const total = await Post.countDocuments();
    
    res.status(200).json({
      success: true,
      posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name profileImage bio')
      .populate('comments.user', 'name profileImage');
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }
    
    // Update content if provided
    if (req.body.content) {
      post.content = req.body.content;
    }
    
    // Handle image uploads if any
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = (req.files as Express.Multer.File[]).map(file => 
        file.path.replace(/\\/g, '/')
      );
      
      // If keepExistingImages flag is provided and true, append new images
      if (req.body.keepExistingImages === 'true') {
        post.images.push(...newImages);
      } else {
        // Otherwise replace existing images
        post.images = newImages;
      }
    }
    
    const updatedPost = await post.save();
    
    // Populate author data
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('author', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    res.status(200).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }
    
    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id },
    });
    
    await post.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Check if post is already liked
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );
    
    if (alreadyLiked) {
      // Unlike post
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
      
      await post.save();
      
      return res.status(200).json({
        success: true,
        message: 'Post unliked',
        liked: false,
        likesCount: post.likes.length,
      });
    }
    
    // Like post
    post.likes.push(req.user._id as mongoose.Types.ObjectId);
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Post liked',
      liked: true,
      likesCount: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    const comment = {
      _id: new mongoose.Types.ObjectId(),
      user: req.user._id,
      text,
      createdAt: new Date(),
    };
    
    post.comments.push(comment);
    await post.save();
    
    // Get updated post with populated comments
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name profileImage')
      .populate('comments.user', 'name profileImage');
    
    res.status(201).json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    
    // Find comment
    const comment = post.comments.find(
      (c) => c._id && c._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }
    
    // Check if user is the comment author or post author
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }
    
    // Remove comment
    post.comments = post.comments.filter(
      (c) => !c._id || c._id.toString() !== req.params.commentId
    );
    
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}; 