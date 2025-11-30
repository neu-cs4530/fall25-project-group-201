import React, { useState } from 'react';
import { Testimonial } from '../../../types/types';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  canEditProfile: boolean;
  onApprove: (testimonialId: string, approved: boolean) => Promise<void>;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  canEditProfile,
  onApprove,
}) => {
  const navigate = useNavigate();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const approvedTestimonials = testimonials.filter(t => t.approved);
  const pendingTestimonials = testimonials.filter(t => !t.approved);

  // Pagination logic for approved testimonials
  const totalPages = Math.ceil(approvedTestimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestimonials = approvedTestimonials.slice(startIndex, endIndex);

  const handleApprove = async (testimonialId: string, approved: boolean) => {
    setProcessingId(testimonialId);
    try {
      await onApprove(testimonialId, approved);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className='testimonials-section'>
      {/* Pending testimonials - no pagination needed since user should review all */}
      {canEditProfile && pendingTestimonials.length > 0 && (
        <div className='pending-testimonials'>
          <h5>Pending Testimonials ({pendingTestimonials.length})</h5>
          <p className='pending-note'>
            Review and approve testimonials before they appear on your profile.
          </p>
          {pendingTestimonials.map(testimonial => (
            <div key={testimonial._id?.toString()} className='testimonial-card pending'>
              <div className='testimonial-header'>
                <div
                  className='testimonial-author'
                  onClick={() => navigate(`/user/${testimonial.fromUsername}`)}
                  style={{ cursor: 'pointer' }}>
                  {testimonial.fromProfilePicture ? (
                    <img
                      src={testimonial.fromProfilePicture}
                      alt={testimonial.fromUsername}
                      className='testimonial-avatar'
                    />
                  ) : (
                    <div className='testimonial-avatar-placeholder'>
                      {testimonial.fromUsername[0].toUpperCase()}
                    </div>
                  )}
                  <div className='testimonial-author-info'>
                    <strong>{testimonial.fromUsername}</strong>
                    <span className='testimonial-date'>{formatDate(testimonial.createdAt)}</span>
                  </div>
                </div>
              </div>
              <p className='testimonial-content'>{testimonial.content}</p>
              <div className='testimonial-actions'>
                <button
                  className='button button-primary'
                  onClick={() => handleApprove(testimonial._id!.toString(), true)}
                  disabled={processingId === testimonial._id?.toString()}>
                  ✓ Approve
                </button>
                <button
                  className='button button-danger'
                  onClick={() => handleApprove(testimonial._id!.toString(), false)}
                  disabled={processingId === testimonial._id?.toString()}>
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved testimonials with pagination */}
      <div className='approved-testimonials'>
        {currentTestimonials.length > 0 ? (
          <>
            {currentTestimonials.map(testimonial => (
              <div key={testimonial._id?.toString()} className='testimonial-card'>
                <div className='testimonial-header'>
                  <div
                    className='testimonial-author'
                    onClick={() => navigate(`/user/${testimonial.fromUsername}`)}
                    style={{ cursor: 'pointer' }}>
                    {testimonial.fromProfilePicture ? (
                      <img
                        src={testimonial.fromProfilePicture}
                        alt={testimonial.fromUsername}
                        className='testimonial-avatar'
                      />
                    ) : (
                      <div className='testimonial-avatar-placeholder'>
                        {testimonial.fromUsername[0].toUpperCase()}
                      </div>
                    )}
                    <div className='testimonial-author-info'>
                      <strong>{testimonial.fromUsername}</strong>
                      <span className='testimonial-date'>{formatDate(testimonial.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <p className='testimonial-content'>{testimonial.content}</p>
              </div>
            ))}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div
                className='pagination-controls'
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '1rem',
                  padding: '1rem 0',
                }}>
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className='button button-secondary'
                  style={{
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}>
                  <ChevronLeft size={20} /> Previous
                </button>

                <span style={{ color: '#6b7280' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className='button button-secondary'
                  style={{
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}>
                  Next <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className='no-testimonials'>
            <p>💬 No testimonials yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsSection;
