import useThreeViewportPage from "../../../hooks/useThreeViewportPage";

const ThreeViewport = () => {
  const { containerRef } = useThreeViewportPage('/models/Duck.glb');

  return (
    <div
      style={{
        width: '600px', 
        height: '400px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        background: '#fff',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ margin: '8px', textAlign: 'center' }}>Dapper Avocado</h2>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: '#fff',
        }}
      />
    </div>
  );
};

export default ThreeViewport;
