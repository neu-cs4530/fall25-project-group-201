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

    cy.wait(500);

    cy.get(".question").then($questions => {
        const askDates = [...$questions].map(q => {
        const dateStr = q.dataset.ask;
        return dateStr ? new Date(dateStr).getTime() : 0;
        });

        for (let i = 0; i < askDates.length - 1; i++) {
        expect(askDates[i], `Question at index ${i} is newer than next question`).to.be.at.least(
            askDates[i + 1]
        );
        }
    });
 });

  it("4 | Sorts by unanswered", () => {
    cy.get("#orderSelect").select("unanswered");

    cy.wait(5000);

    cy.get("#question_count").then($count => {
      const countText = $count.text().trim();
      const number = Number(countText.split(" ")[0]);
      expect(number).to.eq(0);
    });
  });

  it("5 | Sorts by active", () => {
    cy.get("#orderSelect").select("active");

    cy.wait(500);

    cy.get(".question").then($questions => {
      let lastTime = Infinity;

      $questions.each((index, q) => {
        const answersText =
          q.querySelector(".postAnswersViews > div:first-child")?.textContent ||
          "0 answers";
        const answers = Number(answersText.replace(" answers", ""));

        const askDateAttr = q.dataset.ask ? new Date(q.dataset.ask).getTime() : 0;

        const time = answers > 0 ? answers : askDateAttr;

        expect(time).to.be.at.most(lastTime);
        lastTime = time;
      });
    });
  });

  it("6 | Sorts by most viewed", () => {
    cy.get("#orderSelect").select("mostViewed");

    cy.wait(500);

    cy.get(".question").then($questions => {
      let lastViews = Infinity;

      $questions.each((index, q) => {
        const viewsDiv = q.querySelector(".postAnswersViews > div:nth-child(2)");
        const viewsText = viewsDiv?.textContent || "";
        const views = viewsText ? Number(viewsText.replace(" views", "")) : 0;

        expect(views).to.be.at.most(lastViews);
        lastViews = views;
      });
    });
  });
});
