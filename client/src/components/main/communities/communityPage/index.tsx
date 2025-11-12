import { useNavigate } from 'react-router-dom';
import useCommunityPage from '../../../../hooks/useCommunityPage';
import QuestionView from '../../questionPage/question';
import CommunityMembershipButton from '../communityMembershipButton';
import GalleryComponent from '../../galleries/galleryComponent';
import './index.css';

/**
 * Component for displaying a single community page.
 *
 * Shows the community's details, list of members, gallery, and questions.
 */
const CommunityPage = () => {
  const { community, communityQuestions, username, handleDeleteCommunity } = useCommunityPage();
  const navigate = useNavigate();

  if (!community) {
    return <div className='loading'>Loading...</div>;
  }

  /**
   * Navigate to the new gallery post creation page for this community.
   */
  const handleNewGalleryPost = () => {
    navigate(`/new/galleryPost/${community._id}`);
  };

  return (
    <div className='community-page-layout'>
      {/* Questions & Gallery Section */}
      <main className='questions-and-gallery-section'>
        {/* Gallery Section */}
        <main className='gallery-section'>
          <div className='gallery-header-row'>
            <h3 className='gallery-heading'>Gallery</h3>
            <div className='gallery-upload-button' onClick={handleNewGalleryPost}>
              <div style={{ fontSize: '2rem' }}>+</div>
              <span>Upload Project</span>
            </div>
          </div>

          <hr className='gallery-divider' />

          <GalleryComponent communityID={community._id.toString()} />
        </main>

        {/* Questions Section */}
        <main className='questions-section'>
          <h3 className='questions-heading'>Questions</h3>
          {communityQuestions.map(q => (
            <QuestionView question={q} key={q._id.toString()} />
          ))}
        </main>
      </main>

      {/* Sidebar */}
      <div className='community-sidebar'>
        <h2 className='community-title'>{community.name}</h2>
        <p className='community-description'>{community.description}</p>

        {community.admin === username && (
          <button className='delete-community-btn' onClick={handleDeleteCommunity}>
            Delete Community
          </button>
        )}

        <CommunityMembershipButton community={community} />

        <div className='community-members'>
          <h3 className='section-heading'>Members</h3>
          <ul className='members-list'>
            {community?.participants.map(username => (
              <li key={username} className='member-item'>
                {username}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
