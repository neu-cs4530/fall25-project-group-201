interface CameraRefProps {
  cameraRef: string;
}

// Removed the helper export to fix Fast Refresh warning

export default function CameraRef({ cameraRef }: CameraRefProps) {
  return (
    <span
      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
      onClick={() => alert(`Clicked on mention: ${cameraRef}`)}>
      @{cameraRef}
    </span>
  );
}
