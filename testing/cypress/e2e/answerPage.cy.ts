import { auth0Login, setupTest, teardownTest, goToQuestion, goToComments } from '../support/helpers';

import '../support/auth0'

describe('Cypress tests for Answer Page', function () {

    
    beforeEach(() => {
        setupTest();
        auth0Login();
    });
    
    afterEach(() => {
        teardownTest();
    });

    it('Adding comments without media where text is required', function () {
        cy.wait(200);
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        cy.get('#add-comment-button').click()

        // Create a new comment
        cy.get("#comment-textarea").type("Test comment without media");
        cy.get('#add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comments-container').should('exist');
        cy.get('.comments-list').should('exist');
        cy.get('.comment-item').should('exist');
        cy.get('.comment-text').contains("Test comment")
        cy.get('iframe').should('have.attr', 'src', 'https://www.youtube.com/embed/qERgb3pWfu0');
    })

    it('Comments support YouTube embeds', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Create a new comment
        cy.get("#comment-textarea").type("Test comment with YouTube embed");
        cy.get("#media-button").click()
        cy.get("#comment-media-input").type("https://www.youtube.com/watch?v=XUwzASyHr4Q")
        cy.get('#add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comments-container').should('exist');
        cy.get('.comments-list').should('exist');
        cy.get('.comment-item').should('exist');
        cy.get('.comment-text').contains("Test comment with YouTube embed")
        cy.get('iframe').should('have.attr', 'src', 'https://www.youtube.com/embed/qERgb3pWfu0');
    })

    it('Comments support Vimeo embeds', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Create a new comment
        cy.get("#comment-textarea").type("Test comment with Vimeo embed");
        cy.get("#media-button").click()
        cy.get("#comment-media-input").type("https://vimeo.com/49384334")
        cy.get('#add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comments-container').should('exist');
        cy.get('.comments-list').should('exist');
        cy.get('.comment-item').should('exist');
        cy.contains('.comment-text', 'Test comment with Vimeo embed')
        .within(() => {
            cy.get('iframe')
            .should('have.attr', 'src', 'https://player.vimeo.com/video/49384334');
        });
    })

    it('Comments support Image embeds', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Create a new comment
        cy.get("#comment-textarea").type("Test comment with image embed");
        cy.get("#media-button").click()
        cy.get("#comment-media-input").type("https://i0.wp.com/getmimo.wpcomstaging.com/wp-content/uploads/2024/06/react_header.png?fit=1920%2C1080&ssl=1")
        cy.get('#add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comments-container').should('exist');
        cy.get('.comments-list').should('exist');
        cy.get('.comment-item').should('exist');
        cy.get('.comment-text').contains("Test comment with image embed")
        cy.get('.comment-image').should('have.attr', 'src', 'https://miro.medium.com/v2/resize:fit:1400/format:webp/1*dJnQhLO6aY4q3qz9iRlgrw.png');
    })

    it('Error message shown if user tries to embed invalid URL', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Try to create a new comment
        cy.get("#comment-textarea").type("Test comment 2");
        cy.get("#media-button").click()
        cy.get("#comment-media-input").type("https://google.com")
        cy.get('#add-comment-button').click()
        cy.get('.error').contains('Media URL is invalid')
    })

    it('Comments support images', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Create a new comment
        cy.get("#comment-textarea").type("Test comment with image");
        cy.get("#media-button").click()
        cy.get('#file-input').click()
        cy.get('input[type="file"]').should('exist')
            .selectFile('cypress/fixtures/testImage.jpg', { force: true });
        cy.get('#add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comments-container').should('exist');
        cy.get('.comments-list').should('exist');
        cy.get('.comment-item').should('exist');
        cy.get('.comment-text').contains("Test comment with image")
        cy.get('.comment-media').should('have.attr', 'src').and('include', '/userData/user123/');
    })

    it('Comments support mp4 files', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Create a new comment
        cy.get("#comment-textarea").type("Test comment with video");
        cy.get("#media-button").click()
        cy.get('#file-input').click()
        cy.get('input[type="file"]').should('exist')
            .selectFile('cypress/fixtures/testVideo.mp4', { force: true });
        cy.get('#add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comments-container').should('exist');
        cy.get('.comments-list').should('exist');
        cy.get('.comment-item').should('exist');
        cy.get('.comment-text').contains("Test comment with video")
        cy.get('.comment-media').should('have.attr', 'src').and('include', '/userData/user123/');
    })

    it('Comments support .glb files', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Create a new comment
        cy.get("#comment-textarea").type("Test comment with 3D model");
        cy.get("#media-button").click()
        cy.get('#file-input').click()
        cy.get('input[type="file"]').should('exist')
            .selectFile('cypress/fixtures/test3DModel.glb', { force: true });
        cy.get('#add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comments-container').should('exist');
        cy.get('.comments-list').should('exist');
        cy.get('.comment-item').should('exist');
        cy.get('.comment-text').contains("Test comment with 3D model")
        cy.get('.comment-model-wrapper').should('exist');
        cy.get('.viewport-card').should('exist');
        cy.get('.viewport-canvas').should('exist'); 
    })

    it('Error message shown if unsupported media file chosen', function () {
        cy.contains('All Questions')
        goToQuestion('Preventing memory leaks in React applications')
        goToComments();

        // Try to create a new comment
        cy.get("#comment-textarea").type("Test comment with bad file");
        cy.get("#media-button").click()
        cy.get('#file-input').click()
        cy.get('input[type="file"]').should('exist')
            .selectFile('cypress/fixtures/badFormatFile.webp', { force: true });
        cy.get('#add-comment-button').click()
        cy.get('.error').contains('Only .png, .jpeg, .jpg, .mp4, and .glb files are allowed')
        cy.get('.error').contains('Failed to upload media')
    })

    it('If there was an issue adding the media file, an error is shown', function () {
        cy.contains('All Questions');
        goToQuestion('Preventing memory leaks in React applications');
        goToComments();

        cy.get("#comment-textarea").type("Test comment with bad file");

        // Intercept the upload API and return a "bad" response
        cy.intercept('POST', '/api/media/create', {
            statusCode: 200,
            body: {}
        }).as('uploadMedia');

        // Select the file normally
        cy.get('input[type="file"]').should('exist')
            .selectFile('cypress/fixtures/testVideo.mp4', { force: true });

        cy.get('#add-comment-button').click();

        // Assert that the error message is shown
        cy.contains('Filepath location of media is undefined').should('be.visible');
    });

})