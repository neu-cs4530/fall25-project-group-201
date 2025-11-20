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
      <p>Click and drag to turn, and scroll to zoom in and out.</p>
      <p>Buttons in the top left are the reset camera button, </p>
      <p>perspective/orthographic mode button, and </p>
      <p>some toggles between HDRI lighting setups.</p>
    </div>
  );
};

export default InfoPopover;
