const { defineConfig } = require("cypress");
require('dotenv').config();

export default defineConfig({
  // setupNodeEvents can be defined in either
  // the e2e or component configuration
  e2e: {
    baseUrl: 'http://localhost:4530',
    fixturesFolder: 'cypress/fixtures',
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      config.env = {
        ...process.env,
        ...config.env,
      };
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
  env: {
    auth0_username: "user345",
    auth0_password: "P@ssw0rd345",
    auth0_domain: "dev-yipqv2u1k7drpppn.us.auth0.com",
    auth0_audience: "https://dev-yipqv2u1k7drpppn.us.auth0.com/api/v2/",
    auth0_scope: "openid profile read:posts write:posts",
    auth0_client_id: "EM2LUFQm7vU6qkTTLtjQvd1C6LLHOFNk",
    auth0_client_secret: "G-_XBDF0w0l_jHr8XpngULhUd_-bf_iHDeeb-Sku6F6YBHpNbku3_se1dUD8xua-",
  },
});
