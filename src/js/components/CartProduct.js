import {select} from './../settings.js';
import AmountWidget from './AmountWidget.js';
export class CartProduct {
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
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;

    thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    thisCartProduct.dom.amountWidgetElem = element.querySelector(select.cartProduct.amountWidget);
  }
  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
    thisCartProduct.dom.amountWidgetElem.addEventListener('click', function () {
      thisCartProduct.price = thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;
      //console.log('thisCartProduct', thisCartProduct.price);
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      //console.log(thisCartProduct.priceSingle);
    });
  }
  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
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
  getData() {
    const thisCartProduct = this;
    const cartProductSummary = {};
    cartProductSummary.id = thisCartProduct.id;
    cartProductSummary.amount = thisCartProduct.amount;
    cartProductSummary.price = thisCartProduct.price;
    cartProductSummary.priceSingle = thisCartProduct.priceSingle;
    cartProductSummary.name = thisCartProduct.name;
    cartProductSummary.params = thisCartProduct.params;

    return cartProductSummary;
  }
}

export default CartProduct;