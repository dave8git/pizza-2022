import { settings, select, classNames, templates } from './../settings.js';
import utils from './../utils.js';
import CartProduct from './CartProduct.js';
export class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initAction();
  }

  getElements(element) {
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
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    // console.log(thisCart.dom.deliveryFee);
  }
  initAction() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

    

  remove(cartProduct) {
    const thisCart = this;
    cartProduct.dom.wrapper.remove();
    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    thisCart.update();
  }
  add(menuProduct) {
    const thisCart = this;
    // console.log('menuProduct!!!!!!!!!!!!!!!!!!', menuProduct);
    const generatedHTML = templates.cartProduct(menuProduct);
    thisCart.element = utils.createDOMFromHTML(generatedHTML);
    const cartContainer = document.querySelector(select.cart.productList);
    //console.log(cartContainer);
    cartContainer.appendChild(thisCart.element); // add element to menu 
    
    thisCart.products.push(new CartProduct(menuProduct, thisCart.element));
    //console.log('thisCart.products', thisCart.products); 
    thisCart.update();
  }
  update() {
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    thisCart.products.forEach(product => {
      thisCart.totalNumber++;
      thisCart.subtotalPrice += product.price;
      //console.log('product', product);
    });
    //console.log(subtotalPrice);
    if (thisCart.totalNumber != 0) {
      thisCart.totalPrice = thisCart.deliveryFee + thisCart.subtotalPrice;
    } else {
      thisCart.totalPrice = 0;
      //deliveryFee = 0;
      thisCart.subtotalPrice = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalPrice.forEach(total => {
      total.innerHTML = thisCart.totalPrice;
    });
    // console.log(thisCart.dom.totalPrice);
    // console.log(thisCart.totalPrice);
  }
  sendOrder() { // aby przetestowa ta funkcje nalezy oczywiscie kliknac ORDER w koszyku; 
    const thisCart = this;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber, 
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    // console.log('payload.address', payload.address);
    // console.log('payload.phone', payload.phone);
    // console.log('payload.totalPrice', payload.totalPrice);
    // console.log('payload.subtotalPrice', payload.subtotalPrice);
    // console.log('payload.totalNumber', payload.totalNumber);
    // console.log('payload.delivery', payload.deliveryFee);
      
    const url = settings.db.url + '/' + settings.db.orders;
    // console.log(url);

    for(let prod of thisCart.products) {
      // console.log('prod', prod);
      payload.products.push(prod.getData());

    }

    // console.log('payload.products', payload.products);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options);
  }
}

export default Cart;