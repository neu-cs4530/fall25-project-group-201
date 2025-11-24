import { auth0Login, setupTest, teardownTest, goToCommunities, viewCommunityCard, createNewGalleryPost, verifyNewGalleryPost, test3DViewport} from '../support/helpers';

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

        test3DViewport()
    });

})

// - /new/question, /question/:qid, commentSection, 
// gallery:postId, new/galleryPost/:communityID, /user/:username/portfolio/:index, 