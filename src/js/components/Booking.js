import { select, settings, templates } from './../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();

  }
  getData() {
    const thisBooking = this;
    console.log('thisBooking.dom.datePicker.minDate', thisBooking.datePickerElem);
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
        + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsRepeat.join('&'),
    };
    Promise.all([
      fetch(urls.booking), // Promise wykona pewne operacje i potem przejdzie niżej do then ---> 
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ]).then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(), 
          eventsRepeatResponse.json(),
        ])
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat); 
        //thisBooking.parseData(bookings,eventsCurrent,eventsRepeat);
      }); 
  }

  // parseData(booking, eventsCurrent, eventsRepeat) {
  //   const thisBooking = this; 


  // }

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
    thisBooking.amountWidgetElem = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidgetElem = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
    //console.log(thisBooking.dom.amountWidgetElem);
    thisBooking.dom.peopleAmount.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('działa');
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('działa 1');
    });

  }
}

export default Booking;