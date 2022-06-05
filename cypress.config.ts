import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://localhost:3000',
    viewportHeight: 1000,
    viewportWidth: 1280,
    retries: {
      runMode: 2,
      openMode: 1
    },
    env: {
      apiUrl: 'https://localhost:3000',
      mobileViewportWidthBreakpoint: 414,
      coverage: false,
      codeCoverage: {
        url: 'http://localhost:3000/__coverage__'
      },
      'cypress-react-selector': {
        root: "#station"
      }
    },
    specPattern: 'cypress/e2e/tests/**/*.ts',
    //integrationFolder: "cypress/tests",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
