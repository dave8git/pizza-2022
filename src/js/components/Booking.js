import {select, templates } from './../settings.js';
import AmountWidget from './AmountWidget.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element); 
    thisBooking.initWidget();   

  }
  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget(element);
    //thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    thisBooking.dom = {}; 
    thisBooking.dom.wrapper = document.querySelector(select.containerOf.booking);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    
    
  }

  initWidget() {
    const thisBooking = this;
    thisBooking.amountWidgetElem  = new AmountWidget(thisBooking.dom.peopleAmount);

    console.log(thisBooking.dom.amountWidgetElem);
    thisBooking.dom.peopleAmount.addEventListener('click', function () {
      console.log('działa');
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function() {
      console.log('działa 1');
    });

  }
}

export default Booking;