import {
  auth0Login,
  setupTest,
  teardownTest,
} from "../support/helpers";

describe("Question Component Page Sorting and Filtering", () => {
  beforeEach(() => {
    setupTest();
    auth0Login();
  });

  afterEach(() => {
    teardownTest();
  });

  it("1 | Displays the correct number of tags in the tag filter dropdown", () => {
    cy.get("#tagSelect")
        .find("option")
        .should("have.length.greaterThan", 1)
        .then($options => {
            
        const optionTexts = [...$options].map(o => o.textContent);
        expect(optionTexts).to.include.members([
            "All",
            "javascript",
            "python",
            "react",
            "node.js",
            "html",
            "css",
            "mongodb",
            "express",
            "typescript",
            "git",
        ]);
        });
  });

  it("2 | Filters by javascript", () => {
    cy.get("#tagSelect").select("javascript");
    cy.get("#question_list .question").should("have.length", 3);
  });

  it("3 | Sorts by newest", () => {
    cy.get("#orderSelect").select("newest");

    cy.get(".question").then($q => {
      const askDates = [...$q].map(el => new Date(el.dataset.ask).getTime());
      const sorted = [...askDates].sort((a, b) => b - a);
      expect(askDates).to.deep.equal(sorted);
    });
  });

  it("4 | Sorts by unanswered", () => {
    cy.get("#orderSelect").select("Unanswered");

    cy.wait(500);

    cy.get("#question_count").then($count => {
      const countText = $count.text().trim();
      const number = Number(countText.split(" ")[0]);
      expect(number).to.eq(0);
    });
  });

  it("5 | Sorts by active", () => {
    cy.get("#orderSelect").select("Active");

    cy.wait(500);

    cy.get(".question").then($questions => {
      let lastTime = Infinity;

      $questions.each((index, q) => {
        const lastAnsweredText = q.querySelector(".lastAnswered")?.textContent || "";
        let time = 0;

        if (lastAnsweredText) {
          time = new Date(lastAnsweredText.replace("Last answered: ", "")).getTime();
        }

        expect(time).to.be.at.most(lastTime);
        lastTime = time;
      });
    });
  });

  it("6 | Sorts by most viewed", () => {
    cy.get("#orderSelect").select("Most Viewed");

    cy.wait(500);

    cy.get(".question").then($questions => {
      let lastViews = Infinity;

      $questions.each((index, q) => {
        const viewsText = q.querySelector(".views")?.textContent || "";
        const views = viewsText ? Number(viewsText.replace("Views: ", "")) : 0;

        expect(views).to.be.at.most(lastViews);
        lastViews = views;
      });
    });
  });
});
