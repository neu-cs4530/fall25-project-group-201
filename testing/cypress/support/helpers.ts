import "../support/auth0"

/**
 * Test utility functions for Cypress tests
 * Provides shared helper functions for common test patterns like authentication, navigation, and data setup
 */

/**
 * Logs in a user by visiting the login page and entering credentials
 * @param username - The username to log in with
 * @param password - The password to log in with (defaults to 'password123')
 */
export const loginUser = (username: string, password: string = 'securePass123!') => {
  cy.visit('http://localhost:4530');
  cy.visit('/')
  cy.contains('button', 'Log In or Sign Up').click()

  cy.origin('https://dev-yipqv2u1k7drpppn.us.auth0.com', () => {
      // Fill in the login form
      cy.get('input[name="username"], input[name="email"]').type('user123')
      cy.get('input[name="password"]').type('securePass123!', { log: false }) // hide in logs
      cy.get('button[type="submit"]:visible').click()
  })
};

/**
 * Seeds the database with test data
 */
export const seedDatabase = () => {
  cy.exec('npx ts-node ../server/seedData/populateDB.ts ' + Cypress.env('MONGODB_URI'));
};

/**
 * Clears the database
 */
export const cleanDatabase = () => {
  cy.exec('npx ts-node ../server/seedData/deleteDB.ts ' + Cypress.env('MONGODB_URI'));
};

export const auth0Login = () => {
  cy.visit('/')
  cy.contains('button', 'Log In or Sign Up').click()

  cy.origin('https://dev-yipqv2u1k7drpppn.us.auth0.com', () => {
      // Fill in the login form
      cy.get('input[name="username"], input[name="email"]').type('user123')
      cy.get('input[name="password"]').type('securePass123!', { log: false }) // hide in logs
      cy.get('button[type="submit"]:visible').click()
  })
}

export const createNewGalleryPost = (
  title?: string,
  description?: string,
  tags?: string[],
  media?: string,
  link?: string,
  thumbailMediaFile?: string,
  embeddedMedia?: string
) => {
  if (title) {
    cy.get("#title").type(title);
  }
  
  if (description) {
    cy.get("#text-project-description").type(description);
  }
  

  if (tags) {
    tags.forEach(tag => {
      cy.contains('label.tag-checkbox', tag).click();
    });
  }
  
  if (link) {
    cy.get('#projectLink').type(link);
  }

  if (media) {
    const fileExts = ['.png', '.jpg', '.jpeg', '.mp4', '.mov', '.glb'];
    if (fileExts.some(ext => media.endsWith(ext))) {
      cy.get('.file-upload').click()
      cy.get('input[type="file"]').should('exist')
          .selectFile(`cypress/fixtures/${media}`, { force: true });
    }

    if (media.endsWith('.glb')) {
      cy.get('.model-preview').contains("3D Model Preview")
      cy.get('.viewport-card').should('exist');
      cy.get('.viewport-canvas').should('exist'); 
    }

    if (thumbailMediaFile) {
      cy.get('[data-cy="thumbnail-file"]').click()
      cy.get('[data-cy="thumbnail-file"] input[type="file"]')
        .should('exist')
        .selectFile(`cypress/fixtures/${thumbailMediaFile}`, { force: true });
    }

    const isEmbed = /^https?:\/\//i.test(media);
    if (isEmbed) {
      cy.get("#embed-text").type(`${media}`)

      cy.get('.embed-preview').contains('Preview')

      if (/youtube\.com|youtu\.be|vimeo\.com/i.test(media)) {
        cy.get('iframe')
          .should('have.attr', 'src', `${embeddedMedia}`);
      } 
      // Check for image embeds
      else if (/\.(jpg|jpeg|png)$/i.test(media)) {
        cy.get('.postMedia').should('have.attr', 'src', `${embeddedMedia}`);
      } 

    }
  }

  cy.get('.submit-btn').click()
};

export const verifyNewGalleryPost = (
  title: string,
  user: string,
  description: string,
  tags: string[],
  media: string,
  link?: string,
  thumbailMediaFile?: string
) => {
  const dataCy = `gallery-card-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  cy.get(`[data-cy="${dataCy}"]`, { timeout: 10000 })
    .should('exist')
    .click();
  cy.get('.postInfo').should('exist')
      .contains(title)
  cy.get('.usernameLink').contains(user)
    cy.get('.postDescription').contains(description)
    cy.get('.mediaWrapper').should('exist')
  tags.forEach(tag => {
    cy.contains('.tagChip', '3d Art').should('exist');
  });

  const isEmbed = /^https?:\/\//i.test(media);
  if (isEmbed) {
    if (/youtube\.com|youtu\.be|vimeo\.com/i.test(media)) {
      cy.get('iframe')
        .should('have.attr', 'src', `${media}`);
    } 
    // Check for image embeds
    else if (/\.(jpg|jpeg|png)$/i.test(media)) {
      cy.get('.postMedia').should('have.attr', 'src', `${media}`);
    } 
  }
  else {
    const imgExts = ['.png', '.jpg', '.jpeg'];
    if (imgExts.some(ext => media.endsWith(ext))) {
      cy.get('.postMedia').should('have.attr', 'src', `/userData/${user}/${media}`);
    }

    const vidExts = ['.mov', '.mp4'];
    if (vidExts.some(ext => media.endsWith(ext))) {
      cy.get('.postMedia').should('have.attr', 'src', `/userData/${user}/${media}`);
    }

    if (media.endsWith('.glb')) {
      cy.get('.viewport-card').should('exist');
      cy.get('.viewport-canvas').should('exist'); 
    }

    if (link) {
      cy.window().then(win => {
          cy.spy(win, 'open').as('winOpen');
      });

      cy.get('.viewProjectBtn').click();
      cy.get('@winOpen').should('have.been.calledOnce');
    }
  }
};

export const deleteGalleryPostAndVerify = (
) => {
  cy.get('.statItem.delete').should('exist').click()
  cy.contains('No gallery posts yet!')
};

/**
 * Sets up the database before each test
 */
export const setupTest = () => {
  cleanDatabase();
  seedDatabase();
};

/**
 * Cleans up the database after each test
 */
export const teardownTest = () => {
  cleanDatabase();
};

/**
 * Auth0 login specifically for profile settings tests
 * Has longer waits and better error handling for profile page navigation
 */
export const auth0LoginUserProfile = () => {
  cy.visit('/', { timeout: 30000 })
  cy.contains('button', 'Log In or Sign Up', { timeout: 10000 }).click()

  cy.origin('https://dev-yipqv2u1k7drpppn.us.auth0.com', () => {
    // Wait for the login page to fully load
    cy.get('input[name="username"], input[name="email"]', { timeout: 15000 }).should('be.visible')
    
    // Fill in the login form
    cy.get('input[name="username"], input[name="email"]').clear().type('user123')
    cy.get('input[name="password"]').clear().type('securePass123!', { log: false })
    
    // Click submit and wait for redirect
    cy.get('button[type="submit"]:visible').click()
    
    // Give Auth0 time to process - avoid rate limiting
    cy.wait(2000)
  })
  
  // Wait for redirect back to our app with longer timeout
  cy.url({ timeout: 30000 }).should('include', 'localhost:4530')
}

/**
 * Navigates to the Ask Question page
 */
export const goToAskQuestion = () => {
  cy.contains('Ask a Question').click();
  cy.url().should('include', '/new/question');
};

/**
 * Creates a new question with the provided details
 * @param title - Question title
 * @param text - Question content
 * @param tags - Space-separated tags
 */
export const createQuestion = (title: string, text: string, tags: string, media?: string) => {
  goToAskQuestion();
  cy.get('#title').type(title);
  cy.get('#text').type(text);
  cy.get('#tags').type(tags);

  if (media) {
    cy.get('.file-upload').click()
        cy.get('input[type="file"]').should('exist')
            .selectFile(`cypress/fixtures/${media}`, { force: true });
  }

  cy.wait(3000);

  cy.get('.submit-btn').click();
};

export const test3DViewportOrbitControls = () => {
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
};

export const test3DViewportOrthoPerspToggle = () => {
  cy.get('.viewport-canvas').should('exist')
  cy.get('img[alt="Toggle View"]').as('toggleButton')
  cy.get('@toggleButton').should('have.attr', 'src').and('match', /perspIcon\.png$/);

  // Toggle to perspective
  cy.get('@toggleButton').click()
  cy.wait(500);
  cy.get('@toggleButton').should('have.attr', 'src').and('match', /orthoIcon\.png$/);

  // Toggle to orthogonal
  cy.get('@toggleButton').click()
  cy.get('@toggleButton').should('have.attr', 'src').and('match', /perspIcon\.png$/);

  // Toggle to perspective
  cy.get('@toggleButton').click()
  cy.wait(500);
  cy.get('@toggleButton').should('have.attr', 'src').and('match', /orthoIcon\.png$/);

  // Toggle to orthogonal
  cy.get('@toggleButton').click()
};

/**
 * Navigates to answer a specific question by clicking on its title
 * @param questionTitle - The title of the question to click on
 */
export const goToAnswerQuestion = (questionTitle: string) => {
  cy.contains(questionTitle).click();
  cy.contains('Answer Question').click();
  cy.url().should('include', '/new/answer');
};

export const goToQuestion = (questionTitle: string) => {
  cy.contains(questionTitle).click();
};

export const goToComments = () => {
  cy.contains("Show Comments").click();
};

/**
 * Creates an answer to the current question
 * @param answerText - The answer content
 */
export const createAnswer = (answerText: string) => {
  cy.get('#answerTextInput').type(answerText);
  cy.contains('Post Answer').click();
};

/**
 * Performs a search using the search bar
 * @param searchTerm - The term to search for
 */
export const performSearch = (searchTerm: string) => {
  cy.get('#searchBar').type(`${searchTerm}{enter}`);
};

/**
 * Clicks on a specific filter/order button
 * @param filterName - The name of the filter ("Newest", "Unanswered", "Active", "Most Viewed")
 */
export const clickFilter = (filterName: string) => {
  cy.contains(filterName).click();
};

/**
 * Navigates back to the Questions page
 */
export const goToQuestions = () => {
  cy.contains('Questions').click();
  cy.url().should('include', '/home');
};

/**
 * Navigates back to the Collections page
 */
export const goToCollections = () => {
  cy.contains('Collections').click();
};

/**
 * Creates a new question with the provided details
 * @param title - Question title
 * @param text - Question content
 * @param tags - Space-separated tags
 */
export const createCommunity = (title: string, desc: string, isPrivate: boolean) => {
  cy.get('.new-community-button').click();
  // Use expected classnames instead of placeholder selectors
  cy.get('.new-community-input').eq(0).type(title);
  cy.get('.new-community-input').eq(1).type(desc);
  if (isPrivate) {cy.get('.new-community-checkbox-label input[type="checkbox"]').check();};
  cy.get('.new-community-submit').click();
};

/**
 * Navigates back to the Communities page
 */
export const goToCommunities = () => {
  cy.contains('Communities').click();
};

/**
 * Navigate to a Community Card
 */
export const viewCommunityCard = (CommunityName:string) => {
  cy.contains('.community-card-title', CommunityName).closest('.community-card').contains('button', 'View Community').click();
};


/**
 * Waits for questions to load and verifies the page is ready
 */
export const waitForQuestionsToLoad = () => {
  cy.get('.postTitle').should('exist');
};

/**
 * Open save question to collection modal
 * @param questionTitle - The title of the question to click on
 */
export const openSaveToCollectionModal = (questionTitle: string) => {
  cy.get('.question_mid').contains('.postTitle', questionTitle).parents('.question_mid').parents('.question').find('.collections-btn').click();
};

/**
 * Toggle save question modal
 * @param collectionTitle - The title of the question to click on
 */
export const toggleSaveQuestion = (collectionTitle: string) => {
  cy.get('.collection-list').contains('.collection-name', collectionTitle).parents('.collection-row').find('.save-btn').click();
};

/**
 * Saves a question to a collection
 * @param questionTitle - The title of the question to click on
 * @param collectionTitle - The title of the collection to save to
 */
export const toggleSaveQuestionToCollection = (questionTitle:string, collectionTitle: string) => {
  openSaveToCollectionModal(questionTitle);
  toggleSaveQuestion(collectionTitle);
};

/**
 * Verify community details are displayed
 * @param communityName - The name of the community
 * @param communityDesc - The description of the community
 * @param communityMembers - The members of the community
 */
export const verifyCommunityDetailsDisplayed = (communityName: string, communityDesc: string, communityMembers: Array<string>) => {
  cy.contains('.community-title', communityName).should('be.visible');
  cy.contains('.community-description', communityDesc).should('be.visible');
  cy.get('.member-item').each(($el, index, $list) => {
      cy.wrap($el).should("contain", communityMembers[index]);});
};

/**
 * Verify community details are displayed
 * @param communityName - The name of the community
 * @param communityDesc - The description of the community
 * @param communityMembers - The members of the community
 */
export const verifyCommunityDetailsNotDisplayed = (communityName: string, communityDesc: string, communityMembers: Array<string>) => {
  cy.contains('.community-title', communityName).should('not.exist');
  cy.contains('.community-description', communityDesc).should('not.exist');
  cy.get('.member-item').should('not.exist');
};

/**
 * Verify question is saved to collection
 * @param collectionTitle - The title of the collection to click on
 */
export const verifyQuestionSaved = (collectionTitle: string) => {
  cy.get('.collection-list').contains('.collection-name', collectionTitle).parents('.collection-row').get('.status-tag').should('have.class', 'saved');
};

/**
 * Verify question is unsaved to collection
 * @param collectionTitle - The title of the collection to click on
 */
export const verifyQuestionUnsaved = (collectionTitle: string) => {
  cy.get('.collection-list').contains('.collection-name', collectionTitle).parents('.collection-row').get('.status-tag').should('have.class', 'unsaved');
};

/**
 * Verifies the order of questions on the page
 * @param expectedTitles - Array of question titles in expected order
 */
export const verifyQuestionOrder = (expectedTitles: string[]) => {
  cy.get('.postTitle').should('have.length', expectedTitles.length);
  cy.get('.postTitle').each(($el, index) => {
    cy.wrap($el).should('contain', expectedTitles[index]);
  });
};

/**
 * Verifies the stats (answers/views) for questions
 * @param expectedAnswers - Array of expected answer counts
 * @param expectedViews - Array of expected view counts
 */
export const verifyQuestionStats = (expectedAnswers: string[], expectedViews: string[]) => {
  cy.get('.postStats').each(($el, index) => {
    if (index < expectedAnswers.length) {
      cy.wrap($el).should('contain', expectedAnswers[index]);
    }
    if (index < expectedViews.length) {
      cy.wrap($el).should('contain', expectedViews[index]);
    }
  });
};

/**
 * Verifies error messages are displayed
 * @param errorMessage - The error message to check for
 */
export const verifyErrorMessage = (errorMessage: string) => {
  cy.contains(errorMessage).should('be.visible');
};

/**
 * Verifies that the question count is displayed correctly
 * @param count - Expected number of questions
 */
export const verifyQuestionCount = (count: number) => {
  cy.get('#question_count').should('contain', `${count} question${count !== 1 ? 's' : ''}`);
};

/**
 * Custom assertion to check that elements contain text in order
 * @param selector - CSS selector for elements
 * @param texts - Array of texts in expected order
 */
export const verifyElementsInOrder = (selector: string, texts: string[]) => {
  cy.get(selector).should('have.length', texts.length);
  texts.forEach((text, index) => {
    cy.get(selector).eq(index).should('contain', text);
  });
};

// New methods added below

/**
 * Navigates to the My Collections page
 */
export const goToMyCollections = () => {
  cy.contains('My Collections').click();
  cy.url().should('include', '/collections');
};

/**
 * Navigates to the new collection creation page from My Collections.
 */
export const goToCreateCollection = () => {
  cy.get('.collections-create-btn').click({ force: true });
  cy.url().should('include', '/new/collection');
  cy.get('.new-collection-page').should('exist');
};

/**
 * Fills out the new collection form.
 */
export const createNewCollection = (
  name: string,
  description: string,
  isPrivate: boolean = false
) => {
  // Fill using expected classnames instead of placeholders
  cy.get('.new-collection-input').eq(0)
    .should('exist')
    .clear()
    .type(name);

  cy.get('.new-collection-input').eq(1)
    .should('exist')
    .clear()
    .type(description);

  // Handle privacy checkbox
  const checkboxSelector = '.new-collection-checkbox input[type="checkbox"]';
  cy.get(checkboxSelector).then(($checkbox) => {
    if (isPrivate) {
      cy.wrap($checkbox).check({ force: true });
    } else {
      cy.wrap($checkbox).uncheck({ force: true });
    }
  });

  // Submit the form
  cy.get('.new-collection-btn').should('exist').click({ force: true });
};

/**
 *  Deletes a collection by name
 * @param name - name of the collection to delete
 */
export const deleteCollection = (name: string) => {
  goToMyCollections();

   cy.get('.collection-card').contains('.collection-name', name).then(($nameEl) => {
    // Go back to a stable parent context before clicking
    cy.wrap($nameEl)
      .closest('.collection-card')
      .find('.delete-collection-button')
      .click({ force: true });
  });
  // Verify deletion
  cy.get('.collection-name').should('not.contain', name);
};

/**
 * Verifies that a collection with the specified name is visible on the page.
 * @param name - name of the collection to verify
 */
export const verifyCollectionVisible = (name: string) => {
  cy.contains(name).should('exist');
};

/**
 * Verifies that a collection card with the specified name is visible on the page.
 * @param collectionName - Name of the collection to verify.
 */
export const verifyCollectionExists = (collectionName: string) => {
  cy.get('.collections-list').should('exist');
  cy.get('.collection-card').should('exist');
  cy.get('.collection-name').contains(collectionName).should('be.visible');
};

/**
 * Opens a collection by clicking on its name on the My Collections page.
 * @param name - Name of the collection to open
 */
export const goToCollection = (name: string) => {
  cy.get('.collection-card').contains('.collection-name', name).click({ force: true });
  cy.url().should('include', '/collections/');
  cy.get('.collection-page').should('exist');
};

/**
 * Verifies that a collection page shows required details
 * (name, description, meta, and questions list).
 * @param name - Expected collection name
 * @param username - Expected username (optional)
 */
export const verifyCollectionPageDetails = (name: string, username?: string) => {
  cy.get('.collection-title').should('contain', name);
  cy.get('.collection-description').should('exist');
  cy.get('.collection-meta').should('exist');
  cy.get('.questions-list').should('exist');

  if (username) {
    cy.get('.collection-meta').should('contain', username);
  }
};

/**
 * Opens a question by title on the home page and verifies the AnswerPage loads.
 * @param title - The question title to open
 */
export const openCreatedQuestion = (title: string) => {
  cy.contains('.postTitle', title)
    .should('exist')
    .click();

  // Wait for AnswerPage to render
  cy.get('.answer_question_text', { timeout: 8000 }).should('be.visible');
};


/**
 * Generic verification that the AnswerPage displays correct content.
 * 
 * @param params - Fields you want to verify:
 *  - text: question body text
 *  - author: expected username
 *  - title: expected title
 */
export const verifyAnswerPageContent = (params: {
  title?: string;
  text?: string;
  author?: string;
}) => {
  if (params.title) {
    cy.get('.answer_question_title').should('contain.text', params.title);
  }

  if (params.text) {
    cy.get('.answer_question_text').should('contain.text', params.text);
  }

  if (params.author) {
    cy.get('.question_author').should('contain.text', params.author);
  }
};


/**
 * Uploads media on the Ask Question page.
 * Handles embed URLs, image/video uploads, and 3D model uploads.
 *
 * @param mediaType - "image" | "video" | "3d" | "youtube" | "vimeo"
 * @param value - File name or embed URL
 */
export const uploadMedia = (
  mediaType: "image" | "video" | "3d" | "youtube" | "vimeo",
  value: string
) => {
  if (mediaType === "youtube" || mediaType === "vimeo") {
    cy.get('.media-inputs input[type="text"]').type(value);
    cy.get('.media-inputs button').contains('Add Embed').click();

    // Preview should contain iframe
    cy.get('.embed-preview iframe').should('be.visible');
  }

  if (mediaType === "image" || mediaType === "video" || mediaType === "3d") {
    cy.get('input[type="file"]').attachFile(value);

    if (mediaType === "image") {
      cy.get('.uploaded-preview img').should('be.visible');
    }

    if (mediaType === "video") {
      cy.get('.uploaded-preview video').should('be.visible');
    }

    if (mediaType === "3d") {
      cy.get('.model-preview').should('be.visible');
    }
  }
};

/**
 * Verifies that media is rendered correctly on the AnswerPage.
 *
 * @param mediaType - "image" | "video" | "3d" | "youtube" | "vimeo"
 */
export const verifyMediaRendered = (
  mediaType: "image" | "video" | "3d" | "youtube" | "vimeo"
) => {
  if (mediaType === "youtube") {
    cy.get('.iframe-wrapper iframe')
      .should('have.attr', 'src')
      .and('include', 'youtube.com/embed');
  }

  if (mediaType === "vimeo") {
    cy.get('.iframe-wrapper iframe')
      .should('have.attr', 'src')
      .and('include', 'player.vimeo.com');
  }

  if (mediaType === "image") {
    cy.get('.question-media img').should('be.visible');
  }

  if (mediaType === "video") {
    cy.get('video source')
      .should('exist')
      .should('have.attr', 'src')
      .and('include', '.mp4');
  }

  if (mediaType === "3d") {
    cy.get('.three-wrapper canvas').should('exist');
  }
};

/**
 * Verifies the content and metadata of a comment block in the UI.
 *
 * @param {Object} params - Parameters for verifying the comment block.
 * @param {number} params.index - Index of the comment in the list of comment items.
 * @param {Object} params.expected - Expected values for the comment.
 * @param {string} params.expected.text - Expected text content of the comment.
 * @param {string} params.expected.username - Expected username of the comment author.
 * @param {"image"|"video"|"model"} [params.expected.mediaType] - Optional type of media attached to the comment.
 * @param {string} [params.expected.mediaUrl] - Optional expected URL for the media.
 * @param {boolean} [params.expected.canDelete] - Optional flag indicating if the delete button should be visible.
 */
export const verifyCommentBlock = ({
  index,
  expected,
}: {
  index: number;
  expected: {
    text: string;
    username: string;
    mediaType?: "image" | "video" | "model";
    mediaUrl?: string;
    canDelete?: boolean;
  };
}) => {
  cy.get(".comment-item").eq(index).should("exist").within(() => {
    cy.get(".comment-text")
      .should("be.visible")
      .and("contain", expected.text);

    if (expected.mediaType) {
      if (expected.mediaType === "video") {
        cy.get("iframe, video.comment-media")
          .should("exist")
          .and(($el) => {
            const src = $el.prop("src") || $el.attr("src");
            if (expected.mediaUrl) expect(src).to.include(expected.mediaUrl);
          });
      } else if (expected.mediaType === "image") {
        cy.get("img.comment-media")
          .should("be.visible")
          .and(($el) => {
            const src = $el.attr("src") || $el.attr("data-src");
            if (expected.mediaUrl) expect(src).to.include(expected.mediaUrl);
          });
      } else if (expected.mediaType === "model") {
        cy.get(".comment-model-wrapper").should("be.visible");
      }
    } else {
      cy.get(".comment-media").should("not.exist");
    }

    if (expected.canDelete) {
      cy.get(".delete-comment-btn").should("exist").and("be.visible");
    } else {
      cy.get(".delete-comment-btn").should("not.exist");
    }
  });
};
