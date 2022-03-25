// Ho deciso di adottare questo scaffolding di divisione dei JS rendendomi conto di quanto main.js si stesse appensantendo, sfruttando js multipli ed i relativi import ho maggiore controllo sulle funzioni, il loro scopo ed il loro utilizzo

// Import funzioni da dataFunctions.js
import {
  setLocationObject,
  getHomeLocation,
  getWeatherFromCoords,
  getCoordsFromApi,
  cleanText
} from "./dataFunctions.js";
// Import funzioni da dataFunctions.js
import {
  setPlaceholderText,
  addSpinner,
  displayError,
  displayApiError,
  updateScreenReaderConfirmation,
  updateDisplay
} from "./domFunctions.js";

// Importo la classe CurrentLocation che ho creato in un JS separato e creo l'istanza
import CurrentLocation from "./CurrentLocation.js";
const currentLoc = new CurrentLocation();

// Inizializzazione tramite interazione utente delle features dell'applicazione
const initApp = () => {
  // Listeners
  const geoButton = document.getElementById("getLocation");
  geoButton.addEventListener("click", getGeoWeather);
  const homeButton = document.getElementById("home");
  homeButton.addEventListener("click", loadWeather);
  const saveButton = document.getElementById("saveLocation");
  saveButton.addEventListener("click", saveLocation);
  const unitButton = document.getElementById("unit");
  unitButton.addEventListener("click", setUnitPref);
  const refreshButton = document.getElementById("refresh");
  refreshButton.addEventListener("click", refreshWeather);
  const locationEntry = document.getElementById("searchBar__form");
  locationEntry.addEventListener("submit", submitNewLocation);
  // Set up
  setPlaceholderText();
  // Load
  loadWeather();
};

// Al render del DOM lancio initApp, l'utente può interagire con i listener posti al suo interno
document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) => {
  if (event && event.type === "click") {
    const mapIcon = document.querySelector(".fa-map-marker-alt");
    // Spinner di loading creato nel file domFunction.js
    addSpinner(mapIcon);
  }
  // Sfrutto il geolocation interno al browser
  // Error (non supportato)
  if (!navigator.geolocation) return geoError();
  // Success (supportato)
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

// Errore, per esempio quando l'utente nega la geolocalizzazione del browser e non posso ricavare l'attuale lat/long
const geoError = (errObj) => {
  const errMsg = errObj ? errObj.message : "Geolocation not supported";
  displayError(errMsg, errMsg);
};

// Success, posso accedere ai dati relativi alla latitudine e longitudine attuale dell'utente in modo da avere come landing la sua attuale posizione e mostrare i relativi dati
const geoSuccess = (position) => {
  const myCoordsObj = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`
  };
  // Pick data da dataFunction.js in caso di success
  setLocationObject(currentLoc, myCoordsObj);
  updateDataAndDisplay(currentLoc);
};

const loadWeather = (event) => {
  // Caso in cui l'utente ha salvato una home location
  const savedLocation = getHomeLocation();
  // No save location e no event
  if (!savedLocation && !event) return getGeoWeather();
  // No save location e event lanciato
  if (!savedLocation && event.type === "click") {
    displayError(
      "No Home Location Saved.",
      "Sorry. Please save your home location first."
    );
  } 
  // Location salvata e nessun evento lanciato
  else if (savedLocation && !event) {
    displayHomeLocationWeather(savedLocation);
  } 
  // Location salvata e evento lanciato
  else {
    const homeIcon = document.querySelector(".fa-home");
    addSpinner(homeIcon);
    displayHomeLocationWeather(savedLocation);
  }
};

// Display di HomeLocationWeather basato sui data presi da local storage
const displayHomeLocationWeather = (home) => {
  if (typeof home === "string") {
    // Parse delle stringhe provenienti dal local storage
    const locationJson = JSON.parse(home);
    const myCoordsObj = {
      lat: locationJson.lat,
      lon: locationJson.lon,
      name: locationJson.name,
      unit: locationJson.unit
    };
    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
  }
};

const saveLocation = () => {
  if (currentLoc.getLat() && currentLoc.getLon()) {
    const saveIcon = document.querySelector(".fa-save");
    addSpinner(saveIcon);
    const location = {
      name: currentLoc.getName(),
      lat: currentLoc.getLat(),
      lon: currentLoc.getLon(),
      unit: currentLoc.getUnit()
    };
    localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
    updateScreenReaderConfirmation(
      `Saved ${currentLoc.getName()} as home location.`
    );
  }
};

const setUnitPref = () => {
  const unitIcon = document.querySelector(".fa-chart-bar");
  addSpinner(unitIcon);
  currentLoc.toggleUnit();
  updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
  const refreshIcon = document.querySelector(".fa-sync-alt");
  addSpinner(refreshIcon);
  updateDataAndDisplay(currentLoc);
};

const submitNewLocation = async (event) => {
  event.preventDefault();
  const text = document.getElementById("searchBar__text").value;
  const entryText = cleanText(text);
  if (!entryText.length) return;
  const locationIcon = document.querySelector(".fa-search");
  addSpinner(locationIcon);
  const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
  if (coordsData) {
    if (coordsData.cod === 200) {
      const myCoordsObj = {
        lat: coordsData.coord.lat,
        lon: coordsData.coord.lon,
        name: coordsData.sys.country
          ? `${coordsData.name}, ${coordsData.sys.country}`
          : coordsData.name
      };
      setLocationObject(currentLoc, myCoordsObj);
      updateDataAndDisplay(currentLoc);
    } else {
      displayApiError(coordsData);
    }
  } else {
    displayError("Connection Error", "Connection Error");
  }
};

// Update data + display info quando ricevo i data
const updateDataAndDisplay = async (locationObj) => {
  console.log(locationObj);
  const weatherJson = await getWeatherFromCoords(locationObj);
  if (weatherJson) updateDisplay(weatherJson, locationObj);
};
