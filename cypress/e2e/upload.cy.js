describe("template spec", () => {
  it("passes", () => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    const clientName = Cypress.env("CLIENT_NAME");
    const petName = Cypress.env("PET_NAME");
    const visitDate = Cypress.env("VISIT_DATE");

    if (!username || !password || !clientName || !petName || !visitDate) {
      return;
    }

    cy.visit("https://clinic.smart-vet.com/Account/LogOn");

    cy.get("#UserName").type(username);
    cy.get("#Password").type(password);
    cy.get('button[type="submit"]').click();

    cy.get("a[href='/Customer']").eq(1).click();
    cy.get("input[class='form-control']").type(clientName);
    cy.get("button[type='submit']").click();

    cy.get("table").within(() => {
      cy.get("a").first().click();
    });

    cy.get("a[href='#patients']").click();
    cy.contains(petName).click();

    cy.get("a[href='#visits']").click();

    cy.contains(visitDate)
      .parent("tr")
      .within(() => {
        cy.get("a").eq(1).click();
      });
  });
});
