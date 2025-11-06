import { useRef, useEffect } from 'react';
import useThreeViewportPage from '../../../hooks/useThreeViewportPage';

interface PortfolioModelViewerProps {
  modelUrl: string;
}

const PortfolioModelViewer = ({ modelUrl }: PortfolioModelViewerProps) => {
  const { containerRef } = useThreeViewportPage(modelUrl);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        background: '#f5f5f5',
        borderRadius: '0.75rem'
      }} 
    />
  );
};

export default PortfolioModelViewer;