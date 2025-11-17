import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import {
  UserRequest,
  User,
  UserCredentials,
  UserByUsernameRequest,
  FakeSOSocket,
  UpdateBiographyRequest,
  Testimonial,
} from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  updateUser,
} from '../services/user.service';

const userController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();
  const upload = multer({ storage: multer.memoryStorage() });

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    const requestUser = req.body;

    const user: User = {
      ...requestUser,
      dateJoined: new Date(),
      biography: requestUser.biography ?? '',
    };

    try {
      const result = await saveUser(user);

      if ('error' in result) {
        throw new Error(result.error);
      }

      socket.emit('userUpdate', {
        user: result,
        type: 'created',
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving user: ${error}`);
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      const loginCredentials: UserCredentials = {
        username: req.body.username,
        password: req.body.password,
      };

      const user = await loginUser(loginCredentials);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send('Login failed');
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(`Error when getting user by username: ${error}`);
    }
  };

  /**
   * Retrieves all users from the database.
   * @param res The response, either returning the users or an error.
   * @returns A promise resolving to void.
   */
  const getUsers = async (_: Request, res: Response): Promise<void> => {
    try {
      const users = await getUsersList();

      if ('error' in users) {
        throw Error(users.error);
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const deletedUser = await deleteUserByUsername(username);

      if ('error' in deletedUser) {
        throw Error(deletedUser.error);
      }

      socket.emit('userUpdate', {
        user: deletedUser,
        type: 'deleted',
      });
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(500).send(`Error when deleting user by username: ${error}`);
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      const updatedUser = await updateUser(req.body.username, { password: req.body.password });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user password: ${error}`);
    }
  };

  /**
   * Updates a user's biography.
   * @param req The request containing the username and biography in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateBiography = async (req: UpdateBiographyRequest, res: Response): Promise<void> => {
    try {
      // Validate that request has username and biography
      const { username, biography } = req.body;

      // Call the same updateUser(...) service used by resetPassword
      const updatedUser = await updateUser(username, { biography });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user biography: ${error}`);
    }
  };

  /**
   * Updates a user's list of skills.
   * @param req The request containing the username and skills array in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateSkills = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, skills } = req.body;

      const updatedUser = await updateUser(username, { skills });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating skills: ${error}`);
    }
  };

  /**
   * Updates a user's external links.
   * @param req The request containing the username and externalLinks object in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateExternalLinks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, externalLinks } = req.body;

      const updatedUser = await updateUser(username, { externalLinks });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating external links: ${error}`);
    }
  };

  /**
   * Updates a user's custom theme colors.
   * @param req The request containing the username and customColors object in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateCustomColors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, customColors } = req.body;

      const updatedUser = await updateUser(username, { customColors });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating custom colors: ${error}`);
    }
  };

  /**
   * Updates a user's custom font.
   * @param req The request containing the username and customFont in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateCustomFont = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, customFont } = req.body;

      const updatedUser = await updateUser(username, { customFont });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating custom font: ${error}`);
    }
  };

  /**
   * Updates a user's portfolio media arrays (for deletion).
   * @param req The request containing username, portfolioModels, and portfolioThumbnails arrays.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updatePortfolioMedia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, portfolioModels, portfolioThumbnails } = req.body;

      const updatedUser = await updateUser(username, {
        portfolioModels,
        portfolioThumbnails,
      });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating portfolio media: ${error}`);
    }
  };

  /**
   * Deletes portfolio items by indices.
   */
  const deletePortfolioItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, indices } = req.body;

      const user = await getUserByUsername(username);
      if ('error' in user) {
        throw new Error('User not found');
      }

      // Filter out items at specified indices
      const updatedModels = user.portfolioModels?.filter((_, i) => !indices.includes(i)) || [];
      const updatedThumbnails =
        user.portfolioThumbnails?.filter((_, i) => !indices.includes(i)) || [];

      const updatedUser = await updateUser(username, {
        portfolioModels: updatedModels,
        portfolioThumbnails: updatedThumbnails,
      });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error deleting portfolio items: ${error}`);
    }
  };

  /**
   * Uploads a profile picture for a user.
   */
  const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      const { username } = req.body;

      if (!file) {
        res.status(400).json({ error: 'File missing' });
        return;
      }
      if (!username) {
        res.status(400).json({ error: 'Username missing' });
        return;
      }

      // Convert buffer to base64 string for storage
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const updatedUser = await updateUser(username, { profilePicture: base64Image });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error uploading profile picture: ${error}`);
    }
  };

  /**
   * Uploads a banner image for a user.
   */
  const uploadBannerImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      const { username } = req.body;

      if (!file) {
        res.status(400).json({ error: 'File missing' });
        return;
      }
      if (!username) {
        res.status(400).json({ error: 'Username missing' });
        return;
      }

      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const updatedUser = await updateUser(username, { bannerImage: base64Image });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error uploading banner image: ${error}`);
    }
  };

  /**
   * Uploads a resume file for a user.
   */
  const uploadResume = async (req: Request, res: Response): Promise<void> => {
    try {
      const file = req.file;
      const { username } = req.body;

      if (!file) {
        res.status(400).json({ error: 'File missing' });
        return;
      }
      if (!username) {
        res.status(400).json({ error: 'Username missing' });
        return;
      }

      // For PDFs, store as base64
      const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const updatedUser = await updateUser(username, { resumeFile: base64File });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error uploading resume: ${error}`);
    }
  };

  /**
   * Uploads a portfolio model AND thumbnail for a user.
   */
  /**
   * Uploads a portfolio model/media AND thumbnail for a user.
   * Supports both file uploads and URL embeds.
   */
  const UploadPortfolioModel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, thumbnail, mediaUrl } = req.body;
      const file = req.file;

      if (!file && !mediaUrl) {
        res.status(400).json({ error: 'Either a file or media URL is required' });
        return;
      }
      if (!username) {
        res.status(400).json({ error: 'Username missing' });
        return;
      }

      let mediaToStore: string;

      // If URL is provided, use it directly
      if (mediaUrl) {
        mediaToStore = mediaUrl;
      } else if (file) {
        // Convert file to base64
        const isGlbFile = file.originalname.toLowerCase().endsWith('.glb');
        if (isGlbFile && !thumbnail) {
          res.status(400).json({ error: 'Thumbnail required for 3D models' });
          return;
        }
        mediaToStore = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      } else {
        res.status(400).json({ error: 'No media provided' });
        return;
      }

      const user = await getUserByUsername(username);
      if ('error' in user) {
        throw new Error('User not found');
      }

      const currentModels = user.portfolioModels || [];
      const currentThumbnails = user.portfolioThumbnails || [];

      // Fill missing thumbnails with empty strings
      while (currentThumbnails.length < currentModels.length) {
        currentThumbnails.push('');
      }

      const updatedModels = [...currentModels, mediaToStore];
      const updatedThumbnails = [...currentThumbnails, thumbnail || ''];

      const updatedUser = await updateUser(username, {
        portfolioModels: updatedModels,
        portfolioThumbnails: updatedThumbnails,
      });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error uploading portfolio model: ${error}`);
    }
  };

  /**
   * Creates or updates a testimonial from one user to another.
   */
  const createOrUpdateTestimonial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { profileUsername, fromUsername, content } = req.body;

      if (!profileUsername || !fromUsername || !content) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get the user who is receiving the testimonial
      const profileUser = await getUserByUsername(profileUsername);
      if ('error' in profileUser) {
        res.status(404).json({ error: 'Profile user not found' });
        return;
      }

      // Get the user who is writing the testimonial (for profile picture)
      const fromUser = await getUserByUsername(fromUsername);
      if ('error' in fromUser) {
        res.status(404).json({ error: 'Author user not found' });
        return;
      }

      // Can't write testimonial for yourself
      if (profileUsername === fromUsername) {
        res.status(400).json({ error: 'Cannot write testimonial for yourself' });
        return;
      }

      const testimonials = profileUser.testimonials || [];

      // Check if testimonial already exists from this user
      const existingIndex = testimonials.findIndex(
        (t: Testimonial) => t.fromUsername === fromUsername,
      );
      const newTestimonial = {
        fromUsername,
        fromProfilePicture: fromUser.profilePicture || '',
        content: content.trim(),
        createdAt: new Date(),
        approved: false,
      };

      if (existingIndex >= 0) {
        // Update existing testimonial
        testimonials[existingIndex] = {
          ...testimonials[existingIndex],
          ...newTestimonial,
        };
      } else {
        // Add new testimonial
        testimonials.push(newTestimonial);
      }

      const updatedUser = await updateUser(profileUsername, { testimonials });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error creating/updating testimonial: ${error}`);
    }
  };

  /**
   * Deletes a user's testimonial from another user's profile.
   */
  const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
    try {
      const { profileUsername } = req.params;
      const { fromUsername } = req.body;

      if (!fromUsername) {
        res.status(400).json({ error: 'fromUsername required' });
        return;
      }

      const profileUser = await getUserByUsername(profileUsername);
      if ('error' in profileUser) {
        res.status(404).json({ error: 'Profile user not found' });
        return;
      }

      const testimonials = profileUser.testimonials || [];
      const filteredTestimonials = testimonials.filter(
        (t: Testimonial) => t.fromUsername !== fromUsername,
      );

      const updatedUser = await updateUser(profileUsername, {
        testimonials: filteredTestimonials,
      });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error deleting testimonial: ${error}`);
    }
  };

  /**
   * Approves or rejects a testimonial.
   */
  const updateTestimonialApproval = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, testimonialId, approved } = req.body;

      if (!username || !testimonialId || typeof approved !== 'boolean') {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await getUserByUsername(username);
      if ('error' in user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const testimonials = user.testimonials || [];
      const testimonialIndex = testimonials.findIndex(
        (t: Testimonial) => t._id?.toString() === testimonialId,
      );

      if (testimonialIndex === -1) {
        res.status(404).json({ error: 'Testimonial not found' });
        return;
      }

      if (approved) {
        // Approve testimonial
        testimonials[testimonialIndex].approved = true;
      } else {
        // Reject = delete testimonial
        testimonials.splice(testimonialIndex, 1);
      }

      const updatedUser = await updateUser(username, { testimonials });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error updating testimonial approval: ${error}`);
    }
  };

  // Define routes for the user-related operations.
  router.post('/signup', createUser);
  router.post('/login', userLogin);
  router.patch('/resetPassword', resetPassword);
  router.get('/getUser/:username', getUser);
  router.get('/getUsers', getUsers);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/updateBiography', updateBiography);
  router.patch('/updateSkills', updateSkills);
  router.patch('/updateExternalLinks', updateExternalLinks);
  router.patch('/updateCustomColors', updateCustomColors);
  router.patch('/updateCustomFont', updateCustomFont);
  router.patch('/updatePortfolioMedia', updatePortfolioMedia);
  router.delete('/deletePortfolioItems', deletePortfolioItems);
  router.post('/uploadProfilePicture', upload.single('file'), uploadProfilePicture);
  router.post('/uploadBannerImage', upload.single('file'), uploadBannerImage);
  router.post('/uploadResume', upload.single('file'), uploadResume);
  router.post('/uploadPortfolioModel', upload.single('file'), UploadPortfolioModel);
  router.post('/testimonial', createOrUpdateTestimonial);
  router.delete('/testimonial/:profileUsername', deleteTestimonial);
  router.patch('/testimonial/approve', updateTestimonialApproval);
  return router;
};

export default userController;
