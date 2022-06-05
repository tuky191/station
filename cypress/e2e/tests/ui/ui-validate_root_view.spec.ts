describe('Tests for the dashboard', () => {
  before(() => {
    cy.visit('/');
    cy.wait(2000);
    cy.waitForReact(2000);
  });

  it('should check if App exists', function () {
    cy.react('App').should('exist');
  });

  it('should check if key elements exist', function () {
    cy.react('Banner').should('exist');
    cy.react('Sidebar').should('exist');
    cy.react('Header').should('exist');
    cy.react('Content').should('exist');
  });

  it('should check if Sidebar contains Nav and Aside elements', function () {
    cy.getReact('Sidebar').getReact('Aside').should('exist');
    cy.getReact('Sidebar').getReact('Nav').should('exist');
  });

  it('should check if Header contains all elements', function () {
    //typo - need fix in src/app/sections/Refresh.tsx
    cy.getReact('Header').getReact('Prefreneces').should('exist');
    cy.getReact('Header').getReact('Preferences').should('exist');
    //cy.getReact('Header').getReact('DevTools').should('have.name', '');
    //cy.getReact('Header').getReact('DevTools').nthNode(0).getProps('name').should('eq', 'DevTools');
    cy.getReact('Header').getReact('DevTools').getProps();
    cy.getReact('Header')
      .getReact('DevTools')
      .nthNode(0)
      .then(($option) => {
        cy.log('', $option);
        expect($option.children).to.have.length(0);
        expect($option.name).to.equal('DevTools');
      });
  });

  it('should check if SelectTheme contains all elements', function () {
    cy.getReact('SelectTheme').getReact('Insertion').should('exist');
    cy.getReact('SelectTheme').getReact('Insertion').nthNode(0).getProps();

    //cy.getReact('Header').getReact('DevTools').should('have.name', '');
    //cy.getReact('Header').getReact('DevTools').nthNode(0).getProps('name').should('eq', 'DevTools');
    /*
    cy.getReact('Header').getReact('DevTools').getProps();
    cy.getReact('Header').getReact('DevTools').nthNode(0).then(($option) => {
      cy.log('', $option);
      expect($option.children).to.have.length(0);
      expect($option.name).to.equal('DevTools');
    })
    */
  });

  it('should check if Dashboard successfully loads all elements', function () {
    let elements = ['Issuance', 'CommunityPool', 'StakingRatio'];
    for (const element of elements) {
      cy.getReact(element)
        .nthNode(0)
        .then(($option) => {
          expect($option.children[0].props.isSuccess).to.be.true;
        });
    }
  });

  it('should check if Charts are loading', function () {
    let elements = ['StakingReturn', 'Wallets'];
    for (const element of elements) {
      cy.getReact(element)
        .nthNode(0)
        .then(($option) => {
          expect($option.children[0].props.isSuccess).to.be.true;
        });
      cy.react(element).find('button').click({ multiple: true });
    }
  });

  it('should check if TxVolume options are clickable', function () {
    //let currencies = ['UST', 'Luna', 'AUT', 'CAT', 'CHT', 'CNT', 'DKT', 'EUT', 'GBT', 'HKT', 'IDT', 'INT', 'JPT', 'KRT', 'MNT', 'MYT', 'NOT', 'PHT', 'SDT', 'SET', 'SGT', 'THT', 'TWT']
    let currencies = ['Luna'];
    let display_types = ['Cumulative', 'Periodic'];
    for (const currency of currencies) {
      cy.react('TxVolume').find('select').eq(0).select(currency);
      cy.react('TxVolume')
        .find('h1')
        .eq(1)
        .getReact('small', {
          props: { children: currency },
          options: { timeout: 4000 },
        })
        .should('exist');
      for (const display_type of display_types) {
        cy.react('TxVolume').find('select').eq(1).select(display_type);
        cy.react('TxVolume')
          .find('h1')
          .eq(1)
          .getReact('small', {
            props: { children: currency },
            options: { timeout: 4000 },
          })
          .should('exist');
        cy.react('TxVolume').find('button').click({ multiple: true });
      }
    }
  });

  it('should verify language selection', function () {
    cy.getReact('Preferences')
      .nthNode(0)
      .then(($preferences) => {
        cy.wrap($preferences.node[0]).within(($inner) => {
          cy.wrap($inner).click();
          cy.wrap($inner)
            .find('.tippy-box')
            .within(($tippy) => {
              let languages = {
                Čeština: 'Jazyk',
                Deutsch: 'Sprache',
                English: 'Language',
                Español: 'Idioma',
                Français: 'Langue',
                Italiano: 'Lingua',
                Polish: 'Language',
                Português: 'Idioma',
                Русский: 'Язык',
                中文: 'Language',
              };
              for (let [language, value] of Object.entries(languages)) {
                cy.wrap($tippy).contains(language).click({ force: true });
                cy.wrap($tippy).find('button').eq(0).should('have.text', value);
              }
              cy.wrap($tippy).contains('English').click({ force: true });
            });
        });
      });
  });

  it('should verify themes selection', function () {
    let themes = ['Light', 'Dark', 'Blossom', 'Moon', 'Whale', 'Madness'];
    cy.react('SelectTheme').find('button').click();
    for (const theme of themes) {
      cy.react('Modal').find('button').contains(theme).click();
    }
    cy.react('Modal').find('button').contains('Light').click();
    cy.react('Modal').find('button').eq(0).click();
  });

  it.skip('should verify wallet connect qrcode', function () {
    //Clicks on the 'Connect' button in the header section
    cy.react('ConnectWallet').click();
    //Selects Wallet Connect from the list
    cy.react('Modal').find('button').eq(2).click();
    //Placeholder test - need to figure out how to get the qrcode
    cy.get('.wallet-wc-modal--content').find('canvas').should('exist');
  });

  it('should connect as Terra Station Wallet', function () {
    //Clicks on the 'Connect' button in the header section
    cy.react('ConnectWallet').click();
    //Selects Terra Station Wallet from the list
    cy.react('Modal').find('button').eq(1).click();
  });

  it('should disconnect wallet', function () {
    //Clicks on the 'Connect / terra1ecshjgpdzn86w2uzu350y7vl0l5f73qn8x2hny' button in the header section
    cy.react('Header').find('button').eq(3).click();
    //Clicks on the 'Disconnect' button in the header section - tippy-7
    cy.get('#tippy-7').within(($tippy) => {
      $tippy.find('button').eq(2).trigger('click');
    });
  });

  it('Should connect as View an address', function () {
    //Clicks on the 'Connect' button in the header section
    cy.react('ConnectWallet').click();
    //Selects 'View an addres' from the list
    cy.react('Modal').find('button').eq(3).click();
  });

  it('View an address: should find all networks', function () {
    cy.get('.wallet-readonly-modal').within(($modal) => {
      //cycle through all networks
      let networks = ['pisco-1', 'phoenix-1', 'columbus-5'];
      for (const network of networks) {
        cy.wrap($modal).find('option').contains(network).should('exist');
      }
    });
  });

  it('View an address: should find submit to be disabled', function () {
    cy.get('.wallet-readonly-modal').within(($modal) => {
      expect($modal.find('button')).to.be.disabled;
    });
  });

  it('View an address: should input address', function () {
    cy.get('.wallet-readonly-modal').within(($modal) => {
      cy.wrap($modal)
        .find('input')
        .type('terra1ecshjgpdzn86w2uzu350y7vl0l5f73qn8x2hny');
      cy.wrap($modal).find('button').click();
    });
  });

  it('should disconnect wallet', function () {
    //Clicks on the 'Connect / terra1ecshjgpdzn86w2uzu350y7vl0l5f73qn8x2hny' button in the header section
    cy.react('Header').find('button').eq(3).click();
    //Clicks on the 'Disconnect' button in the header section - tippy
    cy.get('#tippy-19').within(($tippy) => {
      $tippy.find('button').eq(2).trigger('click');
    });

    /*
    cy.getReact('Connected').getReact('Tippy').nthNode(2).then(($option) => {
        console.log($option);
    })    
    */
    //wait(1000).react('PopoverNone').should('exist');;
    //cy.react('PopoverNone').eq(1)   ;

    /*
    cy.getReact('PopoverNone').nthNode(1).then(($option) => {
        //$option.find('button');
            console.log($option);
          //expect($option.children[0].props.isSuccess).to.be.true;
        })
    */
    //cy.react('PopoverNone').eq(1).find('button').click({force: true});
    //cy.react('PopoverNone').should('exist');

    //cy.react('Header').react('IsClassicNetwork').should('exist');
    //cy.react('Modal').find('button').eq(0).click();

    //cy.getReact('ConnectWallet').nthNode(0).then(($option) => {
    //$option.find('button');
    //    console.log($option);
    //expect($option.children[0].props.isSuccess).to.be.true;
    //    })
  });

  /*
terra_testnet_wallet
terra1ecshjgpdzn86w2uzu350y7vl0l5f73qn8x2hny
crane snap predict blush ecology list iron truly pulse potato nose sort crew diary chest rich floor mask asthma all first area skin spot
  it('should check if view contains all key elements', function() {

    cy.react('LunaPrice').should('exist');
    cy.react('SelectDenom').should('exist');
    cy.react('Issuance').should('exist');
    cy.react('CommunityPool').should('exist');
    cy.react('StakingRatio').should('exist');
    cy.react('Charts').should('exist');
    cy.react('TxVolume').should('exist');
    cy.react('StakingReturn').should('exist');
    cy.react('TaxRewards').should('exist');
    cy.react('Wallets').should('exist');


    /*
    cy.react('SelectDenom').eq(0).click();
    cy.react('SelectDenom').eq(0).getBySel("CloseIcon").click();
    cy.react('SelectDenom').eq(1).click();
    cy.react('SelectDenom').eq(1).getBySel("CloseIcon").click();
    cy.react('StakingReturn').getBySel("ArrowDropDownIcon").eq(3).click();
    */
  /*
    cy.react('SelectDenom').should(
      ($input) => {
        cy.log('react() is', $input);
        //cy.get('button').click({ multiple: true });
        //expect($input).to.have.length(1);
      }
    );

    //cy.react('Flex').should('exist');
    //cy.react('Layout', {props});
});
*/
});
