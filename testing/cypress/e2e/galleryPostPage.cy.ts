import { auth0Login, setupTest, teardownTest, goToCommunities, viewCommunityCard, createNewGalleryPost, verifyNewGalleryPost, deleteGalleryPostAndVerify} from '../support/helpers';

import '../support/auth0'
import { unescape } from 'cypress/types/lodash';

describe('Cypress tests for deleting a gallery Post', function () {
    beforeEach(() => {
        //setupTest();
        auth0Login();
    });

    afterEach(() => {
        //teardownTest();
    });

    // Variables for test
    const testUser = 'user123'

    it('Creates a new gallery post with image media successfully', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with image media"
        const description = "This is a test gallery post with image media"
        const tags = ['3d art', 'modeling']
        const mediaFile = 'testImage.jpg'
        createNewGalleryPost(title, description, tags, mediaFile, undefined)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, mediaFile, undefined, undefined)

        // Delete the gallery post and verify deletion
        deleteGalleryPostAndVerify();
    })

    it('Shows error message when gallery post fails', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click();

        const title = "Test gallery post with video media";
        const description = "This is a test gallery post with video media";
        const tags = ['3d art', 'modeling'];
        const mediaFile = 'testVideo.mp4';

        createNewGalleryPost(title, description, tags, mediaFile, undefined);
        verifyNewGalleryPost(title, testUser, description, tags, mediaFile, undefined, undefined);

        // Mock media deletion to fail
        cy.intercept({
            method: 'DELETE',
            url: /\/api\/media\/delete\/.*/   // regex matches any path after /delete/
            }, {
            statusCode: 500,
            body: { error: 'Failed to delete media.' },
        }).as('deleteMediaFail');

        // Click delete
        cy.get('.statItem.delete').should('exist').click();

        // Wait for media deletion attempt
        cy.wait('@deleteMediaFail');
        

        // Verify media error is displayed
        cy.contains('Failed to delete media.').should('be.visible');
    });
})
