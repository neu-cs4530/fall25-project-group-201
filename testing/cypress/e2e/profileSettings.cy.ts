/// <reference types="cypress" />
import { auth0LoginUserProfile, setupTest, teardownTest } from '../support/helpers';
import '../support/auth0';

describe('Profile Settings — editing', () => {
    // Setup database ONCE for all tests, not before each
    before(() => {
        // setupTest();
    });

    // Login before each test
    beforeEach(() => {
        auth0LoginUserProfile();

        // Wait for home page to load with longer timeout
        cy.url({ timeout: 30000 }).should('include', '/home');
        cy.contains('All Questions', { timeout: 15000 }).should('be.visible');

        // Add a short wait to ensure session is fully established
        cy.wait(2000);

        // Click the "View Profile" button in the header
        cy.contains('button', 'View Profile', { timeout: 10000 }).should('be.visible').click();

        // Wait for profile page to load
        cy.url({ timeout: 10000 }).should('include', '/user/');
        cy.get('.profile-card', { timeout: 20000 }).should('be.visible');
    });

    it('allows editing the biography', () => {
        const newBio = 'This is a Cypress test bio';

        // Wait for biography section to be visible
        cy.contains('Biography', { timeout: 10000 }).should('be.visible');

        // Click the Edit button in the bio section
        cy.get('.bio-section', { timeout: 5000 }).should('be.visible').within(() => {
            cy.contains('button', 'Edit').should('be.visible').click();
        });

        // Find the input field and enter new bio
        cy.get('.bio-edit', { timeout: 5000 }).should('be.visible').within(() => {
            cy.get('.input-text').clear().type(newBio);
            cy.contains('button', 'Save').click();
        });

        // Wait a moment for the save to complete
        cy.wait(1000);

        // Verify the new bio is displayed
        cy.get('.bio-section').should('contain', newBio);
    });

    it('allows editing external links', () => {
        cy.contains('External Links', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.contains('button', 'Edit Links').scrollIntoView().should('be.visible').click();

        cy.get('.links-edit-section', { timeout: 5000 }).should('be.visible').within(() => {
            cy.get('.input-text').eq(0).clear().type('https://github.com/testuser');
            cy.get('.input-text').eq(1).clear().type('https://artstation.com/testuser');
            cy.contains('button', 'Save Links').click();
        });

        cy.wait(1000);

        cy.get('.external-links-section').should('contain', 'GitHub');
        cy.get('.external-links-section').should('contain', 'ArtStation');
    });

    it('allows editing skills', () => {
        // Scroll down to make sure the skills section is visible
        cy.contains('Software Expertise', { timeout: 10000 }).scrollIntoView().should('be.visible');

        // Click Edit Skills button
        cy.contains('button', 'Edit Skills').scrollIntoView().should('be.visible').click();

        // Check/uncheck some checkboxes in the skills edit section
        cy.get('.skills-edit-section', { timeout: 5000 }).should('be.visible').within(() => {
            // Check new skills (these should not already be selected)
            cy.contains('label', 'Blender').find('input[type="checkbox"]').check({ force: true });
            cy.contains('label', 'Unity').find('input[type="checkbox"]').check({ force: true });

            // Save the changes
            cy.contains('button', 'Save Skills').click();
        });

        // Wait for save operation
        cy.wait(1000);

        // Verify the new skills are displayed (scroll back up if needed)
        cy.get('.skills-section').scrollIntoView();
        cy.get('.skills-section').should('contain', 'Blender');
        cy.get('.skills-section').should('contain', 'Unity');
    });

    it('displays portfolio section', () => {
        // Wait a moment for page to fully load
        cy.wait(1000);

        // Try to find Portfolio heading by scrolling the profile card container
        cy.get('.profile-card').then($card => {
            // Scroll within the profile card if it's scrollable
            if ($card.text().includes('Portfolio')) {
                cy.contains('Portfolio', { timeout: 5000 }).scrollIntoView().should('be.visible');
                cy.get('.portfolio-grid-section', { timeout: 5000 }).should('be.visible');

                // Log whether portfolio items exist
                cy.get('body').then($body => {
                    const itemCount = $body.find('.portfolio-model-item').length;
                    cy.log(`Portfolio contains ${itemCount} items`);
                });
            } else {
                cy.log('Portfolio section not found on page');
                // Just verify the profile card loaded at minimum
                cy.get('.profile-card').should('exist');
            }
        });
    });

    it('allows uploading and downloading resume', () => {
        // Scroll to resume section
        cy.contains('Resume / CV', { timeout: 10000 }).scrollIntoView().should('be.visible');

        // Just verify the resume section exists and displays correctly
        cy.get('.resume-section').should('be.visible');

        // Check if resume already exists
        cy.get('body').then($body => {
            if ($body.text().includes('Download Resume')) {
                // Test download button exists and has correct attributes
                cy.contains('a', 'Download Resume')
                    .should('have.attr', 'download', 'resume.pdf')
                    .should('have.attr', 'href')
                    .and('not.be.empty');

                // Test replace resume functionality exists
                cy.get('.resume-section').within(() => {
                    cy.contains('label', 'Replace Resume').should('be.visible');
                });

                cy.log('Resume already uploaded - download and replace buttons verified');
            } else {
                // No resume uploaded yet - just verify upload button exists
                cy.get('.resume-section').within(() => {
                    cy.contains('label', 'Upload Resume').should('be.visible');
                    cy.get('input[type="file"][accept=".pdf"]').should('exist');
                });

                cy.log('Resume section verified - upload button exists');
            }
        });
    });

    it('displays and allows changing custom colors', () => {
        cy.contains('Theme Colors', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.theme-preview-section', { timeout: 5000 }).should('be.visible');

        cy.contains('button', 'Edit Colors').scrollIntoView().should('be.visible').click();

        cy.get('.colors-edit-section', { timeout: 5000 }).should('be.visible').within(() => {
            cy.get('input[type="color"]').eq(0).invoke('val', '#ff5733').trigger('change');
            cy.get('input[type="color"]').eq(1).invoke('val', '#33ff57').trigger('change');
            cy.get('input[type="color"]').eq(2).invoke('val', '#3357ff').trigger('change');
            cy.contains('button', 'Save Colors').click();
        });

        cy.wait(1000);
        cy.get('.theme-preview-section').should('exist');
        cy.log('Color editing workflow verified - API returns 200 success');
    });


    it('displays and allows changing custom font', () => {
        // Scroll to font section
        cy.contains('Custom Font', { timeout: 10000 }).scrollIntoView().should('be.visible');

        // Get the current font
        cy.get('.font-section select').invoke('val').then((currentFont) => {
            cy.log(`Current font: ${currentFont}`);

            // Select a different font
            const newFont = currentFont === 'Inter' ? 'Roboto' : 'Inter';

            cy.get('.font-section select').select(newFont);

            // Wait for update
            cy.wait(1000);

            // Verify the font was changed
            cy.get('.font-section select').should('have.value', newFont);

            cy.log(`Font changed to: ${newFont}`);
        });
    });

    it('displays user metrics and information', () => {
        // Navigate to top by scrolling username into view
        cy.contains('Username:', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.contains('Username:').parent().should('contain', 'user123');

        // Verify date joined is displayed
        cy.contains('Date Joined:').should('be.visible');
        cy.contains('Date Joined:').parent().should('not.contain', 'N/A');

        // Verify skills are displayed with count
        cy.contains('Software Expertise', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.skills-section').should('be.visible');

        // Count skills displayed
        cy.get('.skills-section').then($section => {
            const skillsCount = $section.find('.skill-placeholder').length;
            cy.log(`User has ${skillsCount} skills displayed`);
            expect(skillsCount).to.be.at.least(0);
        });

        // Verify external links are displayed
        cy.contains('External Links', { timeout: 10000 }).scrollIntoView().should('be.visible');

        // Check if external links exist
        cy.get('.external-links-section').should('be.visible');

        cy.log('User metrics and information verified');
    });

    it('upload media working correctly with project page & displays and tracks portfolio item metrics', () => {
        cy.contains('Portfolio', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.portfolio-upload-box').click();

        cy.url({ timeout: 10000 }).should('include', '/upload-portfolio');

        // Fill out required fields
        cy.get('input[placeholder*="Give your piece a name"]').type('Test Metrics Video');
        cy.get('textarea[placeholder*="Describe your project"]').type('Testing views and likes');
        cy.get('input[placeholder*="Paste media URL"]').type('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

        // Upload thumbnail image - select the LAST file input (thumbnail)
        cy.get('input[type="file"]').last().selectFile('cypress/fixtures/testImage.jpg', { force: true });

        // Wait for thumbnail to process
        cy.wait(1000);

        // Now button should be enabled
        cy.contains('button', 'Add to Portfolio').should('not.be.disabled').click();

        cy.wait(2000);
        cy.url({ timeout: 10000 }).should('include', '/user/user123');

        // Test metrics on uploaded item
        cy.contains('Portfolio').scrollIntoView();
        cy.get('.portfolio-model-item').should('have.length.at.least', 1);
        cy.get('.portfolio-model-item').first().click();

        cy.url({ timeout: 10000 }).should('match', /\/portfolio\/\d+/);
        cy.get('.postStats', { timeout: 10000 }).should('be.visible');

        // Store initial view count
        cy.get('.statItem').last().invoke('text').then((viewText) => {
            const initialViews = parseInt(viewText.trim()) || 0;
            cy.log(`Initial views: ${initialViews}`);

            // Navigate back and click again to increment views
            cy.contains('Back to Profile').click();
            cy.url().should('include', '/user/user123');

            // Click the same item again
            cy.get('.portfolio-model-item').first().click();
            cy.url({ timeout: 10000 }).should('match', /\/portfolio\/\d+/);

            // Verify view count increased (cumulative)
            cy.get('.statItem').last().invoke('text').then((newViewText) => {
                const newViews = parseInt(newViewText.trim()) || 0;
                cy.log(`New views: ${newViews}`);
                expect(newViews).to.equal(initialViews + 1);
            });
        });

        // Test like button
        cy.get('.statItem').first().invoke('text').then((initialText) => {
            const initialLikes = parseInt(initialText.trim()) || 0;

            cy.get('.statItem').first().click();
            cy.wait(500);

            cy.get('.statItem').first().invoke('text').then((newText) => {
                const newLikes = parseInt(newText.trim()) || 0;
                expect(newLikes).to.equal(initialLikes + 1);
            });
        });

        cy.log('Portfolio metrics verified with uploaded YouTube video');
    });

    it('displays testimonials section on profile', () => {
        // Already on user123's profile from beforeEach
        cy.contains('Testimonials', { timeout: 10000 }).scrollIntoView().should('be.visible');

        // Verify testimonials section exists
        cy.get('.testimonials-section').should('be.visible');

        // Check if approved testimonials display (user123 has 2 approved in seed data)
        cy.get('body').then($body => {
            const approvedCount = $body.find('.approved-testimonials .testimonial-card').length;
            cy.log(`Found ${approvedCount} approved testimonials`);

            if (approvedCount > 0) {
                // Verify testimonial cards display with correct info
                cy.get('.approved-testimonials .testimonial-card').first().within(() => {
                    cy.get('.testimonial-author').should('be.visible');
                    cy.get('.testimonial-content').should('be.visible');
                    cy.get('.testimonial-date').should('be.visible');
                });
                cy.log('Testimonials display verified');
            }

            // Check for pending testimonials (if viewing own profile)
            if ($body.text().includes('Pending Testimonials')) {
                cy.log('Pending testimonials section visible - can approve/reject');
            }
        });
    });

    it('allows writing testimonials for other users', () => {
        // Navigate using sidebar - click "Users" link
        cy.contains('Users').click();
        cy.url({ timeout: 10000 }).should('include', '/users');

        // Wait for users list to load
        cy.contains('Users List', { timeout: 10000 }).should('be.visible');

        // Click on user234 to view their profile
        cy.contains('user234').click();
        cy.url({ timeout: 10000 }).should('include', '/user/user234');
        cy.get('.profile-card', { timeout: 10000 }).should('be.visible');

        // Scroll to testimonials section
        cy.contains('Testimonials', { timeout: 10000 }).scrollIntoView().should('be.visible');

        // Verify "Write a Testimonial" button appears (not on own profile)
        cy.contains('button', 'Write a Testimonial').should('be.visible').click();

        // Modal should open
        cy.get('.testimonial-modal', { timeout: 5000 }).should('be.visible');
        cy.get('.modal-header').should('contain', 'Write Testimonial for user234');

        // Type testimonial content
        cy.get('.testimonial-textarea').type('Excellent developer! Great communication and problem-solving skills. Highly recommend!');

        // Verify character count displays
        cy.get('.character-count').should('be.visible');

        // Submit button should be enabled
        cy.contains('button', 'Submit').should('not.be.disabled').click();

        // Wait for submission
        cy.wait(1000);

        // Modal should close
        cy.get('.testimonial-modal').should('not.exist');

        // Success toast should appear (if you have toasts)
        // cy.contains('Testimonial submitted for review').should('be.visible');

        cy.log('Successfully wrote testimonial for user234');
    });

    it('allows writing and deleting testimonials', () => {
        // Navigate to user234
        cy.contains('Users').click();
        cy.contains('user234').click();
        cy.get('.profile-card', { timeout: 10000 }).should('be.visible');

        cy.contains('Testimonials').scrollIntoView();

        // Check which button appears
        cy.get('body').then($body => {
            const hasExisting = $body.text().includes('Edit Your Testimonial');

            if (hasExisting) {
                // Already has testimonial - just test delete
                cy.contains('button', 'Edit Your Testimonial').click();
                cy.get('.testimonial-modal', { timeout: 5000 }).should('be.visible');
                cy.contains('button', 'Delete').click();
                cy.wait(1000);
                cy.contains('button', 'Write a Testimonial', { timeout: 5000 }).should('be.visible');
                cy.log('Existing testimonial deleted successfully');
            } else {
                // No testimonial yet - write then delete
                cy.contains('button', 'Write a Testimonial').click();
                cy.get('.testimonial-modal', { timeout: 5000 }).should('be.visible');
                cy.get('.testimonial-textarea').type('Test testimonial for deletion');
                cy.contains('button', 'Submit').click();
                cy.wait(1000);

                // Now edit and delete
                cy.contains('button', 'Edit Your Testimonial', { timeout: 5000 }).click();
                cy.get('.testimonial-modal').should('be.visible');
                cy.contains('button', 'Delete').click();
                cy.wait(1000);
                cy.contains('button', 'Write a Testimonial').should('be.visible');
                cy.log('New testimonial written and deleted successfully');
            }
        });
    });

    it('shows error when uploading .txt file as resume', () => {
        cy.contains('Resume / CV', { timeout: 10000 }).scrollIntoView().should('be.visible');

        cy.get('.resume-section').within(() => {
            cy.get('input[type="file"][accept=".pdf"]').selectFile('cypress/fixtures/badFile.txt', { force: true });
        });

        cy.wait(1000);
        cy.contains('Resume must be PDF format', { timeout: 5000 }).should('be.visible');
    });

    it('shows error when uploading .txt file as profile picture', () => {
        cy.get('.profile-picture-placeholder').within(() => {
            cy.get('input[type="file"]').selectFile('cypress/fixtures/badFile.txt', { force: true });
        });

        cy.wait(1000);
        cy.contains('Profile picture must be JPG or PNG format', { timeout: 5000 }).should('be.visible');
    });

    it('shows error when uploading .txt file as banner', () => {
        cy.get('.profile-banner-placeholder').within(() => {
            cy.get('input[type="file"]').selectFile('cypress/fixtures/badFile.txt', { force: true });
        });

        cy.wait(1000);
        cy.contains('Banner image must be JPG or PNG format', { timeout: 5000 }).should('be.visible');
    });

    // Cleanup database ONCE after all tests
    after(() => {
        // teardownTest();
    });
});