// wmoCode => is a weather code from the WMO/Open-Meteo weather-code system.
// Icons array (map) => each key is an array of weather codes, and each value is an emoji icon.

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"], // sun
    [[1], "🌤"], // sunny
    [[2], "⛅️"], // sun behind cloud
    [[3], "☁️"], // cloudy
    [[45, 48], "🌫"], // Fog
    [[51, 56, 61, 66, 80], "🌦"], // light rain
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"], // moderate rain
    [[71, 73, 75, 77, 85, 86], "🌨"], // snow
    [[95], "🌩"], // thunderstorm
    [[96, 99], "⛈"], // severe thunderstorm
  ]);

  // Gets all the keys from the Map, turns them into an array, and finds the array that contains wmoCode.
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  // Gets and returns the emoji connected to the matching array codes.
  return icons.get(arr);
}

// Creating an array of Unicode code points. These will be used to build a flag emoji.
function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
// Converts each character into the special Unicode number used for regional indicator symbols. These combine into flag emojis.
    .map((char) => 127397 + char.charCodeAt());
  //  returns the flag emoji from those Unicode code points (country code).
  return String.fromCodePoint(...codePoints);
}

// Format date string default = "Year-Month-Day" into a short weekday name, such as "Mon", "Tue", or "Fri".
function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
// To  return the short weekday name, such as "Mon", "Tue", or "Fri".
    weekday: "short",
  }).format(new Date(dateStr));
}
// Location is the city name that the user will input. 
async function getWeather(location) {
  try {
    // 1) Getting location (geocoding)
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
    );
    const geoData = await geoRes.json();
    console.log(geoData);

    if (!geoData.results) throw new Error("Location not found");

    // Destructuring the first result from the geocoding API response to get the latitude, longitude, timezone, city name, and country code.
    const { latitude, longitude, timezone, name, country_code } =
      geoData.results.at(0);
    console.log(`${name} ${convertToFlag(country_code)}`);

    // 2) Getting actual weather
    const weatherRes = await fetch(
  // Builds the weather API URL using the latitude, longitude, and timezone from the geocoding response (result).
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`,
    );
    const weatherData = await weatherRes.json();
    console.log(weatherData.daily);
  } catch (err) {
    console.err(err);
  }
}
