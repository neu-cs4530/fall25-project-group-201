import React from 'react';

interface CameraRefProps {
  cameraRef: string;
}

export const preprocessCameraRefs = (text: string) => {
  return text.replace(/(#camera-[\w\(\),-]+)/g, '[$1]($1)');
};

const CameraRef: React.FC<CameraRefProps> = ({ cameraRef }) => {
  return (
    <span
      style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
      onClick={() => alert(`Clicked on mention: ${cameraRef}`)}
    >
      @{cameraRef}
    </span>
  );
};

export default CameraRef;
