// JS di gestione delle chiamate e dell'utilizzo dei dati attenuti dall'API
export const setLocationObject = (locationObj, coordsObj) => {
  const { lat, lon, name, unit } = coordsObj;
  locationObj.setLat(lat);
  locationObj.setLon(lon);
  locationObj.setName(name);
  // Esiste?
  if (unit) {
    locationObj.setUnit(unit);
  }
};

// Home location è presa dal local storage, sfruttando le possibilità client side del browser
export const getHomeLocation = () => {
  return localStorage.getItem("defaultWeatherLocation");
};

// Ho le coordinate, devo attraverso l'API ricevere i dati da mostrare all'update di pagina
export const getWeatherFromCoords = async (locationObj) => {
  const urlDataObj = {
    lat: locationObj.getLat(),
    lon: locationObj.getLon(),
    units: locationObj.getUnit()
  };
  try {
    const weatherStream = await fetch("./.netlify/functions/get_weather", {
      method: "POST",
      body: JSON.stringify(urlDataObj)
    });
    const weatherJson = await weatherStream.json();
    return weatherJson;
  } catch (err) {
    console.error(err);
  }
};

export const getCoordsFromApi = async (entryText, units) => {
  const urlDataObj = {
    text: entryText,
    units: units
  };
  try {
    const dataStream = await fetch("./.netlify/functions/get_coords", {
      method: "POST",
      body: JSON.stringify(urlDataObj)
    });
    const jsonData = await dataStream.json();
    return jsonData;
  } catch (err) {
    console.error(err);
  }
};

export const cleanText = (text) => {
  const regex = / {2,}/g;
  const entryText = text.replaceAll(regex, " ").trim();
  return entryText;
};
