import React, { useState } from 'react';
import { Testimonial } from '../../../types/types';
import './index.css';

interface WriteTestimonialButtonProps {
  profileUsername: string;
  currentUsername: string;
  existingTestimonial?: Testimonial;
  onSubmit: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

const WriteTestimonialButton: React.FC<WriteTestimonialButtonProps> = ({
  profileUsername,
  currentUsername,
  existingTestimonial,
  onSubmit,
  onDelete,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState(existingTestimonial?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't show button if viewing your own profile
  if (profileUsername === currentUsername) {
    return null;
  }

  const handleSubmit = async () => {
    if (content.trim().length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setShowModal(false);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your testimonial?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onDelete();
      setShowModal(false);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setContent(existingTestimonial?.content || '');
  };

  return (
    <>
      <button
        className='button button-primary'
        onClick={() => setShowModal(true)}
        style={{ marginBottom: '1rem' }}>
        {existingTestimonial ? '✏️ Edit Your Testimonial' : '💬 Write a Testimonial'}
      </button>

      {showModal && (
        <div className='modal-overlay' onClick={handleClose}>
          <div className='modal-content testimonial-modal' onClick={e => e.stopPropagation()}>
            <div className='modal-header'>
              <h3>
                {existingTestimonial ? 'Edit' : 'Write'} Testimonial for {profileUsername}
              </h3>
              <button className='modal-close' onClick={handleClose}>
                ✕
              </button>
            </div>

            <div className='modal-body'>
              <p className='modal-description'>
                Share your experience working with or knowing {profileUsername}. Your testimonial
                will be reviewed before appearing on their profile.
              </p>

              <textarea
                className='testimonial-textarea'
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder='Write your testimonial here...'
                maxLength={1000}
                rows={6}
                disabled={isSubmitting}
              />

              <div className='character-count'>{content.length} / 1000 characters</div>
            </div>

            <div className='modal-footer'>
              <div className='modal-footer-left'>
                {existingTestimonial && (
                  <button
                    className='button button-danger'
                    onClick={handleDelete}
                    disabled={isSubmitting}>
                    Delete
                  </button>
                )}
              </div>
              <div className='modal-footer-right'>
                <button
                  className='button button-secondary'
                  onClick={handleClose}
                  disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  className='button button-primary'
                  onClick={handleSubmit}
                  disabled={content.trim().length === 0 || isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WriteTestimonialButton;
