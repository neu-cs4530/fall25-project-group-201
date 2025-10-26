import useThreeViewportPage from "../../../hooks/useThreeViewportPage";
import "./index.css";

const ThreeViewport = () => {
  // const { containerRef } = useThreeViewportPage('/models/Avocado.glb');
  const { containerRef } = useThreeViewportPage('/models/Duck.glb');
  // const { containerRef } = useThreeViewportPage('/models/ToyCar.glb');
  // const { containerRef } = useThreeViewportPage('/models/Fish.glb');

  return (
    <div className="viewport-card">
      <div ref={containerRef} className="viewport-canvas" />
    </div>
  );
};

export default ThreeViewport;
