import { Schema, model } from 'mongoose';
import userSchema from './user.schema';

// Base User model
const User = model('User', userSchema);

// Create a Recruiter schema that extends User
const recruiterSchema = new Schema(
  {
    company: {
      type: String,
      required: true,
    },
  },
  { discriminatorKey: 'role', collection: 'User' }
);

const Recruiter = User.discriminator('Recruiter', recruiterSchema);

export default Recruiter;
