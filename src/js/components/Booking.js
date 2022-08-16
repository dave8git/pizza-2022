import { select, settings, templates, classNames } from './../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.tableInfo;
    thisBooking.render(element);
    thisBooking.initWidget();
    thisBooking.getData();


  }
  getData() {
    const thisBooking = this;
    // console.log('thisBooking.dom.datePicker.minDate', thisBooking.datePickerElem);
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
    ]).then(function (allResponses) {
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerElem.minDate;
    const maxDate = thisBooking.datePickerElem.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;
    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);
    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += .5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
    console.log('thisBooking.booked[date]', thisBooking.booked[date]);
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePickerElem.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerElem.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }
    for (let table of thisBooking.dom.tables) {
      let tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) // metoda includes sprawdza tutaj czy ten element znajduje się w tej tablicy, 
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesDiv = thisBooking.dom.wrapper.querySelector(select.booking.tableDiv);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.widgets.starters.input);
    // console.log('phone', thisBooking.dom.wrapper);
    // console.log('starters', thisBooking.dom.starters);
  }

  initWidget() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hourAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('click', function (e) {
      e.preventDefault();
      // console.log('działa');
    });
    thisBooking.dom.hoursAmount.addEventListener('click', function (e) {
      e.preventDefault();
      // console.log('działa 1');
    });
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      thisBooking.resetTable();
      // console.log('updated selected');
    });
    thisBooking.dom.tablesDiv.addEventListener('click', function (e) {
      e.preventDefault();
      thisBooking.initTables(e);
    });
    thisBooking.dom.form.addEventListener('click', function (e) {
      e.preventDefault(); 
      thisBooking.sendBooking();
    });
  }
  initTables(e) {
    const thisBooking = this;
    if(e.target.classList.contains('table')) {
      if(e.target.classList.contains('booked')) {
        alert('Stolik jest już zarezerwowany');
      } else {
        for(let table of thisBooking.dom.tables) {
          table.classList.remove('selected');
        }
        if(e.target.getAttribute('data-table') == thisBooking.tableInfo) { // trzeba sprawdzać po atrybucie bo klasę zdejmuje pętla powyżej ^
          e.target.classList.remove('selected');
        } else {
          thisBooking.tableInfo = e.target.getAttribute('data-table');
          e.target.classList.add('selected');
        }
      }
    }
    
  }
  resetTable() {
    const thisBooking = this;
    for(let table of thisBooking.dom.tables) {
      table.classList.remove('selected');
    }
    thisBooking.tableInfo = null;
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    console.log(thisBooking.tableInfo);
    if(!thisBooking.tableInfo) {
      alert('prosimy wybrać stolik');
    } else {
      const payload = {
        date: thisBooking.datePickerElem.value,
        hour: thisBooking.hourPickerElem.value,
        table: parseInt(thisBooking.tableInfo),
        duration: thisBooking.hourAmount.value,
        ppl: thisBooking.peopleAmount.value, 
        starters: [],
        phone: thisBooking.dom.phone.value,
        mail: thisBooking.dom.address.value,
      };
      // console.log('!!!!!', thisBooking.hourPickerElem);
      for(let starter of thisBooking.dom.starters) {
        // console.log('starter', starter);
        if (starter.checked == true) {
          payload.starters.push(starter.value);
        }
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      console.log(payload);
      fetch(url, options).then(function(response) {
        return response.json();
      }).then(function (parsedReponse) {
        console.log('parsedReponse', parsedReponse);
        thisBooking.resetTable(); 
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM(); 
      });
  
    }
    
  }
}

export default Booking;