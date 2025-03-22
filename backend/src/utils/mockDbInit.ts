import mongoose from 'mongoose';
import { mockDB } from '../config/db';
import bcrypt from 'bcrypt';
import { IUser } from '../models/User';

// Flag to ensure we don't initialize mock data more than once
let mockDataInitialized = false;

// Initialize mock data for local development without MongoDB
export const initMockData = async () => {
  // Don't initialize mock data more than once
  if (mockDataInitialized) {
    console.log('Mock data already initialized, skipping...');
    return;
  }

  console.log('Initializing mock database...');
  
  try {
    // Clear existing mock data to avoid duplicates
    mockDB.users = [];
    mockDB.events = [];
    mockDB.posts = [];
    mockDB.trails = [];

    // Create mock users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: hashedPassword,
        profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
        bio: 'Hiking enthusiast and nature lover',
        location: 'Seattle, WA',
        experienceLevel: 'Intermediate',
        joinedDate: new Date('2023-01-15'),
        savedTrails: [],
        registeredEvents: [],
        posts: [],
        followers: [],
        following: [],
        comparePassword: async function(candidatePassword: string): Promise<boolean> {
          return await bcrypt.compare(candidatePassword, this.password);
        }
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Emma Smith',
        email: 'emma@example.com',
        password: hashedPassword,
        profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
        bio: 'Mountain climber and photographer',
        location: 'Portland, OR',
        experienceLevel: 'Advanced',
        joinedDate: new Date('2023-02-20'),
        savedTrails: [],
        registeredEvents: [],
        posts: [],
        followers: [],
        following: [],
        comparePassword: async function(candidatePassword: string): Promise<boolean> {
          return await bcrypt.compare(candidatePassword, this.password);
        }
      }
    ];
    
    // Create mock events
    const events = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Weekend Trail Hike',
        description: 'Join us for a beautiful weekend hike on the mountain trails.',
        date: new Date('2023-07-15'),
        location: {
          name: 'Mount Rainier National Park',
          coordinates: { lat: 46.8800, lng: -121.7269 }
        },
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
        distance: '8 miles',
        difficulty: 'Moderate',
        totalSpots: 15,
        bookedSpots: 5,
        price: 25,
        organizer: users[0]._id,
        participants: []
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Sunrise Mountain Trek',
        description: 'Experience the beauty of a sunrise from the mountain peak.',
        date: new Date('2023-08-10'),
        location: {
          name: 'Olympic National Park',
          coordinates: { lat: 47.8021, lng: -123.6044 }
        },
        image: 'https://images.unsplash.com/photo-1535224206242-487f7090b5bb',
        distance: '5 miles',
        difficulty: 'Easy',
        totalSpots: 20,
        bookedSpots: 8,
        price: 15,
        organizer: users[1]._id,
        participants: []
      }
    ];
    
    // Create mock posts
    const posts = [
      {
        _id: new mongoose.Types.ObjectId(),
        author: users[0]._id,
        content: 'Just finished a beautiful hike! The views were amazing.',
        images: ['https://images.unsplash.com/photo-1551632811-561732d1e306'],
        createdAt: new Date('2023-03-15'),
        updatedAt: new Date('2023-03-15'),
        likes: [],
        comments: []
      },
      {
        _id: new mongoose.Types.ObjectId(),
        author: users[1]._id,
        content: 'Anyone recommend good hiking boots for rocky terrain?',
        images: [],
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2023-03-10'),
        likes: [users[0]._id],
        comments: [{
          _id: new mongoose.Types.ObjectId(),
          user: users[0]._id,
          text: 'I recommend the Merrell Moab 2. They\'ve been great for me on all terrains!',
          createdAt: new Date('2023-03-11')
        }]
      }
    ];
    
    // Assign posts to users
    users[0].posts.push(posts[0]._id);
    users[1].posts.push(posts[1]._id);
    
    // Populate mockDB
    mockDB.users.push(...users);
    mockDB.events.push(...events);
    mockDB.posts.push(...posts);
    
    // Set flag to true to prevent re-initialization
    mockDataInitialized = true;
    
    console.log('Mock data initialized successfully');
    console.log(`Users: ${mockDB.users.length}`);
    console.log(`Events: ${mockDB.events.length}`);
    console.log(`Posts: ${mockDB.posts.length}`);
    
    // Print available test accounts for reference
    console.log('Test accounts:');
    mockDB.users.forEach(user => {
      console.log(`${user.email} / password123`);
    });
  } catch (error) {
    console.error('Failed to initialize mock data:', error);
    throw error;
  }
};

export default initMockData; 