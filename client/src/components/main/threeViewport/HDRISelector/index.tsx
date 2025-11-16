import { useState, useEffect } from 'react';
import './index.css';

interface HDRISelectorProps {
  currentPreset: string | null;
  onPresetChange: (preset: string) => void;
  isLoading: boolean;
  presets: Array<{ value: string; label: string }>;
}

const HDRISelector = ({ currentPreset, onPresetChange, isLoading, presets }: HDRISelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedPreset = presets.find(p => p.value === currentPreset) || presets[0];

  const handleSelect = (value: string) => {
    onPresetChange(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.hdri-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className='hdri-selector'>
      <button
        className='hdri-selector-button'
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}>
        {isLoading ? 'Loading...' : selectedPreset?.label || 'Select Lighting'}
      </button>

      {isOpen && (
        <div className='hdri-dropdown'>
          {presets.map(preset => (
            <div
              key={preset.value}
              className={`hdri-option ${preset.value === currentPreset ? 'active' : ''}`}
              onClick={() => handleSelect(preset.value)}>
              {preset.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HDRISelector;