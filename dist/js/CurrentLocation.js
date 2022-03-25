// Creo la classe current location
export default class CurrentLocation {
  constructor() {
    // Proprietà private della classe current
    this._name = "Current Location";
    this._lat = null;
    this._lon = null;
    this._unit = "metric";
  }

  // Getter delle proprietà della mia classe, dinamicamente popolate tramite API
  getName() {
    return this._name;
  }

  setName(name) {
    this._name = name;
  }

  getLat() {
    return this._lat;
  }

  setLat(lat) {
    this._lat = lat;
  }

  getLon() {
    return this._lon;
  }

  setLon(lon) {
    this._lon = lon;
  }

  getUnit() {
    return this._unit;
  }

  setUnit(unit) {
    this._unit = unit;
  }

  // Gestione cambiamento unità di misura, inizialmente impostata su metrica
  toggleUnit() {
    this._unit = this._unit === "metric" ? "imperial" : "metric";
  }
}
