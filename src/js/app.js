import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function () {
    const thisApp = this; 

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    
    for(let page of thisApp.pages){
      if(page.id == idFromHash) {
        pageMatchingHash = page.id;
        break; // brek sprawia, że nie zostaną wykonane kolejne iteracje pętli,
      }
    }
    thisApp.activePage(pageMatchingHash);
    //console.log('thisApp.navLinks', thisApp.navLinks);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* run thisApp.activatePage with that id */
        thisApp.activePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id; // dodajemy / aby ciąg znaków (np. #/order) nie odpowiadał żadnemu hash na stronie, 
      });
    }
  },

  activePage: function(pageId) {
    const thisApp = this;
    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages) {
      page.classList.toggle('active', page.id === pageId); // w toggle możemy dodać 
    }
    /* add class "active" to matching links, remove from non matching */
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId 
      ); // w toggle możemy dodać 
    }
  },
  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      //new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    } 
    //console.log('thisApp.data:', thisApp.data);

  },
  initCart: function () {
    const thisApp = this;
    // const cartElem = document.querySelector(select.containerOf.cart);
    // thisApp.cart = new Cart(cartElem);
    // thisApp.productList = document.querySelector(select.containerOf.menu);
    // thisApp.productList.addEventListener('add-to-cart', function (e) {
    //   console.log('!!!!!!!!!!!@@@@', e.thisProduct);
    //   app.cart.add(e.thisProduct);
    // });
    // console.log('thisApp.productList', thisApp);

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      console.log(event);
      event.cart.add(event.detail.product);
    });
    console.log(thisApp.productList);
  },
  initBooking: function () {
    const thisApp = this; 
    const bookingElem = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingElem);
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    console.log('url', url);
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        thisApp.data.products = parsedResponse; /* save parsedResponse as thisApp.data.products */

        thisApp.initMenu(); /* execute initMenu method */
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();
    //thisApp.initMenu();  
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking(); 
  },
};

app.init();
