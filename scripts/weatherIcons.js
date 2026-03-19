const weatherIconsURL = "https://raw.githubusercontent.com/Makin-Things/weather-icons/master/animated/";

const iconMap = {
  // Clear sky
  '01d': 'clear-day',        // clear sky day
  '01n': 'clear-night',      // clear sky night
  
  // Few clouds
  '02d': 'cloudy-1-day',     // few clouds day
  '02n': 'cloudy-1-night',   // few clouds night
  
  // Scattered clouds
  '03d': 'cloudy-2-day',     // scattered clouds day
  '03n': 'cloudy-2-night',   // scattered clouds night
  
  // Broken clouds
  '04d': 'cloudy-3-day',     // broken clouds day
  '04n': 'cloudy-3-night',   // broken clouds night
  
  // Shower rain
  '09d': 'rainy-2-day',      // shower rain day
  '09n': 'rainy-2-night',    // shower rain night
  
  // Rain
  '10d': 'rainy-1-day',      // rain day
  '10n': 'rainy-1-night',    // rain night
  
  // Thunderstorm
  '11d': 'thunderstorms',    // thunderstorm day
  '11n': 'thunderstorms',    // thunderstorm night
  
  // Snow
  '13d': 'snowy-1-day',      // snow day
  '13n': 'snowy-1-night',    // snow night
  
  // Mist/Fog
  '50d': 'fog-day',          // mist/fog day
  '50n': 'fog-night'         // mist/fog night
}

function getWeatherIconFromCode(weatherCode) {
  const icon = iconMap[weatherCode] || 'clear-day';
  return `${weatherIconsURL}${icon}.svg`;
}