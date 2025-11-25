interface CameraRefProps {
  cameraRef: string;
}

/**
 * Renders a clickable mention of a camera reference.
 */
export default function CameraRef({ cameraRef }: CameraRefProps) {
  return (
    <span
      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
      onClick={() => alert(`Clicked on mention: ${cameraRef}`)}>
      @{cameraRef}
    </span>
  );
}
