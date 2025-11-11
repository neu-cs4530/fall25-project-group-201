import useThreeViewport from '../../../../hooks/useThreeViewport';

interface PortfolioModelViewerProps {
  modelUrl: string;
}

const PortfolioModelViewer = ({ modelUrl }: PortfolioModelViewerProps) => {
  const { containerRef } = useThreeViewport(modelUrl);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#2a2a2a'
      }}
    />
  );
};

export default PortfolioModelViewer;