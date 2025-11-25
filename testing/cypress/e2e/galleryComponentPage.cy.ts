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

    // loading cells appear initially
    cy.get(".grid-container .grid-cell").should("have.length", 6);

    // wait for gallery posts
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

    // categories come from the database; verify at least one option
    cy.get("@categorySelect").find("option").should("have.length.greaterThan", 1);

    // select the first real tag (index 1)
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
    cy.get(".galleryCard").should("exist");

    cy.get("@search").clear();
    cy.get(".galleryCard").should("exist");
  });

  it("6 | Supports pagination (carousel next/prev)", () => {
    cy.get("body").then(($body) => {
      const hasPagination = $body.find(".carouselArrow.right").length > 0;

      if (!hasPagination) {
        cy.log("Not enough items for pagination — skipping.");
        return;
      }

      cy.get(".carouselArrow.right").click();
      cy.get(".carouselPageIndicator").should("contain.text", "Page");

      cy.get(".carouselArrow.left").click();
      cy.get(".carouselPageIndicator").should("contain.text", "Page");
    });
  });

  it("7 | Resets filters", () => {
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
});
