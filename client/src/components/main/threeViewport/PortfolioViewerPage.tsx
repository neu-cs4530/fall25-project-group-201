import { useLocation, useParams, useNavigate } from 'react-router-dom';
import PortfolioModelViewer from './PortfolioModelViewer';

type Project = { title: string; modelUrl: string };

export default function PortfolioViewerPage() {
  const { username } = useParams();
  const location = useLocation() as { state?: Partial<Project> };
  const navigate = useNavigate();

  const project: Project | null = location.state?.modelUrl
    ? {
        title: location.state.title ?? 'Portfolio Model',
        modelUrl: location.state.modelUrl,
      }
    : null;

  if (!project) {
    return (
      <div style={{ padding: '20px', color: 'white', background: '#1a1a1a', height: '100vh' }}>
        No model provided. Click a portfolio thumbnail to view.
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a1a',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}>
      {/* Header with back button */}
      <div
        style={{
          padding: '20px',
          background: '#2a2a2a',
          borderBottom: '1px solid #3a3a3a',
          flexShrink: 0,
        }}>
        <button
          onClick={() => navigate(`/user/${username}`)}
          style={{
            padding: '10px 20px',
            background: '#3a3a3a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
          }}>
          ← Back to Profile
        </button>
      </div>

      {/* 3D Viewer - Full remaining height */}
      <div
        style={{
          flex: 1,
          width: '100%',
          minHeight: 0, // Critical for flex children
        }}>
        <PortfolioModelViewer modelUrl={project.modelUrl} />
      </div>
    </div>
  );
}
