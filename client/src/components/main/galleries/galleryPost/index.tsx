import './index.css';
import { Heart, Eye, Download, Trash2, ExternalLink } from 'lucide-react';
import useUserContext from '../../../../hooks/useUserContext';
import useGalleryPostPage from '../../../../hooks/useGalleryPostPage';
import ThreeViewport from '../../threeViewport';
import { Link } from 'react-router-dom';

const handleDownload = (mediaSize: string, extension: string) => {
  const confirmed = window.confirm(
    `This file is ${mediaSize}. Are you sure you want to download this .${extension} file?`,
  );
  if (!confirmed) return;

  {
    /* Logic for downloading the file */
  }
};

/**
 * Component to display a single gallery post from a community gallery.
 */
const GalleryPostPage = () => {
  const { post, postUser, error, incrementDownloads, toggleLike, removePost } =
    useGalleryPostPage();
  const { user } = useUserContext();

  if (error) return <div className='postError'>{error}</div>;
  if (!post) return <div className='postLoading'>Loading...</div>;

  if (error) return <div className='postError'>{error}</div>;
  if (!post) return <div className='postLoading'>Loading...</div>;

  const isAuthor = post.user === user.username;

  const getYouTubeVideoId = (url: string) =>
    url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] ?? null;
  const getVimeoVideoId = (url: string) => url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;

  const url = post.media;
  const ext = url.split('.').pop()?.toLowerCase();
  const is3D = ext === 'glb';
  const isVideo = ['mp4', 'webm', 'mov'].includes(ext || '');
  const youTubeId = getYouTubeVideoId(url);
  const vimeoId = getVimeoVideoId(url);
  const formatTag = (tag: string) => tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className='galleryPostPage'>
      <div className='postInfo'>
        <h1>{post.title}</h1>
        <div className='postMetaWrapper'>
          <div className='postAuthor'>
            {postUser && (
              <Link to={`/user/${post.user}`} className='usernameLink'>
                <div
                  className='profileIcon'
                  style={{
                    backgroundImage: postUser.profilePicture
                      ? `url(${postUser.profilePicture})`
                      : 'url(/default-profile.png)',
                  }}
                />
                {post.user}
              </Link>
            )}
            <span className='postedAt'>• {new Date(post.postedAt).toLocaleString()}</span>
          </div>

          <div className='postStats'>
            <span className='statItem' onClick={toggleLike}>
              <Heart size={20} color={post.likes.includes(user.username) ? 'red' : 'gray'} />{' '}
              {post.likes.length}
            </span>
            <span className='statItem'>
              <Eye size={20} /> {post.views}
            </span>
            {!(youTubeId || vimeoId) && (
              <span
                className='statItem'
                onClick={() => {
                  incrementDownloads();
                  window.open(post.media, '_blank');
                }}>
                <Download
                  size={20}
                  onClick={() => handleDownload(post.mediaSize || 'Unknown size', ext!)}
                  color='blue'
                />{' '}
                {post.downloads}
              </span>
            )}
            {isAuthor && (
              <span className='statItem delete' onClick={removePost}>
                <Trash2 size={20} color='red' />
              </span>
            )}
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className='postTags'>
            {post.tags.map(tag => (
              <span key={tag} className='tagChip'>
                {formatTag(tag)}
              </span>
            ))}
          </div>
        )}

        <p className='postDescription'>{post.description}</p>
      </div>

      <div className='mediaWrapper'>
        {is3D && <ThreeViewport modelPath={post.media} />}
        {youTubeId && (
          <iframe
            width='800'
            height='450'
            src={`https://www.youtube.com/embed/${youTubeId}`}
            allowFullScreen
          />
        )}
        {vimeoId && (
          <iframe
            width='800'
            height='450'
            src={`https://player.vimeo.com/video/${vimeoId}`}
            allowFullScreen
          />
        )}
        {!is3D && !youTubeId && !vimeoId && !isVideo && (
          <img src={url} alt={post.title} className='postMedia' />
        )}
        {isVideo && <video src={url} controls muted className='postMedia'></video>}
      </div>
      {post.link && (
        <div className='viewProjectBtnWrapper'>
          <button className='viewProjectBtn' onClick={() => window.open(post.link, '_blank')}>
            <ExternalLink size={18} />
            View Project
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryPostPage;
