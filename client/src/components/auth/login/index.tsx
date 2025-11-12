import './index.css';
import useAuth from '../../../hooks/useAuth';
import { useAuth0 } from '@auth0/auth0-react';
/**
 * Renders a login form with username and password inputs, password visibility toggle,
 * error handling, and a link to the signup page.
 */
const Login = () => {
  const { isLoading, isAuthenticated } = useAuth0();
  const {handleLogin} = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Don't render login button if already authenticated
  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className='container'>
      <h2>Welcome to FakeStackOverflow!</h2>
      <h3>Please login to continue.</h3>
      <button 
        onClick={handleLogin}
        disabled={isLoading}
        className="auth-button"
      >
        Log In with Auth0
      </button>
    </div>
  );
};

export default Login;
