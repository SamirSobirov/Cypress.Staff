describe('Staff Management Flow', () => {

  before(() => {
    cy.writeFile('auth_api_status.txt', '0')
  })

  it('Full Flow: Auth -> Create -> Edit -> Delete', () => {

    cy.viewport(1280, 800)

    // =========================================================
    // AUTH
    // =========================================================

    cy.log('STEP 1 AUTH')

    cy.intercept('POST', '**/login**').as('apiAuth')
    cy.intercept('POST', '**/staff**').as('apiCreateStaff')

    cy.visit('https://triple-test.netlify.app/sign-in', {
      timeout: 60000
    })

    cy.url().should('include', '/sign-in')

    cy.get('input[type="text"]', { timeout: 20000 })
      .should('be.visible')
      .clear()
      .type(Cypress.env('LOGIN_EMAIL'), { delay: 80, log: false })

    cy.get('input[type="password"]')
      .should('be.visible')
      .clear()
      .type(Cypress.env('LOGIN_PASSWORD'), { delay: 80, log: false })

    cy.contains('button', 'Войти')
      .should('be.enabled')
      .click()

    cy.wait('@apiAuth', { timeout: 30000 }).then((interception) => {

      const statusCode = interception.response?.statusCode || 500

      if (statusCode >= 400) {
        cy.writeFile('auth_api_status.txt', `ERROR_${statusCode}`)
        throw new Error(`AUTH ERROR ${statusCode}`)
      }

      cy.writeFile('auth_api_status.txt', '1')
    })

    // =========================================================
    // NAVIGATION
    // =========================================================

    cy.visit('https://triple-test.netlify.app/flight/ru/staff', {
      timeout: 60000
    })

    cy.url({ timeout: 20000 }).should('include', '/staff')

    cy.get('.p-datatable', { timeout: 20000 })
      .should('be.visible')

    cy.contains('button', 'Добавить', { timeout: 20000 })
      .should('be.visible')

    // =========================================================
    // CREATE STAFF
    // =========================================================

    cy.log('STEP 2 CREATE')

    const staffLogin = `TestStaff_${Date.now()}`
    const email = `${staffLogin}@mail.com`

    cy.contains('button', 'Добавить').click()

    cy.get('input[placeholder="Введите логин"]', { timeout: 15000 })
      .should('be.visible')
      .type(staffLogin, { delay: 80 })

    cy.get('input[placeholder="Supplier A"]').first()
      .type('Test', { delay: 80 })

    cy.get('input[placeholder="Supplier A"]').last()
      .type('Staff', { delay: 80 })

    cy.get('input[placeholder="example@easybooking.com"]')
      .type(email, { delay: 80 })

    cy.contains('button', 'Продолжить')
      .should('be.enabled')
      .click()

    cy.get('.role-card', { timeout: 15000 })
      .contains('Оператор')
      .click()

    cy.contains('button', 'Создать')
      .should('be.enabled')
      .click()

    cy.wait('@apiCreateStaff', { timeout: 30000 })

    cy.writeFile('auth_api_status.txt', '2')

    // =========================================================
    // WAIT TABLE UPDATE
    // =========================================================

    cy.get('.p-datatable-tbody', { timeout: 20000 })
      .should('contain', 'Test')

    // =========================================================
    // EDIT
    // =========================================================

    cy.log('STEP 3 EDIT')

    cy.contains('.p-datatable-tbody tr', 'Test')
      .should('be.visible')
      .click()

    cy.contains('button', 'Изменить', { timeout: 15000 })
      .click()

    cy.contains('.p-tab', 'Информация о пользователе')
      .click()

    cy.get('input[placeholder="Введите фамилию"]')
      .clear()
      .type('Sobirov', { delay: 80 })

    cy.get('input[placeholder="Введите имя"]')
      .clear()
      .type('Samir', { delay: 80 })

    cy.contains('button', 'Сохранить')
      .should('be.enabled')
      .click()

    cy.writeFile('auth_api_status.txt', '3')

    // =========================================================
    // DELETE
    // =========================================================

    cy.log('STEP 4 DELETE')

    cy.contains('.p-datatable-tbody tr', 'Samir')
      .should('be.visible')
      .click()

    cy.contains('button', 'Удалить')
      .should('be.visible')
      .click()

    cy.get('.app-confirm-modal__button--accept', { timeout: 15000 })
      .should('be.visible')
      .click()

    cy.get('.p-datatable-tbody', { timeout: 20000 })
      .should('not.contain', 'Samir')

    cy.writeFile('auth_api_status.txt', '4')

    cy.log('FLOW FINISHED')
  })
})