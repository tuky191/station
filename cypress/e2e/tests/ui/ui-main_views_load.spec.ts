it('should check if root view loads', function() {
  cy.visit('/');
  cy.contains('Terra Station')
});
it('should check if wallet view loads', function() {
  cy.visit('/wallet');
});
it('should check if history view loads', function() {
  cy.visit('/history');
});
it('should check if swap view loads', function() {
  cy.visit('/swap');
});
it('should check if stake view loads', function() {
  cy.visit('/stake');
});
it('should check if gov view loads', function() {
  cy.visit('/gov');
});
it('should check if nft view loads', function() {
  cy.visit('/nft');
});
it('should check if contract view loads', function() {
  cy.visit('/contract');
});
