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
})

// delete gallery post
// any errors
// should not be able to delete another person's psot
// navigation
// other errors