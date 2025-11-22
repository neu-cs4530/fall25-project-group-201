import { useLocation, useParams, useNavigate } from 'react-router-dom';
import ThreeViewport from '../index';
import './index.css';

type PortfolioItem = {
  title: string;
  description?: string;
  mediaUrl: string;
  thumbnailUrl?: string;
};

export default function PortfolioViewerPage() {
  const { username } = useParams();
  const location = useLocation() as { state?: PortfolioItem };
  const navigate = useNavigate();

  const item = location.state;

  if (!item?.mediaUrl) {
    return (
      <div style={{ padding: '20px', background: '#fff', height: '100vh' }}>
        No media provided. Click a portfolio item to view.
      </div>
    );
  }

  const getYouTubeVideoId = (url: string) =>
    url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] ?? null;
  const getVimeoVideoId = (url: string) => url.match(/vimeo\.com\/(\d+)/)?.[1] ?? null;

  const url = item.mediaUrl;
  const ext = url.split('.').pop()?.toLowerCase();
  const is3D = ext === 'glb' || url.includes('data:model/gltf-binary');
  const youTubeId = getYouTubeVideoId(url);
  const vimeoId = getVimeoVideoId(url);
  const isVideo = url.toLowerCase().endsWith('.mp4') || youTubeId || vimeoId;
  const isImage = !is3D && !isVideo;

  return (
    <div className='galleryPostPage'>
      <div className='postInfo'>
        <button
          onClick={() => navigate(`/user/${username}`)}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '15px',
          }}>
          ← Back to Profile
        </button>

        <h1>{item.title}</h1>

        {item.description && <p className='postDescription'>{item.description}</p>}
      </div>

      <div className='mediaWrapper'>
        {is3D && <ThreeViewport modelPath={url} />}
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
        {isVideo && !youTubeId && !vimeoId && <video src={url} controls className='postMedia' />}
        {isImage && <img src={url} alt={item.title} className='postMedia' />}
      </div>
    </div>
  );
}
