import { auth0Login, setupTest, teardownTest, goToCommunities, viewCommunityCard, createNewGalleryPost, verifyNewGalleryPost} from '../support/helpers';

import '../support/auth0'
import { unescape } from 'cypress/types/lodash';

describe('Cypress tests for Creating a New Gallery Post', function () {
    beforeEach(() => {
        setupTest();
        auth0Login();
    });

    afterEach(() => {
        teardownTest();
    });

    // Variables for test
    const testUser = 'user234'

    /*it('Creates a new gallery post with image media successfully', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with image media"
        const description = "This is a test gallery post with image media"
        const tags = ['3d art', 'modeling']
        const link = 'https://www.youtube.com/watch?v=N88g_IGGHRg'
        const mediaFile = 'testImage.jpg'
        createNewGalleryPost(title, description, tags, mediaFile, link)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, mediaFile, link, undefined)
    })

    
    it('Creates a new gallery post with video media successfully', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with video media"
        const description = "This is a test gallery post with video media"
        const tags = ['3d art']
        const mediaFile = 'testVideo.mp4'
        createNewGalleryPost(title, description, tags, mediaFile, undefined, undefined)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, mediaFile, undefined, undefined)
    });

    it('Creates a new gallery post with 3D media successfully', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with 3D media"
        const description = "This is a test gallery post with 3D media"
        const tags = ['3d art']
        const mediaFile = 'test3DModel.glb'
        const thumbailMediaFile = 'testImage.jpg'

        createNewGalleryPost(title, description, tags, mediaFile, undefined, thumbailMediaFile)

        // Verify the new gallery post exists
        cy.get('.galleryGrid.carouselPage .galleryCard')
            .last()
            .click();
        cy.get('.postInfo').should('exist')
            .contains('Test gallery post with 3D media')
        cy.get('.usernameLink').contains('user234')
        cy.get('.postDescription').contains('This is a test gallery post with 3D media')
        cy.contains('.tagChip', '3d Art').should('exist');
        cy.get('.mediaWrapper').should('exist');
        cy.get('.viewport-card').should('exist');
        cy.get('.viewport-canvas').should('exist'); 
    });*/

    it('Creates a new gallery post with YouTube embed successfully', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with YouTube embed"
        const description = "This is a test gallery post with YouTube embed"
        const tags = ['3d art']
        const media = 'https://www.youtube.com/watch?v=XUwzASyHr4Q'
        const embeddedMedia = 'https://www.youtube.com/embed/XUwzASyHr4Q'

        createNewGalleryPost(title, description, tags, media, undefined, undefined)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, embeddedMedia, undefined, undefined)
    });

    it('Creates a new gallery post with a Vimeo embed successfully', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with Vimeo embed"
        const description = "This is a test gallery post with Vimeo embed"
        const tags = ['3d art']
        const media = 'https://vimeo.com/49384334'
        const embeddedMedia = 'https://vimeo.com/49384334'

        createNewGalleryPost(title, description, tags, media, undefined, undefined)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, embeddedMedia, undefined, undefined)
    });
})

// previews!! - need to fix related bugs
// creating new gallery post 
// error messages if params not entered
// supports embeds
// supports png, video, url, and .glb
// error messages for invalid input
// check for other errors
// error if thumbnail not uploaded for glb
// check thumbnail media in gallery component