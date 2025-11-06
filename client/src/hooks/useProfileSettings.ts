import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getUserByUsername,
  deleteUser,
  resetPassword,
  updateBiography,
  updateSkills,
  updateExternalLinks,
} from '../services/userService';
import { SafeDatabaseUser } from '../types/types';
import useUserContext from './useUserContext';

/**
 * A custom hook to encapsulate all logic/state for the ProfileSettings component.
 */
const useProfileSettings = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUserContext();

  // Local state
  const [userData, setUserData] = useState<SafeDatabaseUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [editBioMode, setEditBioMode] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editSkillsMode, setEditSkillsMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [editLinksMode, setEditLinksMode] = useState(false);
  const [githubLink, setGithubLink] = useState('');
  const [artstationLink, setArtstationLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');

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
        setSelectedSkills(data.skills || []); // intialize skills
        setGithubLink(data.externalLinks?.github || '');
        setArtstationLink(data.externalLinks?.artstation || '');
        setLinkedinLink(data.externalLinks?.linkedin || '');
        setWebsiteLink(data.externalLinks?.website || '');
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  /**
   * Toggles the visibility of the password fields.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prevState => !prevState);
  };

  /**
   * Validate the password fields before attempting to reset.
   */
  const validatePasswords = () => {
    if (newPassword.trim() === '' || confirmNewPassword.trim() === '') {
      setErrorMessage('Please enter and confirm your new password.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  /**
   * Handler for resetting the password
   */
  const handleResetPassword = async () => {
    if (!username) return;
    if (!validatePasswords()) {
      return;
    }
    try {
      await resetPassword(username, newPassword);
      setSuccessMessage('Password reset successful!');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setErrorMessage('Failed to reset password.');
      setSuccessMessage(null);
    }
  };

  const handleUpdateBiography = async () => {
    if (!username) return;
    try {
      // Await the async call to update the biography
      const updatedUser = await updateBiography(username, newBio);

      // Ensure state updates occur sequentially after the API call completes
      await new Promise(resolve => {
        setUserData(updatedUser); // Update the user data
        setEditBioMode(false); // Exit edit mode
        resolve(null); // Resolve the promise
      });

      setSuccessMessage('Biography updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update biography.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for updating external links
   */
  const handleUpdateExternalLinks = async () => {
    if (!username) return;
    try {
      const externalLinks = {
        github: githubLink,
        artstation: artstationLink,
        linkedin: linkedinLink,
        website: websiteLink,
      };

      const updatedUser = await updateExternalLinks(username, externalLinks);

      await new Promise(resolve => {
        setUserData(updatedUser);
        setEditLinksMode(false);
        resolve(null);
      });

      setSuccessMessage('External links updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update external links.');
      setSuccessMessage(null);
    }
  };

  /**
   * Handler for deleting the user (triggers confirmation modal)
   */
  const handleDeleteUser = () => {
    if (!username) return;
    setShowConfirmation(true);
    setPendingAction(() => async () => {
      try {
        await deleteUser(username);
        setSuccessMessage(`User "${username}" deleted successfully.`);
        setErrorMessage(null);
        navigate('/');
      } catch (error) {
        setErrorMessage('Failed to delete user.');
        setSuccessMessage(null);
      } finally {
        setShowConfirmation(false);
      }
    });
  };

  const handleViewCollectionsPage = () => {
    navigate(`/collections/${username}`);
    return;
  };

  /**
   * Handler for updating user skills
   */
  const handleUpdateSkills = async () => {
    if (!username) return;
    try {
      const updatedUser = await updateSkills(username, selectedSkills);

      await new Promise(resolve => {
        setUserData(updatedUser);
        setEditSkillsMode(false);
        resolve(null);
      });

      setSuccessMessage('Skills updated!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Failed to update skills.');
      setSuccessMessage(null);
    }
  };

  /**
   * Toggles a skill in the selected skills array
   */
  const toggleSkill = (skill: string) => {
    setSelectedSkills(
      prev =>
        prev.includes(skill)
          ? prev.filter(s => s !== skill) // Remove if already selected
          : [...prev, skill], // Add if not selected
    );
  };

  return {
    userData,
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
    handleUpdateExternalLinks,
    successMessage,
    errorMessage,
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
