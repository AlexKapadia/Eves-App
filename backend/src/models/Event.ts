import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  [key: string]: any; // Add index signature to allow string indexing
}

export interface IParticipant {
  user: mongoose.Types.ObjectId;
  bookingDate: Date;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: ILocation;
  image: string;
  distance: string;
  difficulty: string;
  totalSpots: number;
  bookedSpots: number;
  price: number;
  organizer: mongoose.Types.ObjectId;
  participants: IParticipant[];
  [key: string]: any; // Add index signature to allow string indexing
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      name: {
        type: String,
        required: [true, 'Location name is required'],
      },
      coordinates: {
        lat: {
          type: Number,
          required: [true, 'Latitude is required'],
        },
        lng: {
          type: Number,
          required: [true, 'Longitude is required'],
        },
      },
    },
    image: {
      type: String,
      default: '',
    },
    distance: {
      type: String,
      required: [true, 'Distance is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Difficult', 'Expert'],
      required: [true, 'Difficulty level is required'],
    },
    totalSpots: {
      type: Number,
      required: [true, 'Total spots is required'],
      min: [1, 'Total spots must be at least 1'],
    },
    bookedSpots: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    participants: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        bookingDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual property to determine if event is full
eventSchema.virtual('isFull').get(function() {
  return this.bookedSpots >= this.totalSpots;
});

// Virtual property to determine if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return new Date(this.date) > new Date();
});

// Virtual property for available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.totalSpots - this.bookedSpots);
});

// Set toJSON option to include virtuals
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event; 