/// <reference types="cypress" />
//import { Canvg } from 'https://cdn.skypack.dev/canvg';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import { BrowserMultiFormatReader } from '@zxing/browser';
import { createCanvas, loadImage } from 'canvas';

//const fs = require('fs');
//console.log(fs);

Cypress.Commands.add('readCode', { prevSubject: true }, (subject) => {
  const svg = subject[0];
  cy.task('decodeQrFromSvg', {
    svg: svg.outerHTML,
  }).then((result: any) => {
    return result;
  });
});
declare global {
  namespace Cypress {
    interface Chainable {
      readCode(options?: Partial<TypeOptions>): Chainable<any>;
    }
  }
}
