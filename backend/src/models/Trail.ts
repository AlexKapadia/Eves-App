import mongoose, { Document, Schema } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IReview {
  user: mongoose.Types.ObjectId;
  rating: number;
  text: string;
  date: Date;
}

export interface ITrail extends Document {
  name: string;
  location: string;
  description: string;
  length: number;
  difficulty: string;
  images: string[];
  coordinates: {
    startPoint: ICoordinates;
    endPoint: ICoordinates;
    path: ICoordinates[];
  };
  reviews: IReview[];
}

const trailSchema = new Schema<ITrail>(
  {
    name: {
      type: String,
      required: [true, 'Trail name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Trail location is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Trail description is required'],
    },
    length: {
      type: Number,
      required: [true, 'Trail length is required'],
      min: [0, 'Trail length cannot be negative'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Difficult', 'Expert'],
      required: [true, 'Difficulty level is required'],
    },
    images: [
      {
        type: String,
      },
    ],
    coordinates: {
      startPoint: {
        lat: {
          type: Number,
          required: [true, 'Start point latitude is required'],
        },
        lng: {
          type: Number,
          required: [true, 'Start point longitude is required'],
        },
      },
      endPoint: {
        lat: {
          type: Number,
          required: [true, 'End point latitude is required'],
        },
        lng: {
          type: Number,
          required: [true, 'End point longitude is required'],
        },
      },
      path: [
        {
          lat: {
            type: Number,
            required: true,
          },
          lng: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    reviews: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        text: {
          type: String,
          required: true,
        },
        date: {
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

// Virtual for average rating
trailSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Virtual for review count
trailSchema.virtual('reviewCount').get(function() {
  return this.reviews.length;
});

// Set toJSON option to include virtuals
trailSchema.set('toJSON', { virtuals: true });
trailSchema.set('toObject', { virtuals: true });

const Trail = mongoose.model<ITrail>('Trail', trailSchema);

export default Trail; 