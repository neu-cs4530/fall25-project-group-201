import {
  loginUser,
  createQuestion,
  openCreatedQuestion,
  verifyCommentBlock,
  setupTest,
  teardownTest
} from "../support/helpers";
import "cypress-file-upload";

describe("Cypress Tests to verify adding new comments under a question", () => {
  beforeEach(() => {
    setupTest();

    loginUser("user123");

    createQuestion(
      "Test Question",
      "Test Question Text",
      "javascript"
    );

    cy.contains("Test Question");
    openCreatedQuestion("Test Question");

    cy.contains("Show Comments").click();
    cy.get(".comment-section").should("be.visible");
  });
  
  afterEach(() => {
    teardownTest();
  });

  it("1 | Posts a text-only comment", () => {
    cy.get(".comment-textarea").type("This is a text-only test comment");
    cy.contains("Post").click();

    verifyCommentBlock({
      index: 0,
      expected: {
        text: "This is a text-only test comment",
        username: "user123",
      }
    });
  });

  it("2 | Shows an error when posting an empty comment", () => {
    cy.contains("Post").click();
    cy.contains("Comment text cannot be empty").should("be.visible");
  });

  it("3 | Embeds a YouTube video", () => {
    cy.get(".media-button").click();
    cy.get(".comment-media-input").type("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    cy.get(".comment-textarea").type("YouTube embed");
    cy.contains("Post").click();

    verifyCommentBlock({
      index: 0,
      expected: {
        text: "YouTube embed",
        username: "user123",
        mediaType: "video",
        mediaUrl: "dQw4w9WgXcQ"
      }
    });
  });

  it("4 | Embeds a Vimeo video", () => {
    cy.get(".media-button").click();
    cy.get(".comment-media-input").type("https://vimeo.com/123456789");

    cy.get(".comment-textarea").type("Vimeo embed");
    cy.contains("Post").click();

    verifyCommentBlock({
      index: 0,
      expected: {
        text: "Vimeo embed",
        username: "user123",
        mediaType: "video",
        mediaUrl: "123456789"
      }
    });
  });

  it("5 | Rejects an invalid media URL", () => {
    cy.get(".media-button").click();
    cy.get(".comment-media-input").type("not-a-real-media-url");

    cy.get(".comment-textarea").type("Invalid media test");
    cy.contains("Post").click();

    cy.contains("Media URL is invalid").should("be.visible");
  });

  it("6 | Uploads an image file", () => {
    cy.get("input[type='file']").selectFile("cypress/fixtures/example.png");

    cy.get(".comment-textarea").type("Uploaded image");
    cy.contains("Post").click();

    verifyCommentBlock({
      index: 0,
      expected: {
        text: "Uploaded image",
        username: "user123",
        mediaType: "image",
        mediaUrl: "example.png"
      }
    });
  });

  it("7 | Uploads a video file", () => {
    cy.get("input[type='file']").selectFile("cypress/fixtures/example.mp4");

    cy.get(".comment-textarea").type("Uploaded video");
    cy.contains("Post").click();

    verifyCommentBlock({
      index: 0,
      expected: {
        text: "Uploaded video",
        username: "user123",
        mediaType: "video",
        mediaUrl: "example.mp4"
      }
    });
  });

  it("8 | Uploads a .glb 3D model", () => {
    cy.get("input[type='file']").selectFile("cypress/fixtures/example.glb");

    cy.get(".comment-textarea").type("3D model upload");
    cy.contains("Post").click();

    verifyCommentBlock({
      index: 0,
      expected: {
        text: "3D model upload",
        username: "user123",
        mediaType: "model",
        mediaUrl: "example.glb"
      }
    });
  });

  it("9 | Removes media URL or file when clicking ✕ Remove Media", () => {
    cy.get(".media-button").click();
    cy.get(".comment-media-input").type("https://example.com/test-img.png");

    cy.contains("✕ Remove Media").click();

    cy.get(".comment-media-input").should("have.value", "");
  });
});
