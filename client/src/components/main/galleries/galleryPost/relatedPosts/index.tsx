import { useNavigate } from 'react-router-dom';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';
import useUserContext from '../../../../../hooks/useUserContext';
import { incrementGalleryPostViews } from '../../../../../services/galleryService';
import './index.css';
import { useState } from 'react';

/**
 * Props for the RelatedPosts component.
 *
 * @property {DatabaseGalleryPost[]} posts - Array of gallery posts to display as related.
 */
interface RelatedPostsProps {
  posts: DatabaseGalleryPost[];
}

/**
 * Renders a list of related gallery posts.
 * Each post is displayed as a card with a thumbnail, title, and author.
 * Clicking on a post navigates to its gallery page.
 *
 * @param {RelatedPostsProps} props - Component props.
 * @returns {JSX.Element | null} A grid of related posts or null if no posts are provided.
 */
const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts }) => {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (!posts || posts.length === 0) return null;

  /**
   * Handles click on a related post card.
   *
   * @param post - related post that was clicked
   */
  const handleClick = async (post: DatabaseGalleryPost) => {
    try {
      if (user?.username) {
        await incrementGalleryPostViews(post._id.toString(), user.username);
      }
    } catch (err) {
      setError('Error incrementing gallery post views');
    }
    navigate(`/gallery/${post._id}`);
  };

  return (
    <div className='relatedPostsContainer'>
      <h3 className='relatedTitle'>Related Posts</h3>
      <div className='relatedGrid'>
        {posts.map(post => (
          <div
            key={post._id.toString()}
            className='relatedCard'
            onClick={() => handleClick(post)}
            style={{ cursor: 'pointer' }}>
            <div
              className='relatedThumb'
              style={{ backgroundImage: `url(${post.thumbnailMedia || post.media})` }}
            />
            <div className='relatedInfo'>
              <h4 className='relatedPostTitle'>{post.title}</h4>
              <p className='relatedPostUser'>by {post.user}</p>
            </div>
          </div>
        ))}
      </div>
      {error && <div className='error'>{error}</div>}
    </div>
  );
};

export default RelatedPosts;
