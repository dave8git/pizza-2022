/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
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
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class amountWidget {
    constructor(element) {// argument jest referencją do elementu w którym widget ma zostać zainicjowany, będzie to div nie sam input ponieważ elementów jest więcej, 
      const thisWidget = this; 
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue); 
      thisWidget.initActions();
      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments: ', element);
    }
    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      //console.log('value', value);
      //console.log('newValue', newValue);
      //console.log('thisWidget.value', thisWidget.value);

      if((thisWidget.value !== newValue && !isNaN(newValue)) && ((newValue <= settings.amountWidget.defaultMax) && (newValue >= settings.amountWidget.defaultMin))) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value; 
    }
    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
      });
    }
    announce() {
      const thisWidget = this;
      //const event = new Event('updated');
      const event = new CustomEvent('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event); 
    }
  }

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }
    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data); // generate HTML based on template 
      console.log(thisProduct);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); // create element using utils.createElementFromHTML
      const menuContainer = document.querySelector(select.containerOf.menu);// find menu container 
      menuContainer.appendChild(thisProduct.element); // add element to menu 
    }

    getElements() {
      const thisProduct = this;
      thisProduct.dom = {}; 
      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //console.log(thisProduct.dom.amountWidgetElem);
    }

    initAccordion() {
      const thisProduct = this;
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event){
        event.preventDefault(); // prevent default action for event 
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive); // find active product (product that has active class)
        activeProducts.forEach(product => {
          if(product != thisProduct.element) {
            product.classList.remove('active');
          }
        });
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); // toggle active class on thisProduct.element 
      });
    }
    initOrderForm() {
      const thisProduct = this;
      thisProduct.dom.form.addEventListener('submit', function(event) {
        event.preventDefault();
      });
      for(let input of thisProduct.dom.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }
      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      thisProduct.dom.formData = utils.serializeFormToObject(thisProduct.dom.form);
      //console.log('formData', formData);
    
      let price = thisProduct.data.price;
     
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        for(let optionId in param.options) {
          const option = param.options[optionId];
          if(thisProduct.dom.formData[paramId] && thisProduct.dom.formData[paramId].includes(optionId)) {  
            if(!option.default) {
              price += option.price;
            }
          } else {
            if(option.default) {
              price -= option.price;
            }
          }
          const foundPicture = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
          if(foundPicture) {
            if(thisProduct.dom.formData[paramId] && thisProduct.dom.formData[paramId].includes(optionId)) {
              foundPicture.classList.add(classNames.menuProduct.imageVisible);
            } else {
              foundPicture.classList.remove(classNames.menuProduct.imageVisible);
            }  
          } 
        }
      }
      thisProduct.dom.priceSingle = price;
      price *= thisProduct.dom.amountWidget.value;
      thisProduct.dom.price = price;
      thisProduct.dom.priceElem.innerHTML = price;
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.dom.amountWidget = new amountWidget(thisProduct.dom.amountWidgetElem);
      //console.log('amountWidget', thisProduct.amountWidget);
      thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    prepareCartProductParams() {
      const thisProduct = this;
      const params = {}; 
      //console.log('thisProduct.dom.formData', thisProduct.dom.formData);
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };
        for(let optionId in param.options) {
          const option = param.options[optionId];
          if(thisProduct.dom.formData[paramId] && thisProduct.dom.formData[paramId].includes(optionId)) {  
            // console.log('paramId', paramId);
            // console.log('optionId', optionId);
            // console.log('params', params);
            // console.log('param', param);
            // console.log('option', option);
            params[paramId].options[optionId] = option.label;

          } 
          
        }
      }
      thisProduct.dom.params = params;
      return params; 
    }
    
    prepareCartProduct(){
      const thisProduct = this; 
      //console.log('thisProduct', thisProduct);
      const productSummary = {}; 
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.dom.amountWidget.value;
      productSummary.price = thisProduct.dom.price;
      productSummary.priceSingle = thisProduct.dom.priceSingle; 
      productSummary.params = thisProduct.prepareCartProductParams();
      console.log('productSummary', productSummary);
      return productSummary;
    }
    
    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initAction();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element; 
      //console.log(select.cart.toggleTrigger);
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

      console.log(thisCart.dom.deliveryFee);
    }
    initAction(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });    
      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      }); 
      thisCart.dom.productList.addEventListener('remove', function(event) {
        thisCart.remove(event.detail.cartProduct);
      });

    };
    remove(cartProduct) {
      const thisCart = this;
      cartProduct.dom.wrapper.remove(); 
      const index = thisCart.products.indexOf(cartProduct); 
      thisCart.products.splice(index, 1);
      thisCart.update();
    }
    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct); 
      thisCart.element = utils.createDOMFromHTML(generatedHTML); 
      const cartContainer = document.querySelector(select.cart.productList);
      //console.log(cartContainer);
      cartContainer.appendChild(thisCart.element); // add element to menu 

      thisCart.products.push(new CartProduct(menuProduct,thisCart.element));
      //console.log('thisCart.products', thisCart.products); 
      thisCart.update();
    }
    update() {
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;

      let totalNumber = 0; 
      let subtotalPrice = 0;

      thisCart.products.forEach(product => {
        totalNumber++;
        subtotalPrice += product.price;
        //console.log('product', product);
      });
      //console.log(subtotalPrice);
      if(totalNumber != 0) {
        thisCart.totalPrice = deliveryFee + subtotalPrice;
      } else {
        thisCart.totalPrice = 0;
        //deliveryFee = 0;
        subtotalPrice = 0;
      }

      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalPrice.forEach(total => {
        total.innerHTML = thisCart.totalPrice;
      });
      console.log(thisCart.dom.totalPrice);
      console.log(thisCart.totalPrice);
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id; 
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.amountWidget = menuProduct.amountWidget;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      console.log('thisCartProduct.priceSingle', menuProduct.priceSingle);
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions(); 
      console.log(menuProduct);

    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {}
      thisCartProduct.dom.wrapper = element; 

      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.amountWidgetElem = element.querySelector(select.cartProduct.amountWidget);
    }
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidgetElem);
      thisCartProduct.dom.amountWidgetElem.addEventListener('click', function() {
        thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
        //console.log('thisCartProduct', thisCartProduct.price);
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        //console.log(thisCartProduct.priceSingle);
      }); 
    }
    initActions() {
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    remove() {
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
  }
  const app = {
    initMenu: function() {
      const thisApp = this;
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      //console.log('thisApp.data:', thisApp.data);
    
    },
    initCart: function() {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart); 
      //console.log('cartElem', cartElem);
      thisApp.cart = new Cart(cartElem);
    },
    initData: function() {
      const thisApp = this; 
      thisApp.data = dataSource;
     
    },
    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();  
      thisApp.initCart(); 
    },
  };

  app.init();
}
