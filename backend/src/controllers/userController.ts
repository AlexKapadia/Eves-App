import { Request, Response } from 'express';
import { User } from '../models';
import mongoose from 'mongoose';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields if they are provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.location) user.location = req.body.location;
    if (req.body.experienceLevel) user.experienceLevel = req.body.experienceLevel;
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Handle profile image upload (assuming we have middleware that stores the path)
    if (req.file && req.file.path) {
      user.profileImage = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
        location: updatedUser.location,
        experienceLevel: updatedUser.experienceLevel,
        joinedDate: updatedUser.joinedDate,
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

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('posts', 'content images createdAt likes comments')
      .populate('registeredEvents', 'title date location image')
      .populate('savedTrails', 'name location images');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Follow/Unfollow a user
// @route   PUT /api/users/:id/follow
// @access  Private
export const followUser = async (req: Request, res: Response) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already following
    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === req.params.id
    );

    if (alreadyFollowing) {
      // Unfollow user
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user._id.toString()
      );

      await currentUser.save();
      await userToFollow.save();

      return res.status(200).json({
        success: true,
        message: 'User unfollowed successfully',
        following: false,
      });
    } else {
      // Follow user
      currentUser.following.push(userToFollow._id as mongoose.Types.ObjectId);
      userToFollow.followers.push(currentUser._id as mongoose.Types.ObjectId);

      await currentUser.save();
      await userToFollow.save();

      return res.status(200).json({
        success: true,
        message: 'User followed successfully',
        following: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}; 