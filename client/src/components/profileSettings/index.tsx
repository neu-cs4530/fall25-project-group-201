import * as React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';
import useProfileSettings from '../../hooks/useProfileSettings';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    setEditBioMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleViewCollectionsPage,
  } = useProfileSettings();

  if (loading) {
    return (
      <div className='profile-settings'>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='profile-settings'>
      <div className='profile-card'>
        <h2>Profile</h2>

        {/* ---- NEW SECTIONS START HERE ---- */}

        {/* Banner & Profile Picture Section */}
        <div className='profile-header-section'>
          <div className='profile-banner-placeholder'>
            <span>Banner Image (Coming Soon)</span>
          </div>
          <div className='profile-picture-placeholder'>
            <span>Profile Picture</span>
          </div>
        </div>

        {/* ---- NEW SECTIONS END HERE ---- */}

        {successMessage && <p className='success-message'>{successMessage}</p>}
        {errorMessage && <p className='error-message'>{errorMessage}</p>}

        {userData ? (
          <>
            <h4>General Information</h4>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>

            {/* ---- Biography Section ---- */}
            <p>
              <strong>Biography:</strong>
            </p>
            <div className='bio-section'>
              {!editBioMode && (
                <>
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {userData.biography || 'No biography yet.'}
                  </Markdown>
                  {canEditProfile && (
                    <button
                      className='button button-primary'
                      onClick={() => {
                        setEditBioMode(true);
                        setNewBio(userData.biography || '');
                      }}>
                      Edit
                    </button>
                  )}
                </>
              )}

              {editBioMode && canEditProfile && (
                <div className='bio-edit'>
                  <input
                    className='input-text'
                    type='text'
                    value={newBio}
                    onChange={e => setNewBio(e.target.value)}
                  />
                  <button className='button button-primary' onClick={handleUpdateBiography}>
                    Save
                  </button>
                  <button className='button button-danger' onClick={() => setEditBioMode(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <p>
              <strong>Date Joined:</strong>{' '}
              {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
            </p>

            {/* ---- NEW SECTIONS START HERE ---- */}

            {/* External Links Section */}
            <h4>External Links</h4>
            <div className='external-links-section'>
              <div className='link-placeholder'>🔗 GitHub (Add link in Sprint 2)</div>
              <div className='link-placeholder'>🎨 ArtStation (Add link in Sprint 2)</div>
              <div className='link-placeholder'>💼 LinkedIn (Add link in Sprint 2)</div>
              <div className='link-placeholder'>🌐 Personal Website (Add link in Sprint 2)</div>
            </div>

            {/* Skills Section */}
            <h4>Software Expertise</h4>
            <div className='skills-section'>
              <div className='skill-placeholder'>Maya</div>
              <div className='skill-placeholder'>Blender</div>
              <div className='skill-placeholder'>ZBrush</div>
              <div className='skill-placeholder'>Substance Painter</div>
              <div className='skill-placeholder'>Unreal Engine</div>
              <div className='skill-placeholder'>Unity</div>
              <span className='placeholder-note'>(Editable in Sprint 2)</span>
            </div>

            {/* Portfolio Grid Section */}
            <h4>Portfolio</h4>
            <div className='portfolio-grid-section'>
              <div className='portfolio-placeholder'>
                <div className='placeholder-text'>📦 3D Model Viewer</div>
                <span>Upload models in Sprint 2</span>
              </div>
              <div className='portfolio-placeholder'>
                <div className='placeholder-text'>📦 3D Model Viewer</div>
                <span>Upload models in Sprint 2</span>
              </div>
              <div className='portfolio-placeholder'>
                <div className='placeholder-text'>📦 3D Model Viewer</div>
                <span>Upload models in Sprint 2</span>
              </div>
            </div>

            {/* Resume Section */}
            <h4>Resume / CV</h4>
            <div className='resume-section'>
              <button className='button button-secondary' disabled>
                📄 Download Resume (Upload in Sprint 2)
              </button>
              <span className='placeholder-note'>Upload your CV to enable downloads</span>
            </div>

            {/* Theme Customization Preview */}
            <h4>Theme Preview</h4>
            <div className='theme-preview-section'>
              <div className='theme-color-box' style={{ backgroundColor: '#2563eb' }}>
                Primary Color
              </div>
              <div className='theme-color-box' style={{ backgroundColor: '#16a34a' }}>
                Accent Color
              </div>
              <div className='theme-color-box' style={{ backgroundColor: '#f2f4f7' }}>
                Background Color
              </div>
              <span className='placeholder-note'>(Customizable in Sprint 2)</span>
            </div>

            {/* ---- NEW SECTIONS END HERE ---- */}

            <button className='button button-primary' onClick={handleViewCollectionsPage}>
              View Collections
            </button>

            {/* ---- Reset Password Section ---- */}
            {canEditProfile && (
              <>
                <h4>Reset Password</h4>
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='New Password'
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <input
                  className='input-text'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Confirm New Password'
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
                <div className='password-actions'>
                  <button className='button button-secondary' onClick={togglePasswordVisibility}>
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>
                  <button className='button button-primary' onClick={handleResetPassword}>
                    Reset
                  </button>
                </div>
              </>
            )}

            {/* ---- Danger Zone (Delete User) ---- */}
            {canEditProfile && (
              <>
                <h4>Danger Zone</h4>
                <button className='button button-danger' onClick={handleDeleteUser}>
                  Delete This User
                </button>
              </>
            )}
          </>
        ) : (
          <p>No user data found. Make sure the username parameter is correct.</p>
        )}

        {/* ---- Confirmation Modal for Delete ---- */}
        {showConfirmation && (
          <div className='modal'>
            <div className='modal-content'>
              <p>
                Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                action cannot be undone.
              </p>
              <div className='modal-actions'>
                <button className='button button-danger' onClick={() => pendingAction?.()}>
                  Confirm
                </button>
                <button
                  className='button button-secondary'
                  onClick={() => setShowConfirmation(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
