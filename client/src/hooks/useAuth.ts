import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useState, useEffect } from 'react';
import useLoginContext from './useLoginContext';
import { createUser, loginUser } from '../services/userService';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserByUsername } from '../services/userService';

/**
 * Custom hook to manage authentication logic, including handling input changes,
 * form submission, password visibility toggling, and error validation for both
 * login and signup processes.
 *
 * @param authType - Specifies the authentication type ('login' or 'signup').
 * @returns {Object} An object containing:
 *   - username: The current value of the username input.
 *   - password: The current value of the password input.
 *   - passwordConfirmation: The current value of the password confirmation input (for signup).
 *   - showPassword: Boolean indicating whether the password is visible.
 *   - err: The current error message, if any.
 *   - handleInputChange: Function to handle changes in input fields.
 *   - handleSubmit: Function to handle form submission.
 *   - togglePasswordVisibility: Function to toggle password visibility.
 */
const useAuth = () => {
  // const [username, setUsername] = useState<string>('');
  // const [password, setPassword] = useState<string>('');
  // const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  // const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string>('');
  const { setUser } = useLoginContext();
  const navigate = useNavigate();

  const { 
    isAuthenticated,
    isLoading,
    user: auth0User,
    loginWithRedirect,
    // getAccessTokenSilently
   } = useAuth0();

  // /**
  //  * Toggles the visibility of the password input field.
  //  */
  // const togglePasswordVisibility = () => {
  //   setShowPassword(prevState => !prevState);
  // };

  // /**
  //  * Handles changes in input fields and updates the corresponding state.
  //  *
  //  * @param e - The input change event.
  //  * @param field - The field being updated ('username', 'password', or 'confirmPassword').
  //  */
  // const handleInputChange = (
  //   e: ChangeEvent<HTMLInputElement>,
  //   field: 'username' | 'password' | 'confirmPassword',
  // ) => {
  //   const fieldText = e.target.value.trim();

  //   if (field === 'username') {
  //     setUsername(fieldText);
  //   } else if (field === 'password') {
  //     setPassword(fieldText);
  //   } else if (field === 'confirmPassword') {
  //     setPasswordConfirmation(fieldText);
  //   }
  // };

  // /**
  //  * Validates the input fields for the form.
  //  * Ensures required fields are filled and passwords match (for signup).
  //  *
  //  * @returns {boolean} True if inputs are valid, false otherwise.
  //  */
  // const validateInputs = (): boolean => {
  //   if (username === '' || password === '') {
  //     setErr('Please enter a username and password');
  //     return false;
  //   }

  //   if (authType === 'signup' && password !== passwordConfirmation) {
  //     setErr('Passwords do not match');
  //     return false;
  //   }

  //   return true;
  // };

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      (async () => {
        try {
          // const token = await getAccessTokenSilently();
          console.log(auth0User)

          const username = auth0User.name || "";

          const user = await getUserByUsername(username);
          console.log(`user got: ${user}`)

          setUser(user)
          navigate('/home');
        } catch (error) {
        console.error('Error fetching user data:', error);
        setErr('Failed to load user data');
      }
      })();
    }
  }, [isAuthenticated, auth0User]);

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        appState: {
          returnTo: '/home', // Where to redirect after login
        },
        authorizationParams: {
          prompt: 'login', // Force login screen
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      setErr('Failed to initiate login');
    }
  };

 const handleSignup = async () => {
    try {
      await loginWithRedirect({
        appState: {
          returnTo: '/home',
        },
        authorizationParams: {
          screen_hint: 'signup', // Show signup screen instead of login
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      setErr('Failed to initiate signup');
    }
  };

  return {
    isAuthenticated,
    user: auth0User,
    handleLogin,
    handleSignup
  };
};

export default useAuth;
