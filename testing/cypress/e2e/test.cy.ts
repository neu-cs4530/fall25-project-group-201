/// <reference types="cypress" />


import { setupTest } from '../support/helpers';

import '../support/auth0'

describe('Auth0', function () {
    beforeEach(function () {
        setupTest();
    })

    it('shows onboarding', function () {
        cy.visit('/')
        cy.contains('Welcome ')
        cy.contains('button', 'Log In or Sign Up').click()

        cy.origin('https://dev-yipqv2u1k7drpppn.us.auth0.com', () => {
            // Fill in the login form
            cy.get('input[name="username"], input[name="email"]').type('user123')
            cy.get('input[name="password"]').type('securePass123!', { log: false }) // hide in logs
            cy.get('button[type="submit"]:visible').click()
        })
        
    })
})