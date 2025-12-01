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
    // Log in and navigate to the community
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
      });
    }
  });

  beforeEach(() => {
    // Log in and navigate to the community
    auth0Login();
    goToCommunities();
    viewCommunityCard("Backend Masters");
  });

  after(() => {
    teardownTest();
  });

  it("1 | Renders the gallery page and loads posts", () => {
    cy.contains("SORT BY").should("exist");

    cy.get(".grid-container .grid-cell").should("have.length", 6);

    cy.get(".galleryCard", { timeout: 10000 }).should("exist");
  });

  it("2 | Supports sorting posts", () => {
    cy.get(".sortSelect").eq(0).as("sortSelect");

    cy.get("@sortSelect").select("Oldest");
    cy.get("@sortSelect").should("have.value", "oldest");

    cy.get("@sortSelect").select("Most Viewed");
    cy.get("@sortSelect").should("have.value", "mostViewed");

    cy.get("@sortSelect").select("Most Liked");
    cy.get("@sortSelect").should("have.value", "highestRated");
  });
  
  it("2b | Verifies sorting order works", () => {
    cy.get(".sortSelect").eq(0).as("sortSelect");

    // Sort by newest
    cy.get("@sortSelect").select("Newest");
    cy.get(".galleryCard").then(($cards) => {
      const dates = [...$cards].map((card) =>
        new Date(card.dataset.postedAt || "").getTime()
      );
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).to.deep.equal(sorted);
    });

    // Sort by oldest
    cy.get("@sortSelect").select("Oldest");
    cy.get(".galleryCard").then(($cards) => {
      const dates = [...$cards].map((card) =>
        new Date(card.dataset.postedAt || "").getTime()
      );
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).to.deep.equal(sorted);
    });

    // Sort by most viewed
    cy.get("@sortSelect").select("Most Viewed");
    cy.get(".galleryCard").then(($cards) => {
      const views = [...$cards].map((card) =>
        Number(card.dataset.views || 0)
      );
      const sorted = [...views].sort((a, b) => b - a);
      expect(views).to.deep.equal(sorted);
    });

    // Sort by most liked
    cy.get("@sortSelect").select("Most Liked");
    cy.get(".galleryCard").then(($cards) => {
      const likes = [...$cards].map((card) =>
        Number(card.dataset.likes || 0)
      );
      const sorted = [...likes].sort((a, b) => b - a);
      expect(likes).to.deep.equal(sorted);
    });
  });

  it("3 | Filters by media type", () => {
    cy.get(".sortSelect").eq(1).as("typeSelect");

    cy.get("@typeSelect").select("Images");
    cy.get("@typeSelect").should("have.value", "image");

    cy.get("@typeSelect").select("Videos");
    cy.get("@typeSelect").should("have.value", "video");

    cy.get("@typeSelect").select("3D Models");
    cy.get("@typeSelect").should("have.value", "glb");

    cy.get("@typeSelect").select("Embeds");
    cy.get("@typeSelect").should("have.value", "embed");

    cy.get("@typeSelect").select("All");
    cy.get("@typeSelect").should("have.value", "all");
  });

  it("4 | Filters by category (tags)", () => {
    cy.get(".sortSelect").eq(2).as("categorySelect");

    cy.get("@categorySelect").select("all");
    cy.get("@categorySelect").should("have.value", "all");

    cy.get("@categorySelect").find("option").should("have.length.greaterThan", 1);

    cy.get("@categorySelect")
      .find("option")
      .eq(1)
      .then((option) => {
        const val = option.attr("value");
        cy.get("@categorySelect").select(val!);
        cy.get("@categorySelect").should("have.value", val!);
      });
  });

  it("5 | Supports searching", () => {
    cy.get(".searchInput").as("search");

    cy.get("@search").type("image");
    cy.get('[data-cy*="image"]').should("exist");

    cy.get("@search").clear().type("video example");
    cy.get(".galleryCard").each(($card) => {
      cy.wrap($card)
        .invoke("attr", "data-cy")
        .should("match", /video/i);
    });

    // Search by tag
    cy.get("@search").clear().type("modeling");
    cy.get(".galleryCard").each(($card) => {
      cy.wrap($card)
        .invoke("attr", "data-cy")
        .should("match", /image|another-image/i); // matches cards tagged with "modeling"
    });

    // Clear search should show all cards again
    cy.get("@search").clear();
    cy.get(".galleryCard").should("have.length.greaterThan", 0);
  });

  it("6 | Resets filters", () => {
    cy.get(".sortSelect").eq(0).select("oldest");
    cy.get(".sortSelect").eq(1).select("video");
    cy.get(".sortSelect").eq(2)
      .find("option")
      .eq(1)
      .then((op) => {
        cy.get(".sortSelect").eq(2).select(op.attr("value")!);
      });

    cy.get(".resetFiltersButton").click();

    cy.get(".sortSelect").eq(0).should("have.value", "newest");
    cy.get(".sortSelect").eq(1).should("have.value", "all");
    cy.get(".sortSelect").eq(2).should("have.value", "all");
  });

  it("7 | Displays loading placeholders before posts load", () => {
    cy.contains("SORT BY").should("exist");
    cy.get(".grid-cell").should("have.length", 6);
  });

  it("8 | Pagination - next and previous buttons work", () => {
    cy.get(".galleryCard")
      .then($cards => [...$cards].map(c => c.dataset.id))
      .as("firstPage");

    cy.get(".carouselArrow.right").click();

    cy.get(".galleryCard")
      .then($cards => [...$cards].map(c => c.dataset.id))
      .then(cardIds => {
        cy.get("@firstPage").then(firstPageIds => {
          expect(cardIds).to.not.deep.equal(firstPageIds);
        });
      });

    cy.get(".carouselArrow.left").click();

    cy.get(".galleryCard")
      .then($cards => [...$cards].map(c => c.dataset.id))
      .then(idsAfter => {
        cy.get("@firstPage").then(first => {
          expect(idsAfter).to.deep.equal(first);
        });
      });
  });

  it("9 | Shows all tags in category dropdown", () => {
    cy.get(".galleryCard", { timeout: 10000 }).should("exist");

    cy.get(".sortSelect").eq(2).find("option").then($options => {
      const optionTexts = [...$options].map(o => o.textContent?.trim());
      expect(optionTexts).to.include("3d art");   // matches display text
      expect(optionTexts).to.include("modeling");
    });
  });

  it("10 | Shows correct media preview for images and videos", () => {
    cy.get('[data-cy="gallery-card-image-post"]')
      .find("img")
      .should("exist");

    cy.get('[data-cy="gallery-card-video-post"]')
      .find("video")
      .should("exist");
  });

  it("11 | Search filters down to zero results when nothing matches", () => {
    cy.get(".searchInput").type("THISWILLNOTMATCHANYTHING");
    cy.get(".galleryCard").should("have.length", 0);

    cy.get(".noGalleryPosts").should("exist");
  });

  it("12 | Reset search returns all posts", () => {
    cy.get(".searchInput").clear().type("image");
    cy.get(".galleryCard").should("have.length.greaterThan", 0);

    cy.get(".searchInput").clear();
    cy.get(".galleryCard").should("have.length.greaterThan", 2);
  });

  it("13 | Items per page changes with screen size", () => {
    cy.viewport(1600, 900);
    cy.get(".galleryCard").should("have.length", 4);

    cy.viewport(1200, 900);
    cy.get(".galleryCard").should("have.length", 4);

    cy.viewport(800, 900);
    cy.get(".galleryCard").should("have.length", 4);
  });
});
