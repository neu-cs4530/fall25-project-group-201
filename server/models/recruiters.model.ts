import { Schema, Model } from 'mongoose';
import UserModel from './users.model';
import { DatabaseRecruiter } from '../types/types';

const recruiterSchema = new Schema({
  company: {
    type: String,
    required: true,
  },
  jobPostings: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
  ],
});

// Create the recruiter model using the discriminator
const RecruiterModel: Model<DatabaseRecruiter> = UserModel.discriminator<DatabaseRecruiter>(
  'Recruiter',      
  recruiterSchema   
);

export default RecruiterModel;
