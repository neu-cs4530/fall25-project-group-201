import useCommunityPage from '../../../../hooks/useCommunityPage';
import QuestionView from '../../questionPage/question';
import CommunityMembershipButton from '../communityMembershipButton';
import './index.css';
import GalleryComponent from '../../galleryComponent/'

/**
 * This component displays the details of a specific community, including its name, description,
 * members, and questions.
 */
const CommunityPage = () => {
  const { community, communityQuestions, username, handleDeleteCommunity } = useCommunityPage();

  if (!community) {
    return <div className='loading'>Loading...</div>;
  }

  return (
    <div className='community-page-layout'>
      <main className='questions-and-gallery-section'>
        <main className='gallery-section'>
          <h3 className='gallery-heading'>Gallery</h3>
          <div className='upload-placeholder'>
              <div style={{ fontSize: '3rem' }}>➕</div>
              <span>Upload Project</span>
          </div>
          <GalleryComponent/>         
        </main>

        <main className='questions-section'>
          <h3 className='section-heading'>Questions</h3>
          {communityQuestions.map(q => (
            <QuestionView question={q} key={q._id.toString()} />
          ))}
        </main>
      </main>

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
