import {select, classNames, templates} from './../settings.js';
import {utils} from './../utils.js';
import AmountWidget from './AmountWidget.js';

export class Product {
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
    thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
      event.preventDefault(); // prevent default action for event 
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive); // find active product (product that has active class)
      activeProducts.forEach(product => {
        if (product != thisProduct.element) {
          product.classList.remove('active');
        }
      });
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); // toggle active class on thisProduct.element 
    });
  }
  initOrderForm() {
    const thisProduct = this;
    thisProduct.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }
    thisProduct.dom.cartButton.addEventListener('click', function (event) {
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

    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      for (let optionId in param.options) {
        const option = param.options[optionId];
        if (thisProduct.dom.formData[paramId] && thisProduct.dom.formData[paramId].includes(optionId)) {
          if (!option.default) {
            price += option.price;
          }
        } else {
          if (option.default) {
            price -= option.price;
          }
        }
        const foundPicture = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
        if (foundPicture) {
          if (thisProduct.dom.formData[paramId] && thisProduct.dom.formData[paramId].includes(optionId)) {
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

    thisProduct.dom.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    //console.log('amountWidget', thisProduct.amountWidget);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  prepareCartProductParams() {
    const thisProduct = this;
    const params = {};
    //console.log('thisProduct.dom.formData', thisProduct.dom.formData);
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {},
      };
      for (let optionId in param.options) {
        const option = param.options[optionId];
        if (thisProduct.dom.formData[paramId] && thisProduct.dom.formData[paramId].includes(optionId)) {
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

  prepareCartProduct() {
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

    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });
    console.log('product: thisProduct!!!!!!!!!!!!!!!!!!!!!!!!!!!', thisProduct),
    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;