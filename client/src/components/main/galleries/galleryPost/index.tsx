import './index.css';
import { Heart, Eye, Download, Trash2, ExternalLink, User } from 'lucide-react';
import useUserContext from '../../../../hooks/useUserContext';
import useGalleryPostPage from '../../../../hooks/useGalleryPostPage';
import ThreeViewport from '../../threeViewport';
import { Link } from 'react-router-dom';
import { getGalleryPostMedia } from '../../../../services/galleryService';
import useRelatedPosts from '../../../../hooks/useRelatedPosts';
import RelatedPosts from './relatedPosts';

/**
 * Component to display a single gallery post from a community gallery.
 */
const GalleryPostPage = () => {
  const { post, postUser, error, incrementDownloads, toggleLike, removePost } =
    useGalleryPostPage();
  const { user } = useUserContext();
  const { related, loading } = useRelatedPosts(post);

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

  /**
   * Handles logic when download button is clicked, requesting confirmation
   * @param mediaSize of the media
   * @param extension of the media file
   * @param id of the gallery post
   * @returns
   */
  const handleDownload = async (mediaSize: string, extension: string, id: string) => {
    const [valueStr, unit] = mediaSize.split(" ");
    const value = parseFloat(valueStr);

    // Convert to bytes for consistent comparison
    const sizeInBytes =
      unit.toUpperCase() === "KB" ? value * 1024 :
      unit.toUpperCase() === "MB" ? value * 1024 * 1024 :
      unit.toUpperCase() === "GB" ? value * 1024 * 1024 * 1024 :
      value; // assume already bytes if no unit

    // Threshold (example: 10 MB)
    const thresholdBytes = 10 * 1024 * 1024;

    if (sizeInBytes > thresholdBytes) {
      const confirmed = window.confirm(
        `This file is ${mediaSize}. Are you sure you want to download this .${extension} file?`,
      );
      if (!confirmed) return;
    }

    try {
      const mediaPath = await getGalleryPostMedia(id);

      const link = document.createElement('a');
      link.href = mediaPath;
      link.download = `file.${extension}`;
      link.click();
      await incrementDownloads();
    } catch (error) {
      window.alert('Something went wrong with downloading the file');
    }
  };

  return (
    <div className='galleryPostPage'>
      <div className='postContentWrapper'>
        {/* Left: main post */}
        <div className='mainPostWrapper'>
          <div className='postInfo'>
            <h1>{post.title}</h1>

            <div className='postMetaWrapper'>
              <div className='postAuthor'>
                {postUser && (
                  <Link to={`/user/${post.user}`} className='usernameLink'>
                    {postUser.profilePicture ? (
                      <div
                        className='profileIcon'
                        style={{ backgroundImage: `url(${postUser.profilePicture})` }}
                      />
                    ) : (
                      <User className='defaultProfileIcon' size={24} />
                    )}
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
                {post.permitDownload && (
                  <span className='statItem'>
                    <Download
                      size={20}
                      onClick={e => {
                        e.stopPropagation();
                        handleDownload(
                          post.mediaSize || 'undefined size',
                          ext!,
                          post._id.toString(),
                        );
                      }}
                      color='#007BFF'
                    />{' '}
                    {post.downloads}
                  </span>
                )}
                {!post.permitDownload && (
                  <span className='statItem download-disabled'>Downloads disabled</span>
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

          {post.mediaSize && post.permitDownload && 
            <div className='media-file-info'>
              <span className='infoChip'>{ext}</span>
              <span className='infoChip'>{post.mediaSize}</span>
            </div>
          }

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

        {/* Right: Related posts */}
        {!loading && related.length > 0 && (
          <div className='relatedPostsSidebar'>
            <RelatedPosts posts={related} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPostPage;
