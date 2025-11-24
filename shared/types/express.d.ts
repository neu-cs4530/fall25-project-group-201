import 'express';
import { VerifyJwtResult } from 'express-oauth2-jwt-bearer';

declare global {
  namespace Express {
    interface Request {
      auth?: VerifyJwtResult;
    }
  }
}

export {};
