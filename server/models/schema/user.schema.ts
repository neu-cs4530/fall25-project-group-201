import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 * - `biography`: The user's bio/about me section.
 * - `profilePicture`: URL to the user's profile picture.
 * - `bannerImage`: URL to the user's banner image.
 * - `resumeFile`: URL to the user's downloadable resume/CV.
 * - `portfolioModels`: Array of URLs to user's 3D model files.
 * - `externalLinks`: Links to external profiles (GitHub, ArtStation, LinkedIn, etc.).
 * - `customColors`: User's custom theme colors.
 * - `customFont`: User's custom font selection.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    // profile customization fields for sprint 1
    profilePicture: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    resumeFile: {
      type: String,
      default: '',
    },
    // implement other implementations of 3D models
    portfolioModels: {
      type: [String],
      default: [],
    },
    portfolioThumbnails: {
      type: [String],
      default: [],
    },
    externalLinks: {
      type: {
        github: { type: String, default: '' },
        artstation: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' },
      },
      default: {},
    },
    customColors: {
      type: {
        primary: { type: String, default: '' },
        accent: { type: String, default: '' },
        background: { type: String, default: '' },
      },
      default: {},
    },
    customFont: {
      type: String,
      default: '',
    },
    testimonials: {
      type: [
        {
          fromUserId: { type: Schema.Types.ObjectId, ref: 'User' },
          fromUsername: { type: String, required: true },
          fromProfilePicture: { type: String, default: '' },
          content: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          approved: { type: Boolean, default: false },
          _id: { type: Schema.Types.ObjectId, auto: true }
        }
      ],
      default: [],
    },
  },
  { collection: 'User' },
);

export default userSchema;
