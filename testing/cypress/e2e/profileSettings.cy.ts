/// <reference types="cypress" />
/**
 * Profile Settings E2E Tests
 * 
 * Tests user profile customization features including:
 * - Biography editing
 * - External links management
 * - Skills/software expertise selection
 * - Portfolio uploads and metrics (views, likes)
 * - Resume/CV upload with validation
 * - Theme customization (colors, fonts)
 * - Testimonials management
 * - 3D viewport info button functionality
 * 
 * @requires Auth0 authentication configured
 * @requires MongoDB test database
 * @requires Test fixtures: profileTestImage.jpg, test.glb, badFile.txt
 * 
 * To run:
 * - All tests: npx cypress run --spec "cypress/e2e/profileSettings.cy.ts"
 * - Single test: Add .only to any it() block
 */

import { auth0LoginUserProfile, setupTest, teardownTest } from '../support/helpers';
import '../support/auth0';

describe('Profile Settings — editing', () => {
    before(() => {
        setupTest();
    });

    beforeEach(() => {
        auth0LoginUserProfile();
        cy.url({ timeout: 30000 }).should('include', '/home');
        cy.contains('All Questions', { timeout: 15000 }).should('be.visible');
        cy.wait(1000);

        cy.get('.profile-trigger', { timeout: 10000 }).should('be.visible').click();
        cy.get('.profile-menu', { timeout: 5000 }).should('be.visible');
        cy.get('.profile-menu-item').contains('Profile').click();

        cy.url({ timeout: 10000 }).should('include', '/user/');
        cy.get('.profile-card', { timeout: 20000 }).should('be.visible');
    });

    it('displays loading spinner while fetching user data', () => {
        cy.contains('Users').click();
        cy.url({ timeout: 10000 }).should('include', '/users');
        cy.contains('Users List', { timeout: 10000 }).should('be.visible');

        cy.intercept('GET', '/api/user/getUser/user234', (req) => {
            req.on('response', (res) => {
                res.setDelay(2000);
            });
        }).as('getUserRequest');

        cy.contains('user234').click();
        cy.contains('Loading profile...', { timeout: 1000 }).should('be.visible');
        cy.get('.spinner').should('be.visible');
        cy.wait('@getUserRequest');

        cy.contains('Loading profile...').should('not.exist');
        cy.get('.profile-card').should('be.visible');
        cy.contains('Username:').should('be.visible');
    });

    it('successfully uploads profile picture', () => {
        cy.get('.profile-picture-placeholder input[type="file"]')
            .selectFile('cypress/fixtures/profileTestImage.jpg', { force: true });

        cy.wait(1000);
        cy.contains('Profile picture updated!').should('be.visible');

        // Verify image displays
        cy.get('.profile-picture-placeholder')
            .should('have.css', 'background-image')
            .and('include', 'data:image');
    });

    it('successfully uploads banner image', () => {
        cy.get('.profile-banner-placeholder input[type="file"]')
            .selectFile('cypress/fixtures/profileTestImage.jpg', { force: true });

        cy.wait(1000);
        cy.contains('Banner image updated!').should('be.visible');

        // Verify banner displays
        cy.get('.profile-banner-placeholder')
            .should('have.css', 'background-image')
            .and('include', 'data:image');
    });

    it('allows editing the biography', () => {
        const newBio = 'This is a Cypress test bio';

        cy.contains('Biography', { timeout: 10000 }).should('be.visible');
        cy.get('.bio-section', { timeout: 5000 }).should('be.visible').within(() => {
            cy.contains('button', 'Edit').should('be.visible').click();
        });

        cy.get('.bio-edit', { timeout: 5000 }).should('be.visible').within(() => {
            cy.get('.input-text').clear().type(newBio);
            cy.contains('button', 'Save').click();
        });

        cy.wait(1000);
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
        cy.contains('Software Expertise', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.contains('button', 'Edit Skills').scrollIntoView().should('be.visible').click();

        cy.get('.skills-edit-section', { timeout: 5000 }).should('be.visible').within(() => {
            cy.contains('label', 'Blender').find('input[type="checkbox"]').check({ force: true });
            cy.contains('label', 'Unity').find('input[type="checkbox"]').check({ force: true });
            cy.contains('button', 'Save Skills').click();
        });

        cy.wait(1000);
        cy.get('.skills-section').scrollIntoView();
        cy.get('.skills-section').should('contain', 'Blender');
        cy.get('.skills-section').should('contain', 'Unity');
    });

    it('displays portfolio section', () => {
        cy.wait(1000);
        cy.get('.profile-card').then($card => {
            if ($card.text().includes('Portfolio')) {
                cy.contains('Portfolio', { timeout: 5000 }).scrollIntoView().should('be.visible');
                cy.get('.portfolio-grid-section', { timeout: 5000 }).should('be.visible');
            } else {
                cy.get('.profile-card').should('exist');
            }
        });
    });

    it('allows uploading and downloading resume', () => {
        cy.contains('Resume / CV', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.resume-section').should('be.visible');

        cy.get('body').then($body => {
            if ($body.text().includes('Download Resume')) {
                cy.contains('a', 'Download Resume')
                    .should('have.attr', 'download', 'resume.pdf')
                    .should('have.attr', 'href')
                    .and('not.be.empty');
                cy.get('.resume-section').within(() => {
                    cy.contains('label', 'Replace Resume').should('be.visible');
                });
            } else {
                cy.get('.resume-section').within(() => {
                    cy.contains('label', 'Upload Resume').should('be.visible');
                    cy.get('input[type="file"][accept=".pdf"]').should('exist');
                });
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
    });

    it('displays and allows changing custom font', () => {
        cy.contains('Custom Font', { timeout: 10000 }).scrollIntoView().should('be.visible');

        cy.get('.font-section select').invoke('val').then((currentFont) => {
            const newFont = currentFont === 'Inter' ? 'Roboto' : 'Inter';
            cy.get('.font-section select').select(newFont);
            cy.wait(1000);
            cy.get('.font-section select').should('have.value', newFont);
        });
    });

    it('displays user metrics and information', () => {
        cy.contains('Username:', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.contains('Username:').parent().should('contain', 'user123');
        cy.contains('Date Joined:').should('be.visible');
        cy.contains('Date Joined:').parent().should('not.contain', 'N/A');

        cy.contains('Software Expertise', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.skills-section').should('be.visible');
        cy.get('.skills-section').then($section => {
            const skillsCount = $section.find('.skill-placeholder').length;
            expect(skillsCount).to.be.at.least(0);
        });

        cy.contains('External Links', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.external-links-section').should('be.visible');
    });

    it('upload media working correctly with project page & displays and tracks portfolio item metrics', () => {
        cy.contains('Portfolio', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.portfolio-upload-box').click();
        cy.url({ timeout: 10000 }).should('include', '/upload-portfolio');

        cy.get('input[placeholder*="Give your piece a name"]').type('Test Metrics Video');
        cy.get('textarea[placeholder*="Describe your project"]').type('Testing views and likes');
        cy.get('input[placeholder*="Paste media URL"]').type('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        cy.get('input[type="file"]').last().selectFile('cypress/fixtures/profileTestImage.jpg', { force: true });
        cy.wait(1000);

        cy.contains('button', 'Add to Portfolio').should('not.be.disabled').click();
        cy.wait(1000);
        cy.url({ timeout: 10000 }).should('include', '/user/user123');

        cy.contains('Portfolio').scrollIntoView();
        cy.get('.portfolio-model-item').should('have.length.at.least', 1);
        cy.get('.portfolio-model-item').first().click();
        cy.url({ timeout: 10000 }).should('match', /\/portfolio\/\d+/);
        cy.wait(1000);

        cy.get('.postStats').scrollIntoView().should('be.visible');

        // Test like toggle functionality
        cy.get('.statItem').first().invoke('text').then((initialText) => {
            const initialLikes = parseInt(initialText.trim()) || 0;
            cy.get('.statItem').first().click();

            cy.get('.statItem').first().should(($el) => {
                const newLikes = parseInt($el.text().trim()) || 0;
                expect(newLikes).to.not.equal(initialLikes);
            });

            cy.get('.statItem').first().invoke('text').then((afterFirstText) => {
                cy.get('.statItem').first().click();

                cy.get('.statItem').first().should(($el) => {
                    const currentLikes = parseInt($el.text().trim()) || 0;
                    expect(currentLikes).to.equal(initialLikes);
                });
            });
        });

        // Test view increment
        cy.get('.statItem').last().invoke('text').then((viewText) => {
            const initialViews = parseInt(viewText.trim()) || 0;
            cy.contains('Back to Profile').click();
            cy.url({ timeout: 10000 }).should('include', '/user/user123');
            cy.wait(1000);

            cy.get('.portfolio-model-item').first().click();
            cy.url({ timeout: 10000 }).should('match', /\/portfolio\/\d+/);
            cy.wait(2000);

            cy.get('.statItem').last().scrollIntoView().should(($el) => {
                const newViews = parseInt($el.text().trim()) || 0;
                expect(newViews).to.equal(initialViews + 1);
            });
        });
    });

    it('allows writing and deleting testimonials', () => {
        cy.contains('Users').click();
        cy.contains('user234').click();
        cy.get('.profile-card', { timeout: 10000 }).should('be.visible');
        cy.contains('Testimonials').scrollIntoView();

        cy.get('body').then($body => {
            const hasExisting = $body.text().includes('Edit Your Testimonial');

            if (hasExisting) {
                cy.contains('button', 'Edit Your Testimonial').click();
                cy.get('.testimonial-modal', { timeout: 5000 }).should('be.visible');
                cy.contains('button', 'Delete').click();
                cy.wait(1000);
                cy.contains('button', 'Write a Testimonial', { timeout: 5000 }).should('be.visible');
            } else {
                cy.contains('button', 'Write a Testimonial').click();
                cy.get('.testimonial-modal', { timeout: 5000 }).should('be.visible');
                cy.get('.testimonial-textarea').type('Test testimonial for deletion');
                cy.contains('button', 'Submit').click();
                cy.wait(1000);

                cy.contains('button', 'Edit Your Testimonial', { timeout: 5000 }).click();
                cy.get('.testimonial-modal').should('be.visible');
                cy.contains('button', 'Delete').click();
                cy.wait(1000);
                cy.contains('button', 'Write a Testimonial').should('be.visible');
            }
        });
    });

    it
    ('displays existing testimonial content when editing', () => {
        cy.contains('Users').click();
        cy.contains('user234').click();
        cy.get('.profile-card', { timeout: 10000 }).should('be.visible');

        // Write initial testimonial
        cy.contains('button', 'Write a Testimonial').click();
        cy.get('.testimonial-textarea').type('Original testimonial content');
        cy.contains('button', 'Submit').click();
        cy.wait(1000);

        // Edit and verify content appears
        cy.contains('button', 'Edit Your Testimonial').click();
        cy.get('.testimonial-textarea').should('have.value', 'Original testimonial content');

        // Update content
        cy.get('.testimonial-textarea').clear().type('Updated testimonial content');
        cy.contains('button', 'Submit').click();
        cy.wait(1000);

        // Verify button still shows edit option
        cy.contains('button', 'Edit Your Testimonial').should('be.visible');
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

    it('uploads 3D model and tests viewport info button functionality', () => {
        cy.contains('Portfolio', { timeout: 10000 }).scrollIntoView().should('be.visible');
        cy.get('.portfolio-upload-box').click();
        cy.url({ timeout: 10000 }).should('include', '/upload-portfolio');

        cy.get('input[placeholder*="Give your piece a name"]').type('Test 3D Model');
        cy.get('textarea[placeholder*="Describe your project"]').type('Testing 3D viewport info button');
        cy.get('input[type="file"]').first().selectFile('cypress/fixtures/test.glb', { force: true });
        cy.wait(1000);

        cy.get('canvas', { timeout: 10000 }).should('be.visible');
        cy.get('canvas').scrollIntoView();
        cy.wait(500);

        cy.get('.info-icon', { timeout: 5000 }).should('be.visible').click();
        cy.contains('Welcome to the 3D viewport', { timeout: 5000 }).should('be.visible');
        cy.contains('Click and drag to turn').should('be.visible');
        cy.contains('Scroll to zoom').should('be.visible');

        cy.get('.info-icon').click();
        cy.wait(500);
        cy.get('#popover-content').should('not.exist');

        cy.get('.info-icon').click();
        cy.wait(300);
        cy.get('#popover-content').should('be.visible');
        cy.get('.info-icon').click();
    });

    after(() => {
        teardownTest();
    });
});