import { DatabaseUser } from './types';
import { ObjectId } from 'mongodb';

/**
 * Recruiter-specific fields
 * - company: The company the recruiter represents
 */
export interface Recruiter extends DatabaseUser {
  company: string;
  jobPostings?: ObjectId[];
}

/**
 * Database version of recruiter document
 */
export interface DatabaseRecruiter extends Recruiter {
  _id: ObjectId;
}
