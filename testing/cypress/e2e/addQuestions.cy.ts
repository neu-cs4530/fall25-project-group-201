import {
  loginUser,
  createQuestion,
  goToAskQuestion,
  openCreatedQuestion,
  setupTest,
  teardownTest,
} from '../support/helpers';
import 'cypress-file-upload';

describe("Cypress Tests to verify asking new questions", () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  it("2.1 | Ask a Question creates and displays expected meta data", () => {
    loginUser('user123');

    createQuestion("Test Question Q1", "Test Question Q1 Text T1", "javascript");

    cy.contains("Test Question Q1");
    openCreatedQuestion("Test Question Q1");

    cy.get('.answer_question_text').should('contain.text', "Test Question Q1 Text T1");
    cy.get('.question_author').should('contain.text', 'user123');
    cy.get('.answer_question_view').should('contain.text', '1');
  });

  it("2.2 | Ask a Question with empty title shows error", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#text").type("Test Question 1 Text Q1");
    cy.get("#tags").type("javascript");

    cy.get(".submit-btn").click();
    cy.contains("Title cannot be empty");
  });

  it("2.2 | Ask a Question with empty description shows error", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#title").type("Test Question Without Description");
    cy.get("#tags").type("javascript");

    cy.get(".submit-btn").click();
    cy.contains("Question text cannot be empty");
  });

  it("2.3 | Ask a Question with empty tags shows error", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#title").type("Test Question Without Tags");
    cy.get("#text").type("This is a test question text.");

    cy.get(".submit-btn").click();
    cy.contains("Should have at least 1 tag");
  });

  it("2.4 | Add YouTube embed URL", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#title").type("Question with YouTube");
    cy.get("#text").type("This question has a YouTube video");
    cy.get("#tags").type("media test");

    cy.get('.media-inputs input[type="text"]').type("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    cy.get('.media-inputs button').contains('Add Embed').click();

    cy.get('.embed-preview iframe')
      .should('have.attr', 'src')
      .and('include', 'youtube.com/embed');

    cy.get('.submit-btn').click();

    openCreatedQuestion("Question with YouTube");

    cy.get('.iframe-wrapper iframe')
      .should('have.attr', 'src')
      .and('include', 'youtube.com/embed');

    cy.get('.question_author').should('contain.text', 'user123');
  });

  it("2.5 | Add Vimeo embed URL", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#title").type("Question with Vimeo");
    cy.get("#text").type("This question has a Vimeo video");
    cy.get("#tags").type("media test");

    cy.get('.media-inputs input[type="text"]').type("https://vimeo.com/76979871");
    cy.get('.media-inputs button').contains('Add Embed').click();

    cy.get('.embed-preview iframe')
      .should('have.attr', 'src')
      .and('include', 'player.vimeo.com');

    cy.get('.submit-btn').click();

    openCreatedQuestion("Question with Vimeo");

    cy.get('.iframe-wrapper iframe')
      .should('have.attr', 'src')
      .and('include', 'player.vimeo.com');

    cy.get('.question_author').contains('user123');
  });

  it("2.6 | Upload image file", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#title").type("Question with Image");
    cy.get("#text").type("This question has an image");
    cy.get("#tags").type("media test");

    cy.get('input[type="file"]').attachFile('example.png');

    cy.get('.uploaded-preview img').should('be.visible');

    cy.get('.submit-btn').click();

    openCreatedQuestion("Question with Image");

    cy.get('.question-media img').should('be.visible');
    cy.get('.question_author').contains('user123');
  });

  it("2.7 | Upload video file", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#title").type("Question with Video");
    cy.get("#text").type("This question has a video");
    cy.get("#tags").type("media test");

    cy.get('input[type="file"]').attachFile('example.mp4');

    cy.get('.uploaded-preview video').should('be.visible');

    cy.get('.submit-btn').click();

    openCreatedQuestion("Question with Video");

    cy.get('video source')
      .should('have.attr', 'src')
      .and('include', '.mp4');

    cy.get('.question_author').contains('user123');
  });

  it("2.8 | Upload 3D .glb file and add camera reference", () => {
    loginUser('user123');
    goToAskQuestion();

    cy.get("#title").type("Question with 3D Model");
    cy.get("#text").type("This question has a GLB 3D model");
    cy.get("#tags").type("media test");

    cy.get('input[type="file"]').attachFile('example.glb');

    cy.get('.model-preview').should('be.visible');
    cy.contains('Add Camera Reference').click();

    cy.get('.submit-btn').click();

    openCreatedQuestion("Question with 3D Model");

    cy.get('.three-wrapper canvas').should('exist');
    cy.get('.question_author').contains('user123');
  });

  it.only("2.9 | Drag & Drop file into media area", () => {
    loginUser('user123');
    goToAskQuestion();

    // Use fixture image file
    cy.fixture('example.png', 'base64').then(fileContent => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/png');
      const file = new File([blob], 'example.png', { type: 'image/png' });

      // Create a DataTransfer object and add the file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      // Trigger dragover and drop events on the drag-drop area
      cy.get('.drag-drop-area')
        .trigger('dragover', { dataTransfer })
        .trigger('drop', { dataTransfer });
    });
  });
});
