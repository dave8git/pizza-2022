/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      console.log('new Product:', thisProduct);
      thisProduct.renderInMenu();
      thisProduct.initAccordion();
    }
    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data); // generate HTML based on template 
      //console.log('generatedHTML', generatedHTML);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); // create element using utils.createElementFromHTML
      //console.log('thisProduct.element', thisProduct.element);
      const menuContainer = document.querySelector(select.containerOf.menu);// find menu container 
      //console.log('menuContainer', menuContainer);
      menuContainer.appendChild(thisProduct.element); // add element to menu 
    }
    initAccordion() {
      const thisProduct = this;
      console.log('thisProduct.element', thisProduct.element);
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // find the clicable trigger (the element that should react to clicking)
      clickableTrigger.addEventListener('click', function(event){
        event.preventDefault(); // prevent default action for event 
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive); // find active product (product that has active class)
        activeProducts.forEach(product => {
          if(product != thisProduct.element) {
           
            product.classList.remove('active');
          }
        })
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); // toggle active class on thisProduct.element 
      });
    }
  }



  const app = {
    initMenu: function() {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      console.log('thisApp.data:', thisApp.data);
    
    },
    initData: function() {
      const thisApp = this; 
      thisApp.data = dataSource;
     
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();  
    },
  };

  app.init();
}
