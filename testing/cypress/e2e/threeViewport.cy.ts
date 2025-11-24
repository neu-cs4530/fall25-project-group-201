import { auth0Login, setupTest, teardownTest, goToCommunities, viewCommunityCard, createNewGalleryPost, verifyNewGalleryPost, test3DViewportOrbitControls, createQuestion, test3DViewportOrthoPerspToggle} from '../support/helpers';

import '../support/auth0'
import { unescape } from 'cypress/types/lodash';

describe('Cypress tests for Three Viewport controls', function () {
    beforeEach(() => {
        setupTest();
        auth0Login();
    });

    afterEach(() => {
        teardownTest();
    });

    // Variables for test
    const testUser = 'user345'

    it('Three Viewport in Gallery Page supports rotation, panning, tilting, and zooming', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with 3D media"
        const description = "This is a test gallery post with 3D media"
        const tags = ['3d art']
        const mediaFile = 'test3DModel.glb'
        const thumbailMediaFile = 'testThumbnail.jpg'

        createNewGalleryPost(title, description, tags, mediaFile, undefined, thumbailMediaFile)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, mediaFile, undefined, thumbailMediaFile)
        cy.get('.mediaWrapper').should('exist');
        cy.get('.viewport-card').should('exist');
        cy.get('.viewport-canvas').should('exist'); 

        test3DViewportOrbitControls()
        test3DViewportOrthoPerspToggle()
    });

    it('Three Viewport in Question Page supports rotation, panning, tilting, and zooming', function () {
        const title = "Test Question 1"
        const description = "Test Question Description 1"
        const tags = "react";
        const media = 'test3DModel2.glb'

        createQuestion(title, description, tags, media)

        cy.contains(title).click()
        test3DViewportOrbitControls()
        test3DViewportOrthoPerspToggle()
    });

    it('Three Viewport in comment supports rotation, panning, tilting, and zooming', function () {
        const title = "Test Question 1"
        const description = "Test Question Description 1"
        const tags = "react";
        const media = 'test3DModel2.glb'

        createQuestion(title, description, tags, media)

        cy.contains(title).click()

        cy.contains("Show Comments").click();

       // Create a new comment
        cy.get(".comment-textarea").type("Test comment with 3D model");
        cy.get(".media-button").click()
        cy.get('.file-input').click()
        cy.get('input[type="file"]').should('exist')
            .selectFile('cypress/fixtures/test3DModel.glb', { force: true });
        cy.get('.add-comment-button').click()

        // Verify the new comment
        cy.get('.comment-section').should('exist');
        cy.get('.comment-section').within(() => {
            test3DViewportOrbitControls();
            test3DViewportOrthoPerspToggle()
        });
    });

})