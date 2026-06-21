// wmoCode => is a weather code from the WMO/Open-Meteo weather-code system.
// Icons array (map) => each key is an array of weather codes, and each value is an emoji icon.
// Importance of Lifecycle Methods => They allow you to run code at specific points in a component's life, such as when it mounts, updates, or unmounts. This is crucial for tasks like fetching data, setting up subscriptions, or cleaning up resources.
// LIFECYCLE METHODS IN THIS APP:
// componentDidMount() : fetchWeather() is called when the component is first mounted to the DOM. This ensures that the initial weather data is fetched and displayed as soon as the app loads.
// componentDidUpdate(prevProps, prevState) : This lifecycle method is called after the component updates. It checks if the location in the state has changed compared to the previous state. If it has, it calls fetchWeather() again to fetch new weather data for the updated location.
// componentWillUnmount() : This lifecycle method is called just before the component is removed from the DOM. In this app, it could be used to clean up any effect (ongoing API requests or timers related to fetching weather data) when the component is unmounted

import React from "react";

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


class App extends React.Component {
  state = 
  { location: "", 
    isLoading: false,
    displayLocation: "",
    countryCode: "",
    weather: {},
    error: ""
  };


  // async fetchWeather() {
   fetchWeather = async () => {
    if(this.state.location.length < 2 )
       return this.setState({ weather: {}, 
      error: "Please enter at least 2 characters for location." });

    try {
 // Reset loading and clear any old error states
      this.setState({isLoading: true, error: ""});
    // 1) Getting location (geocoding)   
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(this.state.location)}`,
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`Location "${this.state.location}" not found.`);
    }

    // Destructuring the first result from the geocoding API response to get the latitude, longitude, timezone, city name, and country code.
    const { latitude, longitude, timezone, name, country_code } 
    = geoData.results.at(0);

    this.setState({
      displayLocation: name,
      countryCode: country_code ? country_code.toLowerCase() : ""
    });

    // 2) Getting actual weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`,
    );
    const weatherData = await weatherRes.json();
    
    if (!weatherData.daily) {
      throw new Error("Could not load weather data for this region.");
    }
    
    this.setState({ weather: weatherData.daily });

  } catch (err) {
    console.error(err);
    // Save the error to state and clear the old weather so old cards don't show up broken
    this.setState({ error: err.message, weather: {} }); 
  } finally {
    this.setState({ isLoading: false });
  }
}
  setLocation = (e) => this.setState({location: e.target.value});

  // componentDidMount() : useEffect[] works only onmount
  componentDidMount() {
    // this.fetchWeather();

   this.setState({ location: localStorage.getItem
    ("Location") || "" });
  }

  // componentDidUpdate() : useEffect[location] works both onmount and on re-render(update) 
  componentDidUpdate(prevProps, prevState) {
    if (prevState.location !== this.state.location) {
      this.fetchWeather();

      localStorage.setItem("Location", this.state.location);
    }
  }
  render() {
    return (
      <div className="app">
        <h1>Weather Forecast</h1>
        <Input locationProp={this.state.location} 
         onChangeLocationProp={this.setLocation} />

      {/* UI Feedback for Typos / Empty Responses */}
      {this.state.error && <p className="error-message"
       style={{ color: '#e53e3e', marginTop: '15px',
        fontWeight: '600' }}>{this.state.error}</p>}

      {this.state.weather.weathercode &&( 
        <Weather 
         weather= {this.state.weather}
         location={this.state.displayLocation}
         countryCode={this.state.countryCode}
        />)}
      </div>
    )
  }
}


export default App

class Input extends React.Component {
  render() {
    return (
       <div>
      <input
        type="text"
        placeholder="Search from location..."
        value={this.props.locationProp}
        onChange={this.props.onChangeLocationProp}
      />
      </div>
    )}
  }

class Weather extends React.Component {
 // componentWillUnmount() : Works after component is unmounted (removed from DOM)
  componentWillUnmount() {
    console.log("Weather component is being unmounted. Cleaning up...");
  }
  render() {
   // Destructure the weatherProp object
    const {
      temperature_2m_max: maxTemp,
       temperature_2m_min: minTemp, 
       time: dates,
       weathercode: codes,
      } = this.props.weather;

      return (
        <div>
          <h2>Weather {this.props.location}
         <img 
        src={`https://flags.restcountries.com/v5/w320/${this.props.countryCode}.png`} 
        alt="Country Flag" 
        style={{ 
          width: '32px', 
          marginLeft: '12px', 
          verticalAlign: 'middle', 
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}
     />

          </h2>
          <ul className="weather">
            {dates.map((date, i) => (
              <Day
              dateProp={date}
              maxTempProp={maxTemp.at(i)}
              minTempProp={minTemp.at(i)}
              codeProp={codes.at(i)}
              key={date}
              isToday={i === 0}
              />
            ))}
          </ul>
        </div>
      )
  }
}

class Day extends React.Component {
  render() {
    // Destructure Day object
    const { 
      dateProp,  
      maxTempProp, 
      minTempProp, 
      codeProp, 
      isToday } = this.props;

    return (
      <li className="day">
        <span>{getWeatherIcon(codeProp)}</span>
        <p>{isToday ? "Today" : formatDay(dateProp)}</p>
        <p> 
          {Math.floor(minTempProp)}&deg; &mdash;
           <strong>{Math.ceil(maxTempProp)}&deg; </strong>
        </p>
       </li>

    )
  }
}
