import './index.css';
import useInfoPopover from '../../../../hooks/useInfoPopover';

const InfoPopover = () => {
  const { popoverRef } = useInfoPopover();

  return (
    <div
      id='popover-content'
      ref={popoverRef}
      className='popover-content'
      role='dialog'
      aria-modal='true'>
      Welcome to the 3D viewport!
      <br />
      &bull; Click and drag to turn <br />
      &bull; Scroll to zoom <br />
      &bull; Arrow keys to pan <br />
      &bull; WASD to tilt <br />
      &bull; Buttons (left to right): reset camera,
      <br />
      perspective/orthographic mode,
      <br />
      and HDRI lighting setups toggles <br />
    </div>
  );
};

export default InfoPopover;
