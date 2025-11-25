import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getUserByUsername,
  deleteUser,
  resetPassword,
  updateBiography,
  updateSkills,
  updateExternalLinks,
  updateCustomColors,
  updateCustomFont,
  uploadProfilePicture,
  uploadBannerImage,
  uploadResume,
  uploadPortfolioModel,
  createOrUpdateTestimonial,
  deleteTestimonial,
  updateTestimonialApproval,
} from '../services/userService';
import { SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';
import toast from 'react-hot-toast';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useProfileSettings = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();
  const { getAccessTokenSilently } = useAuth0();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [editSkillsMode, setEditSkillsMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [editLinksMode, setEditLinksMode] = useState(false);
  const [githubLink, setGithubLink] = useState('');
  const [artstationLink, setArtstationLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [editColorsMode, setEditColorsMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [accentColor, setAccentColor] = useState('#16a34a');
  const [backgroundColor, setBackgroundColor] = useState('#f2f4f7');
  const [customFont, setCustomFont] = useState('Inter');
  const [portfolioModelFile, setPortfolioModelFile] = useState<File | null>(null);
  const [portfolioThumbnailFile, setPortfolioThumbnailFile] = useState<File | null>(null);
  const [showThumbnailUpload, setShowThumbnailUpload] = useState(false);

  // For delete-user confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const canEditProfile =
    currentUser.username && userData?.username ? currentUser.username === userData.username : false;

  useEffect(() => {
    if (!username) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUserByUsername(username);
        setUserData(data);
        setSelectedSkills(data.skills || []);
        setCustomFont(data.customFont || 'Inter');
        setGithubLink(data.externalLinks?.github || '');
        setArtstationLink(data.externalLinks?.artstation || '');
        setLinkedinLink(data.externalLinks?.linkedin || '');
        setWebsiteLink(data.externalLinks?.website || '');
        setPrimaryColor(data.customColors?.primary || '#2563eb');
        setAccentColor(data.customColors?.accent || '#16a34a');
        setBackgroundColor(data.customColors?.background || '#f2f4f7');
      } catch (error) {
        toast.error('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  const validatePasswords = () => {
    if (newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      toast.error('Please enter and confirm your new password.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    if (!validatePasswords()) {
      return;
    }
    try {
      await resetPassword(username, newPassword, token);
      toast.success('Password reset successful!');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error('Failed to reset password.');
    }
  };

  const handleUpdateBiography = async () => {
    if (!username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    try {
      const updatedUser = await updateBiography(username, newBio, token);

      await new Promise(resolve => {
        setUserData(updatedUser);
        setEditBioMode(false);
        resolve(null);
      });

      toast.success('Biography updated!');
    } catch (error) {
      toast.error('Failed to update biography.');
    }
  };

  const handleUpdateExternalLinks = async () => {
    if (!username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });
    try {
      // Helper function to ensure https://
      const ensureHttps = (url: string): string => {
        if (!url) return '';
        const trimmed = url.trim();
        if (!trimmed) return '';

        // Check if it already has a protocol
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }

        // Add https:// if missing
        return `https://${trimmed}`;
      };

      const externalLinks = {
        github: ensureHttps(githubLink),
        artstation: ensureHttps(artstationLink),
        linkedin: ensureHttps(linkedinLink),
        website: ensureHttps(websiteLink),
      };

      const updatedUser = await updateExternalLinks(username, externalLinks, token);

      await new Promise(resolve => {
        setUserData(updatedUser);
        setEditLinksMode(false);
        resolve(null);
      });

      toast.success('External links updated!');
    } catch (error) {
      toast.error('Failed to update external links.');
    }
  };

  const handleUpdateCustomColors = async () => {
    if (!username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    try {
      const customColors = {
        primary: primaryColor,
        accent: accentColor,
        background: backgroundColor,
      };

      const updatedUser = await updateCustomColors(username, customColors, token);

      await new Promise(resolve => {
        setUserData({ ...updatedUser });
        setEditColorsMode(false);
        resolve(null);
      });

      toast.success('Theme colors updated!');
    } catch (error) {
      toast.error('Failed to update colors.');
    }
  };

  const handleUpdateCustomFont = async (newFont: string) => {
    if (!username) return;
    try {
      const updatedUser = await updateCustomFont(username, newFont);

      await new Promise(resolve => {
        setUserData(updatedUser);
        setCustomFont(newFont);
        resolve(null);
      });

      toast.success('Font updated!');
    } catch (error) {
      toast.error('Failed to update font.');
    }
  };


  const handleUploadProfilePicture = async (file: File) => {
    if (!username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });


    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Profile picture must be JPG or PNG format.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile picture must be under 5MB.');
      return;
    }

    try {
      const updatedUser = await uploadProfilePicture(username, file, token);
      setUserData(updatedUser);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture.');
    }
  };

  const handleUploadBannerImage = async (file: File) => {
    if (!username) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Banner image must be JPG or PNG format.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Banner image must be under 5MB.');
      return;
    }

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    try {
      const updatedUser = await uploadBannerImage(username, file, token);
      setUserData(updatedUser);
      toast.success('Banner image updated!');
    } catch (error) {
      toast.error('Failed to upload banner image.');
    }
  };

  const handleUploadResume = async (file: File) => {
    if (!username) return;

    if (file.type !== 'application/pdf') {
      toast.error('Resume must be PDF format.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resume must be under 10MB.');
      return;
    }

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    try {
      const updatedUser = await uploadResume(username, file, token);
      setUserData(updatedUser);
      toast.success('Resume uploaded!');
    } catch (error) {
      toast.error('Failed to upload resume.');
    }
  };

  const handleUploadPortfolioModel = async (file: File) => {
    if (!username) return;

    const validTypes = ['model/gltf-binary', 'application/octet-stream'];
    const validExtensions = ['.glb'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast.error('Portfolio model must be .glb format.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Model must be under 50MB.');
      return;
    }

    // Store the file and show thumbnail upload UI
    setPortfolioModelFile(file);
    setShowThumbnailUpload(true);
    toast('Now upload a thumbnail for your 3D model');
  };

  // Add new handler for thumbnail
  const handleUploadPortfolioThumbnail = async (file: File) => {
    if (!username) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Thumbnail must be JPG or PNG format.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Thumbnail must be under 5MB.');
      return;
    }

    setPortfolioThumbnailFile(file);
  };

  // Add new handler to complete the upload
  const handleCompletePortfolioUpload = async () => {
    if (!portfolioModelFile || !portfolioThumbnailFile || !username) {
      toast.error('Both model and thumbnail are required');
      return;
    }

    try {
      // First upload thumbnail to get base64
      const thumbnailBase64 = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(portfolioThumbnailFile);
      });

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

      // Then upload model with thumbnail reference
      const updatedUser = await uploadPortfolioModel(username, portfolioModelFile, thumbnailBase64, token);
      setUserData(updatedUser);

      // Reset state
      setPortfolioModelFile(null);
      setPortfolioThumbnailFile(null);
      setShowThumbnailUpload(false);

      toast.success('Portfolio model uploaded!');
    } catch (error) {
      toast.error('Failed to upload portfolio model.');
    }
  };

  const handleDeleteUser = () => {
    if (!username) return;
    setShowConfirmation(true);
    setPendingAction(() => async () => {
      try {
        await deleteUser(username);
        toast.success(`User "${username}" deleted successfully.`);
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete user.');
      } finally {
        setShowConfirmation(false);
      }
    });
  };

  const handleViewCollectionsPage = () => {
    navigate(`/collections/${username}`);
    return;
  };

  const handleUpdateSkills = async () => {
    if (!username) return;

      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });

    try {
      const updatedUser = await updateSkills(username, selectedSkills, token);

      await new Promise(resolve => {
        setUserData(updatedUser);
        setEditSkillsMode(false);
        resolve(null);
      });

      toast.success('Skills updated!');
    } catch (error) {
      toast.error('Failed to update skills.');
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
    );
  };

  const handleSubmitTestimonial = async (content: string) => {
    if (!username || !currentUser.username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    try {
      const updatedUser = await createOrUpdateTestimonial(username, currentUser.username, content, token);
      setUserData(updatedUser);
      toast.success('Testimonial submitted for review!');
    } catch (error) {
      toast.error('Failed to submit testimonial.');
    }
  };

  const handleDeleteTestimonial = async () => {
    if (!username || !currentUser.username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    try {
      const updatedUser = await deleteTestimonial(username, currentUser.username, token);
      setUserData(updatedUser);
      toast.success('Testimonial deleted.');
    } catch (error) {
      toast.error('Failed to delete testimonial.');
    }
  };

  const handleApproveTestimonial = async (testimonialId: string, approved: boolean) => {
    if (!username) return;

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
    });

    try {
      const updatedUser = await updateTestimonialApproval(username, testimonialId, approved, token);
      setUserData(updatedUser);
      toast.success(approved ? 'Testimonial approved!' : 'Testimonial rejected.');
    } catch (error) {
      toast.error('Failed to update testimonial.');
    }
  };

  return {
    userData,
    setUserData,
    newPassword,
    confirmNewPassword,
    setNewPassword,
    setConfirmNewPassword,
    loading,
    editBioMode,
    setEditBioMode,
    newBio,
    setNewBio,
    // edit skills
    editSkillsMode,
    setEditSkillsMode,
    selectedSkills,
    toggleSkill,
    handleUpdateSkills,
    editLinksMode,
    // edit links
    setEditLinksMode,
    githubLink,
    setGithubLink,
    artstationLink,
    setArtstationLink,
    linkedinLink,
    setLinkedinLink,
    websiteLink,
    setWebsiteLink,
    // custom fonts
    customFont,
    setCustomFont,
    handleUpdateCustomFont,
    handleUpdateExternalLinks,
    // color customization
    editColorsMode,
    setEditColorsMode,
    primaryColor,
    setPrimaryColor,
    accentColor,
    setAccentColor,
    backgroundColor,
    setBackgroundColor,
    handleUpdateCustomColors,
    // uploads
    handleUploadProfilePicture,
    handleUploadBannerImage,
    handleUploadResume,
    portfolioModelFile,
    portfolioThumbnailFile,
    showThumbnailUpload,
    handleUploadPortfolioModel,
    handleUploadPortfolioThumbnail,
    handleCompletePortfolioUpload,
    // testimonials
    handleSubmitTestimonial,
    handleDeleteTestimonial,
    handleApproveTestimonial,
    showConfirmation,
    setShowConfirmation,
    pendingAction,
    setPendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleViewCollectionsPage,
  };
};

export default useProfileSettings;
