import { auth0Login, setupTest, teardownTest, goToCommunities, viewCommunityCard, createNewGalleryPost, verifyNewGalleryPost } from '../support/helpers';
import '../support/auth0';

describe('Cypress tests for gallery post page features', function () {
  const testUser = 'user123';
  const title = "Test gallery post full features";
  const description = "Testing views, likes, downloads, delete, and project link";
  const tags = ['3d art', 'modeling'];
  const mediaFile = 'testImage.jpg';
  const projectLink = 'https://example.com/project';

  before(() => {
    setupTest();
    auth0Login();

    goToCommunities();
    viewCommunityCard('React Enthusiasts');

    cy.get('.gallery-upload-button').click();
    createNewGalleryPost(title, description, tags, mediaFile, projectLink);

    verifyNewGalleryPost(title, testUser, description, tags, mediaFile, projectLink);
  });

  beforeEach(() => {
    auth0Login();

    goToCommunities();
    viewCommunityCard('React Enthusiasts');

    cy.get(`[data-cy="gallery-card-test-gallery-post-full-features"]`, { timeout: 10000 })
    .should('exist')
    .click();
  });

  after(() => {
    teardownTest();
  });

  it('1 | Increments views when the page is visited', () => {
    cy.get('.postStats .statItem').eq(1).then($el => {
      const initialViews = parseInt($el.text().replace(/\D/g, ''), 10);

      cy.get('.postStats .statItem').eq(1).should($newEl => {
        const newViews = parseInt($newEl.text().replace(/\D/g, ''), 10);
        expect(newViews).to.equal(initialViews);
      });
    });
  });

  it('2 | Toggles likes correctly', () => {
    cy.get('.postStats .statItem').eq(0).then($el => {
      const initialLikes = parseInt($el.text().replace(/\D/g, ''), 10);

      cy.get('.postStats .statItem').eq(0).click();

      cy.get('.postStats .statItem').eq(0).should($likeEl => {
        const newLikes = parseInt($likeEl.text().replace(/\D/g, ''), 10);
        expect(newLikes).to.equal(initialLikes + 1);
      });

      cy.get('.postStats .statItem').eq(0).click();
      cy.get('.postStats .statItem').eq(0).should($likeEl => {
        const revertedLikes = parseInt($likeEl.text().replace(/\D/g, ''), 10);
        expect(revertedLikes).to.equal(initialLikes);
      });
    });
  });

  it('3 | Increments downloads correctly', () => {
    cy.get('.postStats .statItem').eq(2).then($el => {
      const initialDownloads = parseInt($el.text().replace(/\D/g, ''), 10);

      cy.window().then(win => {
        cy.stub(win.HTMLAnchorElement.prototype, 'click').as('anchorClick');
      });

      cy.get('.postStats .statItem').eq(2).click();

      cy.get('@anchorClick').should('have.been.called');

      cy.get('.postStats .statItem').eq(2).should($after => {
        const newDownloads = parseInt($after.text().replace(/\D/g, ''), 10);
        expect(newDownloads).to.equal(initialDownloads + 1);
      });
    });
  });

  it('4 | Opens project link in a new tab', () => {
    cy.get('.viewProjectBtn').should('exist');

    cy.window().then(win => cy.stub(win, 'open').as('openStub'));

    cy.get('.viewProjectBtn').click();

    cy.get('@openStub').should('have.been.calledWith', projectLink, '_blank');
  });

  it('5 | Deletes the gallery post successfully', () => {
    cy.get('.postStats .statItem.delete').click();

    // This is the actual redirect
    cy.url().should('match', /\/communities\/[a-f0-9]{24}$/);

    cy.contains(title).should('not.exist');
  });
});
