import { createQuestion, loginUser, setupTest, teardownTest } from '../support/helpers';

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

    cy.contains("11 questions");

    // Wait for the new post to render
    cy.get('.question_author').contains('user123').should('be.visible');
    cy.get('.question_meta').should('contain.text', 'asked');

    // Verify stats for answers and views
    cy.get('.postAnswersViews').each($el => {
      cy.wrap($el).should('be.visible');
    });

    cy.contains("Unanswered").click();
    cy.get(".postTitle").should("have.length", 1);
    cy.contains("1 questions");
  });


  it("2.2 | Ask a Question with empty title shows error", () => {
    loginUser('user123');
    
    cy.contains("Ask a Question").click();

    // Fill in text and tags but leave title empty
    cy.get("#text").type("Test Question 1 Text Q1");
    cy.get("#tags").type("javascript");
    
    cy.get(".submit-btn").click();
    
    // Check for title validation error
    cy.contains("Title cannot be empty");
  });
});
