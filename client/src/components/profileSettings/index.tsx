import * as React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';
import useProfileSettings from '../../hooks/useProfileSettings';
import PortfolioModelViewer from '../main/threeViewport/PortfolioModelViewer';
import toast, { Toaster } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    editSkillsMode,
    selectedSkills,
    toggleSkill,
    setEditSkillsMode,
    handleUpdateSkills,
    editLinksMode,
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
    editColorsMode,
    setEditColorsMode,
    primaryColor,
    setPrimaryColor,
    accentColor,
    setAccentColor,
    backgroundColor,
    setBackgroundColor,
    handleUpdateCustomColors,
    handleUploadProfilePicture,
    handleUploadBannerImage,
    handleUploadResume,
    handleUploadPortfolioModel,
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

  const handleUploadPortfolio = () => {
    navigate(`/user/${userData?.username}/upload-portfolio`);
  };

  if (loading) {
    return (
      <div
        className='profile-settings'
        style={
          {
            '--color-primary': userData?.customColors?.primary || '#2563eb',
            '--color-accent': userData?.customColors?.accent || '#16a34a',
            '--color-bg': userData?.customColors?.background || '#f2f4f7',
          } as React.CSSProperties
        }>
        <div className='profile-card'>
          <h2>Loading user data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className='profile-settings'
      style={
        {
          '--color-primary': userData?.customColors?.primary || '#2563eb',
          '--color-accent': userData?.customColors?.accent || '#16a34a',
          '--color-bg': userData?.customColors?.background || '#f2f4f7',
        } as React.CSSProperties
      }>
      <div className='profile-card'>
        <h2>Profile</h2>
        <Toaster position="top-center" />

        {/* Banner & Profile Picture Section - INTERACTIVE */}
        <div className='profile-header-section'>
          <div
            className='profile-banner-placeholder'
            style={
              userData?.bannerImage
                ? {
                  backgroundImage: `url(${userData.bannerImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
                : {}
            }>
            {!userData?.bannerImage && <span>Banner Image</span>}
            {canEditProfile && (
              <label className='upload-overlay-label'>
                <input
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadBannerImage(file);
                  }}
                />
                <span className='upload-button-overlay'>📷 Upload Banner</span>
              </label>
            )}
          </div>

          <div
            className='profile-picture-placeholder'
            style={
              userData?.profilePicture
                ? {
                  backgroundImage: `url(${userData.profilePicture})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
                : {}
            }>
            {!userData?.profilePicture && <span>Profile Picture</span>}
            {canEditProfile && (
              <label className='upload-overlay-label-small'>
                <input
                  type='file'
                  accept='image/*'
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadProfilePicture(file);
                  }}
                />
                <span className='upload-button-small'>📷</span>
              </label>
            )}
          </div>
        </div>

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

            {!editLinksMode && (
              <>
                <div className='external-links-section'>
                  {userData.externalLinks?.github && (
                    <a
                      href={userData.externalLinks.github}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='link-display'>
                      🔗 GitHub
                    </a>
                  )}
                  {userData.externalLinks?.artstation && (
                    <a
                      href={userData.externalLinks.artstation}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='link-display'>
                      🎨 ArtStation
                    </a>
                  )}
                  {userData.externalLinks?.linkedin && (
                    <a
                      href={userData.externalLinks.linkedin}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='link-display'>
                      💼 LinkedIn
                    </a>
                  )}
                  {userData.externalLinks?.website && (
                    <a
                      href={userData.externalLinks.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='link-display'>
                      🌐 Personal Website
                    </a>
                  )}
                  {!userData.externalLinks?.github &&
                    !userData.externalLinks?.artstation &&
                    !userData.externalLinks?.linkedin &&
                    !userData.externalLinks?.website && (
                      <span className='placeholder-note'>No external links added yet.</span>
                    )}
                </div>

                {canEditProfile && (
                  <button
                    className='button button-primary'
                    onClick={() => setEditLinksMode(true)}
                    style={{ marginTop: '0.5rem' }}>
                    Edit Links
                  </button>
                )}
              </>
            )}

            {editLinksMode && canEditProfile && (
              <div className='links-edit-section'>
                <div style={{ marginBottom: '1rem' }}>
                  <label>
                    <strong>🔗 GitHub:</strong>
                  </label>
                  <input
                    className='input-text'
                    type='url'
                    placeholder='https://github.com/yourusername'
                    value={githubLink ?? ''}
                    onChange={e => setGithubLink(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label>
                    <strong>🎨 ArtStation:</strong>
                  </label>
                  <input
                    className='input-text'
                    type='url'
                    placeholder='https://www.artstation.com/yourusername'
                    value={artstationLink ?? ''}
                    onChange={e => setArtstationLink(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label>
                    <strong>💼 LinkedIn:</strong>
                  </label>
                  <input
                    className='input-text'
                    type='url'
                    placeholder='https://www.linkedin.com/in/yourusername'
                    value={linkedinLink ?? ''}
                    onChange={e => setLinkedinLink(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label>
                    <strong>🌐 Personal Website:</strong>
                  </label>
                  <input
                    className='input-text'
                    type='url'
                    placeholder='https://yourportfolio.com'
                    value={websiteLink ?? ''}
                    onChange={e => setWebsiteLink(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className='button button-primary' onClick={handleUpdateExternalLinks}>
                    Save Links
                  </button>
                  <button className='button button-danger' onClick={() => setEditLinksMode(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Skills Section */}
            <h4>Software Expertise</h4>

            {!editSkillsMode && (
              <>
                <div className='skills-section'>
                  {userData.skills && userData.skills.length > 0 ? (
                    userData.skills.map(skill => (
                      <div key={skill} className='skill-placeholder'>
                        {skill}
                      </div>
                    ))
                  ) : (
                    <span className='placeholder-note'>No skills added yet.</span>
                  )}
                </div>
                {canEditProfile && (
                  <button
                    className='button button-primary'
                    onClick={() => setEditSkillsMode(true)}
                    style={{ marginTop: '0.5rem' }}>
                    Edit Skills
                  </button>
                )}
              </>
            )}

            {editSkillsMode && canEditProfile && (
              <div className='skills-edit-section'>
                <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                  Select your software expertise:
                </p>

                {/* 3D Software */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>3D Software:</strong>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                    }}>
                    {['Maya', 'Blender', '3ds Max', 'ZBrush', 'Houdini', 'Cinema 4D'].map(skill => (
                      <label key={skill} className='skill-checkbox-label'>
                        <input
                          type='checkbox'
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Texturing/Materials */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>Texturing & Materials:</strong>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                    }}>
                    {['Substance Painter', 'Substance Designer', 'Mari'].map(skill => (
                      <label key={skill} className='skill-checkbox-label'>
                        <input
                          type='checkbox'
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Game Engines */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>Game Engines:</strong>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                    }}>
                    {['Unreal Engine', 'Unity', 'Godot'].map(skill => (
                      <label key={skill} className='skill-checkbox-label'>
                        <input
                          type='checkbox'
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Programming */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>Programming Languages:</strong>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                    }}>
                    {[
                      'Python',
                      'C++',
                      'C#',
                      'JavaScript',
                      'MEL',
                      'React',
                      'MySQL',
                      'Unreal Engine Blueprints',
                    ].map(skill => (
                      <label key={skill} className='skill-checkbox-label'>
                        <input
                          type='checkbox'
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className='button button-primary' onClick={handleUpdateSkills}>
                    Save Skills
                  </button>
                  <button className='button button-danger' onClick={() => setEditSkillsMode(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Portfolio Grid Section - INTERACTIVE */}
            <h4>Portfolio</h4>
            <div className='portfolio-grid-section'>
              {userData.portfolioModels && userData.portfolioModels.length > 0 ? (
                userData.portfolioModels.map((modelUrl, index) => {
                  const thumbnailUrl = userData.portfolioThumbnails?.[index];
                  return (
                    <div
                      key={index}
                      className='portfolio-model-item'
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        // TODO: Navigate to full viewer
                        console.log('Clicked model:', index);
                      }}
                    >
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={`Portfolio model ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        // Fallback to 3D viewer if no thumbnail
                        <div style={{ width: '100%', height: '200px' }}>
                          <PortfolioModelViewer modelUrl={modelUrl} />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className='portfolio-placeholder'>
                  <div className='placeholder-text'>📦</div>
                  <span>No models uploaded yet</span>
                </div>
              )}

              {canEditProfile && (
                <button
                  className='portfolio-upload-box'
                  onClick={handleUploadPortfolio}
                  style={{ cursor: 'pointer' }}
                >
                  <div className='upload-placeholder'>
                    <div style={{ fontSize: '3rem' }}>➕</div>
                    <span>Upload Model</span>
                  </div>
                </button>
              )}
            </div>

            {/* Resume Section - INTERACTIVE */}
            <h4>Resume / CV</h4>
            <div className='resume-section'>
              {userData.resumeFile ? (
                <>
                  <a
                    href={userData.resumeFile}
                    download='resume.pdf'
                    className='button button-primary'
                    style={{ textDecoration: 'none', display: 'inline-block' }}>
                    📄 Download Resume
                  </a>
                  {canEditProfile && (
                    <label
                      className='button button-secondary'
                      style={{ marginLeft: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type='file'
                        accept='.pdf'
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadResume(file);
                        }}
                      />
                      🔄 Replace Resume
                    </label>
                  )}
                </>
              ) : (
                <>
                  {canEditProfile ? (
                    <label className='button button-primary' style={{ cursor: 'pointer' }}>
                      <input
                        type='file'
                        accept='.pdf'
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadResume(file);
                        }}
                      />
                      📄 Upload Resume
                    </label>
                  ) : (
                    <span className='placeholder-note'>No resume uploaded yet.</span>
                  )}
                </>
              )}
            </div>

            {/* Theme Customization - INTERACTIVE */}

            {canEditProfile && (
              <>
                <h4>Theme Colors</h4>
                {!editColorsMode && (
                  <>
                    <div className='theme-preview-section'>
                      <div
                        className='theme-color-box'
                        style={{ backgroundColor: userData.customColors?.primary || '#2563eb' }}>
                        Primary Color
                      </div>
                      <div
                        className='theme-color-box'
                        style={{ backgroundColor: userData.customColors?.accent || '#16a34a' }}>
                        Accent Color
                      </div>
                      <div
                        className='theme-color-box'
                        style={{
                          backgroundColor: userData.customColors?.background || '#f2f4f7',
                          color: '#1f2937',
                        }}>
                        Background Color
                      </div>
                    </div>
                    <button
                      className='button button-primary'
                      onClick={() => setEditColorsMode(true)}
                      style={{ marginTop: '0.5rem' }}>
                      Edit Colors
                    </button>
                  </>
                )}

                {editColorsMode && canEditProfile && (
                  <div className='colors-edit-section'>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>
                        <strong>Primary Color:</strong>
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          marginTop: '0.5rem',
                        }}>
                        <input
                          type='color'
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          style={{
                            width: '60px',
                            height: '40px',
                            cursor: 'pointer',
                            border: '2px solid #d1d5db',
                            borderRadius: '0.5rem',
                          }}
                        />
                        <input
                          className='input-text'
                          type='text'
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          placeholder='#2563eb'
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label>
                        <strong>Accent Color:</strong>
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          marginTop: '0.5rem',
                        }}>
                        <input
                          type='color'
                          value={accentColor}
                          onChange={e => setAccentColor(e.target.value)}
                          style={{
                            width: '60px',
                            height: '40px',
                            cursor: 'pointer',
                            border: '2px solid #d1d5db',
                            borderRadius: '0.5rem',
                          }}
                        />
                        <input
                          className='input-text'
                          type='text'
                          value={accentColor}
                          onChange={e => setAccentColor(e.target.value)}
                          placeholder='#16a34a'
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label>
                        <strong>Background Color:</strong>
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          marginTop: '0.5rem',
                        }}>
                        <input
                          type='color'
                          value={backgroundColor}
                          onChange={e => setBackgroundColor(e.target.value)}
                          style={{
                            width: '60px',
                            height: '40px',
                            cursor: 'pointer',
                            border: '2px solid #d1d5db',
                            borderRadius: '0.5rem',
                          }}
                        />
                        <input
                          className='input-text'
                          type='text'
                          value={backgroundColor}
                          onChange={e => setBackgroundColor(e.target.value)}
                          placeholder='#f2f4f7'
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className='button button-primary' onClick={handleUpdateCustomColors}>
                        Save Colors
                      </button>
                      <button
                        className='button button-danger'
                        onClick={() => setEditColorsMode(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

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
