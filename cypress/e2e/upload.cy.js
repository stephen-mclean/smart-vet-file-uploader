import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import mimetypes from "mime-types";

const BUCKET = "clinica-files";

describe("template spec", () => {
  it("passes", () => {
    const username = Cypress.env("USERNAME");
    const password = Cypress.env("PASSWORD");

    const clientName = Cypress.env("CLIENT_NAME");
    const petName = Cypress.env("PET_NAME");
    const files = Cypress.env("FILES_LIST");

    const awsAccessKey = Cypress.env("AWS_ACCESS_KEY_ID");
    const awsAccessSecret = Cypress.env("AWS_SECRET_ACCESS_KEY");

    cy.then(async () => {
      if (!username || !password || !clientName || !petName || !files) {
        cy.task("log", "Missing environment variables");
        return;
      }

      cy.task("log", "Running Cypress Upload");
      cy.task("log", "===== client ======");
      cy.task("log", clientName);
      cy.task("log", "===== pet ======");
      cy.task("log", petName);
      cy.task("log", "===== Files ======");
      cy.task("log", files);

      const client = new S3Client({
        credentials: {
          accessKeyId: awsAccessKey,
          secretAccessKey: awsAccessSecret,
        },
        region: "eu-north-1",
      });

      const fileIds = files.split(",");

      if (!fileIds || fileIds.length === 0) {
        cy.task("log", "No files to process");
        return;
      }

      const mappedContents = await Promise.all(
        fileIds.map(async (id) => {
          const getObjectCommand = new GetObjectCommand({
            Bucket: BUCKET,
            Key: id,
          });

          const objectResult = await client.send(getObjectCommand);
          const { Body, ContentType } = objectResult;
          const objectContents = await Body.transformToString("base64");
          const objectExtension = mimetypes.extension(ContentType);

          return {
            key: id,
            body: objectContents,
            extension: objectExtension,
            mimeType: ContentType,
          };
        })
      );

      mappedContents.forEach((content) => {
        cy.writeFile(
          `/tmp/${content.key}.${content.extension}`,
          content.body,
          "base64"
        );
      });

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
        .eq(1)
        .within(() => {
          cy.get("a").eq(1).click();
        });

      cy.get("a[href='#attachment']").click();

      cy.readFile(
        `/tmp/${mappedContents[0].key}.${mappedContents[0].extension}`,
        { encoding: "base64" }
      ).then((file) => {
        cy.task("log", "Uploading file");

        cy.get("input#files")
          .attachFile({
            fileContent: file,
            fileName: `${mappedContents[0].key}.${mappedContents[0].extension}`,
            mimeType: mappedContents[0].mimeType,
            encoding: "base64",
          })
          .then(() => {
            cy.wait(5000);
            cy.task("log", "File uploaded");
            cy.get("#dialog").within(() => {
              cy.get('a[class="btn btn-success"]').click();
            });
          });
      });
    });
  });
});
