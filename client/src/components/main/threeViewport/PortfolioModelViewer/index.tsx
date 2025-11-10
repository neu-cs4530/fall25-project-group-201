import useThreeViewportPage from '../../../../hooks/useThreeViewportPage';
import './index.css';

interface PortfolioModelViewerProps {
  modelUrl: string;
}

const PortfolioModelViewer = ({ modelUrl }: PortfolioModelViewerProps) => {
  const { containerRef } = useThreeViewportPage(modelUrl);

  return (
    <div
      ref={containerRef}
      className='portfolio-model-viewer'
    />
  );
};

export default PortfolioModelViewer;