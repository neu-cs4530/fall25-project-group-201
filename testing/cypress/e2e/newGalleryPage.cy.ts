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

    it('Creates a new gallery post with image media successfully', function () {
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

    it('Error message shown if no title entered in gallery post form', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const description = "This is a test gallery post with image media"
        const tags = ['3d art', 'modeling']
        const link = 'https://www.youtube.com/watch?v=N88g_IGGHRg'
        const mediaFile = 'testImage.jpg'
        createNewGalleryPost(undefined, description, tags, mediaFile, link, undefined)

        cy.get('.error').contains('Project title cannot be empty')
    })

    it('Error message shown if title > 100 characters in gallery post form', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr"
        const description = "Gallery post with long title"
        const tags = ['3d art', 'modeling']
        const link = 'https://www.youtube.com/watch?v=N88g_IGGHRg'
        const mediaFile = 'testImage.jpg'
        createNewGalleryPost(title, description, tags, mediaFile, link, undefined)

        cy.get('.error').contains('Title cannot be more than 100 characters')
    })

    it('Shows error if communityID is undefined when posting', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click();

        const title = "Valid title";
        const description = "Testing undefined community";
        const tags = ['3d art'];
        const link = '';
        const mediaFile = 'testImage.jpg';

        // Intercept the POST request and simulate a server error
        cy.intercept('POST', '/api/gallery/create', (req) => {
            // Simulate backend error due to missing communityID
            req.reply({
            statusCode: 400,
            body: { 
                title: title,
                description: description,
                user: testUser,
                media: mediaFile,
                postedAt: new Date(),
                views: 0,
                downloads: 0,
                likes: [],
            },
            });
        }).as('addGalleryPost');

        createNewGalleryPost(title, description, tags, mediaFile, link, undefined);

        cy.wait('@addGalleryPost');

        cy.get('.error').contains('Failed to post gallery post');
    });

    it('Error message shown if no description entered in gallery post form', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with image media"
        const tags = ['3d art', 'modeling']
        const link = 'https://www.youtube.com/watch?v=N88g_IGGHRg'
        const mediaFile = 'testImage.jpg'
        createNewGalleryPost(title, undefined, tags, mediaFile, link, undefined)

        cy.get('.error').contains('Project description cannot be empty')
    })

    it('Error message shown if no media entered in gallery post form', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with image media"
        const description = "This is a test gallery post with image media"
        const tags = ['3d art', 'modeling']
        const link = 'https://www.youtube.com/watch?v=N88g_IGGHRg'
        createNewGalleryPost(title, description, tags, undefined, link, undefined)

        cy.get('.error').contains('Media file or link must be uploaded')
    })

    it('Error message shown if .glb file selected and no thumbnail media selected in gallery post form', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with image media"
        const description = "This is a test gallery post with image media"
        const tags = ['3d art', 'modeling']
        const link = 'https://www.youtube.com/watch?v=N88g_IGGHRg'
        const mediaFile = 'test3DModel.glb'
        createNewGalleryPost(title, description, tags, mediaFile, link), undefined

        cy.get('.error').contains('You must upload a thumbnail for 3D models')
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
        const thumbailMediaFile = 'testThumbnail.jpg'

        createNewGalleryPost(title, description, tags, mediaFile, undefined, thumbailMediaFile)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, mediaFile, undefined, thumbailMediaFile)
        cy.get('.mediaWrapper').should('exist');
        cy.get('.viewport-card').should('exist');
        cy.get('.viewport-canvas').should('exist'); 
    });

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

        createNewGalleryPost(title, description, tags, media, undefined, undefined, embeddedMedia)

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
        const embeddedMedia = 'https://player.vimeo.com/video/49384334'

        createNewGalleryPost(title, description, tags, media, undefined, undefined, embeddedMedia)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, embeddedMedia, undefined, undefined)
    });

    it('Creates a new gallery post with an image embed successfully', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with image embed"
        const description = "This is a test gallery post with image embed"
        const tags = ['3d art']
        const media = 'https://i0.wp.com/getmimo.wpcomstaging.com/wp-content/uploads/2024/06/react_header.png?fit=1920%2C1080&ssl=1'
        const embeddedMedia = 'https://i0.wp.com/getmimo.wpcomstaging.com/wp-content/uploads/2024/06/react_header.png?fit=1920%2C1080&ssl=1'

        createNewGalleryPost(title, description, tags, media, undefined, undefined, embeddedMedia)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, embeddedMedia, undefined, undefined)
    });
})