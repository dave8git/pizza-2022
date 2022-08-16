import {select, templates, classNames} from './../settings.js';
import {utils} from './../utils.js';

export class Home {
  constructor(element) {
    const thisProduct = this; 
    thisProduct.render(element);
  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.menu(element); // generate HTML based on template 
    thisHome.element = utils.createDOMFromHTML(generatedHTML); // create element using utils.createElementFromHTML
    const homeContainer = document.querySelector(select.containerOf.home);// find menu container 
    homeContainer.appendChild(thisHome.element); // add element to menu 
  }
}

export default Home;