import {select, templates } from './../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

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
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    
  }

  initWidget() {
    const thisBooking = this;
    thisBooking.amountWidgetElem  = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetElem = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
    //console.log(thisBooking.dom.amountWidgetElem);
    thisBooking.dom.peopleAmount.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('działa');
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('działa 1');
    });

  }
}

export default Booking;