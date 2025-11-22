import { Link } from 'react-router-dom';
import { DatabaseGalleryPost } from '@fake-stack-overflow/shared';
import './index.css';

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
  if (!posts || posts.length === 0) return null;

  return (
    <div className="relatedPostsContainer">
      <h3 className="relatedTitle">Related Posts</h3>

      <div className="relatedGrid">
        {posts.map(post => (
          <Link
            key={post._id.toString()}
            to={`/gallery/${post._id}`}
            className="relatedCard"
          >
            <div
              className="relatedThumb"
              style={{ backgroundImage: `url(${post.thumbnailMedia || post.media})` }}
            />
            <div className="relatedInfo">
              <h4 className="relatedPostTitle">{post.title}</h4>
              <p className="relatedPostUser">by {post.user}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
