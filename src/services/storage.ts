export default class Storage {

  static get(item: string) {
    return JSON.parse(window.localStorage.getItem(item) || "false")
  }

  static set(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value))
  }

}
