import {
  auth0Login,
  createNewGalleryPost,
  goToCommunities,
  setupTest,
  teardownTest,
  viewCommunityCard,
} from "../support/helpers";

describe("Gallery Component Page", () => {

  const createGalleryPost = ({
    title,
    description,
    tags,
    mediaFile,
    link,
    thumbnail,
  }: {
    title: string;
    description: string;
    tags: string[];
    mediaFile?: string;
    link?: string;
    thumbnail?: string;
  }) => {
    cy.get(".gallery-upload-button").click();
    createNewGalleryPost(title, description, tags, mediaFile, link, thumbnail);
  };

  before(() => {
    setupTest();
    auth0Login();
    goToCommunities();
    viewCommunityCard("Backend Masters");

    const posts = [
      {
        title: "3D Model Post",
        description: "A 3D model example",
        tags: ["3d art"],
        mediaFile: "test3DModel.glb",
        thumbnail: "testThumbnail.jpg",
      },
      {
        title: "Image Post",
        description: "An image example",
        tags: ["3d art", "modeling"],
        mediaFile: "testImage.jpg",
        link: "https://www.youtube.com/watch?v=N88g_IGGHRg",
      },
      {
        title: "Video Post",
        description: "A video example",
        tags: ["3d art"],
        mediaFile: "testVideo.mp4",
      },
      {
        title: "Another Image Post",
        description: "Another image example",
        tags: ["modeling"],
        mediaFile: "testImage.jpg",
      },
    ];

    // Sequentially create posts using a for...of loop
    for (const post of posts) {
      cy.wrap(null).then(() => {
        cy.log(`Creating gallery post: ${post.title}`);
        createGalleryPost(post);

        cy.wait(500);
      });
    }
  });

  beforeEach(() => {
    auth0Login();
    cy.wait(300);

    goToCommunities();
    cy.wait(300);

    viewCommunityCard("Backend Masters");
    cy.wait(500);

    cy.get(".galleryCard", { timeout: 8000 }).should("exist");

    cy.get('[data-cy="gallery-card-image-post"]').first().click();

    cy.get(".relatedPostsSidebar", { timeout: 8000 }).should("exist");
  });

  after(() => {
    teardownTest();
  });

  it("1 | Displays related posts sidebar if related posts exist", () => {
    cy.get(".relatedPostsSidebar").should("exist");

    cy.wait(300);

    cy.get(".relatedPostsSidebar .relatedCard")
      .should("have.length.greaterThan", 0);
  });

  it("2 | Each related post shows thumbnail, title, and author", () => {
    cy.get(".relatedPostsSidebar .relatedCard")
      .should("have.length.greaterThan", 0)
      .each(($card) => {
        cy.wrap($card).find(".relatedThumb").should("exist");
        cy.wrap($card).find(".relatedPostTitle").should("exist").and("not.be.empty");
        cy.wrap($card).find(".relatedPostUser").should("exist").and("not.be.empty");
      });
  });

  it("3 | Clicking a related post navigates to its gallery post page", () => {
    cy.get(".relatedPostsSidebar .relatedCard")
      .first()
      .then(($card) => {
        const href = $card.prop("href");

        cy.wrap($card).click();

        cy.wait(500);

        cy.get('.postInfo').should('exist').contains("Another Image Post")
      });
  });
});
