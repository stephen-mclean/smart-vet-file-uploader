describe("template spec", () => {
  it("passes", () => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    const clientName = Cypress.env("CLIENT_NAME");
    const petName = Cypress.env("PET_NAME");
    const bucket = Cypress.env("BUCKET");

    cy.task("log", "Running Cypress Upload");
    cy.task("log", bucket);

    if (!username || !password || !clientName || !petName || !bucket) {
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
    cy.contains(petName, { matchCase: false }).click();

    cy.get("a[href='#visits']").click();

    cy.get("tr")
      .eq(0)
      .within(() => {
        cy.get("a").eq(1).click();
      });
  });
});
