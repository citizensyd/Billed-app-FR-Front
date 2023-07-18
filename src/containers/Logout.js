import { ROUTES_PATH } from '../constants/routes.js'

export default class Logout {
  constructor({ document, onNavigate, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.localStorage = localStorage
    $('#layout-disconnect').click(this.handleClick)
  }
  
  handleClick = (e) => {
    console.log("handleClick clear local storage");
    this.localStorage.clear()
    this.onNavigate(ROUTES_PATH['Login'])
  }
} 