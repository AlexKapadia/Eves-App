import { Request, Response } from 'express';
import { Event, User } from '../models';
import mongoose from 'mongoose';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, location, distance, difficulty, totalSpots, price } = req.body;

    // Get the file path from multer middleware (if it exists)
    const imagePath = req.file ? req.file.path.replace(/\\/g, '/') : '';

    const event = await Event.create({
      title,
      description,
      date,
      location,
      distance,
      difficulty,
      totalSpots,
      price,
      image: imagePath,
      organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { difficulty, search, sortBy, limit = 10, page = 1 } = req.query;
    
    const query: any = {};
    
    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }
    
    // Search by title or location name
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.name': { $regex: search, $options: 'i' } },
      ];
    }
    
    // Only upcoming events (date > now)
    query.date = { $gte: new Date() };
    
    // Sort options
    let sort = {};
    if (sortBy === 'price-asc') {
      sort = { price: 1 };
    } else if (sortBy === 'price-desc') {
      sort = { price: -1 };
    } else {
      // Default sort by date
      sort = { date: 1 };
    }
    
    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const events = await Event.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate('organizer', 'name profileImage');
    
    // Get total count
    const total = await Event.countDocuments(query);
    
    res.status(200).json({
      success: true,
      events,
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

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name profileImage bio')
      .populate('participants.user', 'name profileImage');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event',
      });
    }
    
    // Update fields if they are provided
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        // Handle location object separately
        if (key === 'location' && typeof req.body[key] === 'object') {
          Object.keys(req.body[key]).forEach((locationKey) => {
            event.location[locationKey] = req.body[key][locationKey];
          });
        } else {
          event[key] = req.body[key];
        }
      }
    });
    
    // Handle image upload if there's a new image
    if (req.file && req.file.path) {
      event.image = req.file.path.replace(/\\/g, '/');
    }
    
    const updatedEvent = await event.save();
    
    res.status(200).json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }
    
    await event.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check if event is full
    if (event.bookedSpots >= event.totalSpots) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }
    
    // Check if user is already registered
    const isRegistered = event.participants.some(
      (participant) => participant.user.toString() === req.user._id.toString()
    );
    
    if (isRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }
    
    // Add user to event participants
    event.participants.push({
      user: req.user._id,
      bookingDate: new Date(),
    });
    
    // Increment booked spots
    event.bookedSpots += 1;
    
    await event.save();
    
    // Add event to user's registered events
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    user.registeredEvents.push(event._id as mongoose.Types.ObjectId);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// @desc    Unregister from an event
// @route   DELETE /api/events/:id/register
// @access  Private
export const unregisterFromEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }
    
    // Check if user is registered
    const participantIndex = event.participants.findIndex(
      (participant) => participant.user.toString() === req.user._id.toString()
    );
    
    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event',
      });
    }
    
    // Remove user from event participants
    event.participants.splice(participantIndex, 1);
    
    // Decrement booked spots
    event.bookedSpots = Math.max(0, event.bookedSpots - 1);
    
    await event.save();
    
    // Remove event from user's registered events
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    user.registeredEvents = user.registeredEvents.filter(
      (id) => id.toString() !== event._id.toString()
    );
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from event',
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}; 