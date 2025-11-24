import { auth0Login, setupTest, teardownTest, goToCommunities, viewCommunityCard, createNewGalleryPost, verifyNewGalleryPost} from '../support/helpers';

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

    it('Three Viewport supports rotation of model', function () {
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

        cy.get('.viewport-canvas canvas')
            .should('exist');

        // Rotation
        cy.get('.viewport-canvas canvas')
            .trigger('mousedown', { clientX: 100, clientY: 100, button: 0 })
            .trigger('mousemove', { clientX: 200, clientY: 150, button: 0 })
            .trigger('mousemove', { clientX: 250, clientY: 200, button: 0 })
            .trigger('mousemove', { clientX: 300, clientY: 200, button: 0 })
            .trigger('mousemove', { clientX: 400, clientY: 200, button: 0 })
            .trigger('mousemove', { clientX: 300, clientY: 200, button: 0 })
            .trigger('mousemove', { clientX: 50, clientY: 300, button: 0 })
            .trigger('mousemove', { clientX: 5, clientY: 400, button: 0 })
            .trigger('mousemove', { clientX: 100, clientY: 200, button: 0 })
            .trigger('mouseup', { force: true });

        // Panning 
        cy.get('.viewport-canvas').trigger('keydown', { key: 'ArrowUp' });
        cy.wait(150);
        cy.get('.viewport-canvas').trigger('keyup', { key: 'ArrowUp' });
        cy.get('.viewport-canvas').trigger('keydown', { key: 'ArrowDown' });
        cy.wait(200);
        cy.get('.viewport-canvas').trigger('keyup', { key: 'ArrowDown' });
        cy.get('.viewport-canvas').trigger('keydown', { key: 'ArrowLeft' });
        cy.wait(200);
        cy.get('.viewport-canvas').trigger('keyup', { key: 'ArrowLeft' });
        cy.get('.viewport-canvas').trigger('keydown', { key: 'ArrowRight' });
        cy.wait(200);
        cy.get('.viewport-canvas').trigger('keyup', { key: 'ArrowRight' });

        // Tilting 
        cy.get('.viewport-canvas').trigger('keydown', { key: 'w' });
        cy.wait(200);
        cy.get('.viewport-canvas').trigger('keyup', { key: 'w' });
        cy.get('.viewport-canvas').trigger('keydown', { key: 'a' });
        cy.wait(200);
        cy.get('.viewport-canvas').trigger('keyup', { key: 'a' });
        cy.get('.viewport-canvas').trigger('keydown', { key: 's' });
        cy.wait(200);
        cy.get('.viewport-canvas').trigger('keyup', { key: 's' });
        cy.get('.viewport-canvas').trigger('keydown', { key: 'd' });
        cy.wait(200);
        cy.get('.viewport-canvas').trigger('keyup', { key: 'd' });

        // Zooming
        cy.get('canvas').trigger('wheel', { deltaY: -1000 });
        cy.wait(300);
        cy.get('canvas').trigger('wheel', { deltaY: 1000 });
        cy.wait(300);
        cy.get('canvas').trigger('wheel', { deltaY: -1000 });
        cy.wait(300);

    });

})

// - /new/question, /question/:qid, commentSection, 
// gallery:postId, new/galleryPost/:communityID, /user/:username/portfolio/:index, 