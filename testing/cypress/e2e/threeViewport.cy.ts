import { auth0Login, setupTest, teardownTest, test3DViewportOrbitControls, createQuestion, test3DViewportOrthoPerspToggle, goToAskQuestion, goToCommunities, viewCommunityCard, verifyNewGalleryPost, createNewGalleryPost} from '../support/helpers';

import '../support/auth0'

describe('Cypress tests for Three Viewport controls', function () {
    beforeEach(() => {
        setupTest();
        auth0Login();
    });

    afterEach(() => {
        teardownTest();
    });

    // Variables for test
    const testUser = 'user123'

    // Orbit controls: rotation, panning, tilting, zooming
    // Projection toggling: perspective/orthogonal toggling
    it('Three Viewport in Gallery Page supports orbit controls and projection toggling', function () {
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

    // Orbit controls: rotation, panning, tilting, zooming
    // Projection toggling: perspective/orthogonal toggling
    it('Three Viewport in Question Page supports orbit controls and projection toggling', function () {
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

    it('Three Viewport in QuestionPage supports hyperlink clicking', function () {
        const title = "Test Question With Camera Ref"
        const description = "Look at this: "
        const tags = "react";
        const media = 'Avocado.glb'

        goToAskQuestion();
        cy.get('#title').type(title);
        cy.get('#text').type(description);
        cy.get('#tags').type(tags);
    
        cy.get('.file-upload').click()
            cy.get('input[type="file"]').should('exist')
                .selectFile(`cypress/fixtures/${media}`, { force: true });

        cy.wait(3000);

        cy.get('#question-camref-link').should('not.exist');

        test3DViewportOrbitControls()
        cy.get('#cameraRefButton').click()
        cy.get('#text')
            .should('contain.text', '#camera');

        cy.get('.submit-btn').click();

        cy.contains(title).click()

        cy.wait(3000);

        cy.get('.bluebtn.ansButton').click()

        cy.get('#answerTextInput').type("I really like this!")
        
        cy.contains('Add Camera Reference').should('not.exist');
        cy.contains('Post Answer').click()

        test3DViewportOrbitControls()

        cy.get('.bluebtn.ansButton').click()

        cy.get('#answerTextInput').type("Check this angle - ")
        cy.contains('Add Camera Reference').click()
        cy.get('#answerTextInput')
            .should('contain.text', '#camera');
        cy.contains('Post Answer').click()
        cy.wait(3000);
        cy.get('#answer-camref-link').should('exist').click();
        cy.wait(3000);
        cy.get('#question-camref-link').should('exist').click();
        
    });

    it('Three Viewport in Gallery Page correctly displays model information', function () {
        goToCommunities();
        viewCommunityCard('React Enthusiasts');
        cy.get('.gallery-upload-button').click()

        // Fill form to create a new gallery post
        const title = "Test gallery post with cube"
        const description = "This is a test gallery post with cube"
        const tags = ['3d art']
        const mediaFile = 'cube.glb'
        const thumbailMediaFile = 'testThumbnail.jpg'

        createNewGalleryPost(title, description, tags, mediaFile, undefined, thumbailMediaFile)

        // Verify the new gallery post exists
        verifyNewGalleryPost(title, testUser, description, tags, mediaFile, undefined, thumbailMediaFile)
        cy.get('.mediaWrapper').should('exist');
        cy.get('.viewport-card').should('exist');
        cy.get('.viewport-canvas').should('exist'); 

        cy.contains('Vertices: 8')
        cy.contains('Edges: 18')
        cy.contains('Faces: 12')
    });

    it('Three Viewport in Question Page correctly displays model information', function () {
        const title = "Test Question 1"
        const description = "Test Question Description 1"
        const tags = "react";
        const media = 'cube.glb'

        createQuestion(title, description, tags, media)

        cy.contains(title).click()
        
        cy.get('.viewport-card').should('exist');
        cy.get('.viewport-canvas').should('exist'); 

        cy.contains('Vertices: 8')
        cy.contains('Edges: 18')
        cy.contains('Faces: 12')
    });

})