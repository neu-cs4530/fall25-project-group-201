/* eslint-disable @typescript-eslint/no-unused-vars */
declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to login via Auth0 UI
     * @example cy.loginToAuth0('user', 'pass')
     */
    loginToAuth0(username: string, password: string): Chainable<any>;
  }
}

function loginViaAuth0Ui(username: string, password: string) {
  cy.visit('/')

  // Wait for redirect to Auth0 domain
  cy.url({ timeout: 10000 }).should('include', Cypress.env('auth0_domain'))

  // Login on Auth0
  cy.origin(
    Cypress.env('auth0_domain'),
    { args: { username, password } },
    ({ username, password }) => {
      cy.get('input#username').type(username)
      cy.get('input#password').type(password, { log: false })
      cy.contains('button[value=default]', 'Continue').click()
    }
  )

  // Ensure we are back on the app
  cy.origin('http://localhost:4530', () => {
    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:4530/')
  })
}

Cypress.Commands.add('loginToAuth0', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    // @ts-ignore
    autoEnd: false,
  })
  log.snapshot('before')

  loginViaAuth0Ui(username, password)

  log.snapshot('after')
  log.end()
})