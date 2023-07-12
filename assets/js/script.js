var currentDate = dayjs();
  var formattedDate = currentDate.format('ddd D MMM, YYYY');
  document.getElementById('formattedDate').textContent = formattedDate;

// Function to handle form submission for geocoding
function handleSubmit(event) {
  event.preventDefault();

  // Get the city value from the input field
  var city = document.getElementById('city').value;

  // Make the API call to OpenWeatherMap Geocoding API
  var geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=d460e8dccd9357124bd36c9cb150895c`;

  fetch(geocodingUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // Extract latitude and longitude from the API response
      var latitude = data[0]?.lat;
      var longitude = data[0]?.lon;

      if (latitude && longitude) {
        
        getWeather(city, latitude, longitude); 
        getForecast(city,latitude, longitude);
      } else {
        console.log('Latitude or longitude not found in the API response.');
      }
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

// Function to make the API call for weather data
function getWeather(city, latitude, longitude) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=d460e8dccd9357124bd36c9cb150895c&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      var weatherDiv = document.getElementById('weather');
      weatherDiv.innerHTML = `
      <h3>The current weather in ${city}:</h3>
      <p>Temperature: ${data.main.temp.toFixed(0)}&deg;C</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${(data.wind.speed * 3.6).toFixed(0)}km/h</p>
      `;
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

function getForecast(city, latitude, longitude) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=d460e8dccd9357124bd36c9cb150895c&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      var forecastDaysDiv = document.getElementById('forecastDays');
      forecastDaysDiv.innerHTML = "";
      var forecastByDay = {};

      for (let index = 0; index < data.list.length; index++) {
        var forecast = data.list[index];
        var forecastTime = new Date(forecast.dt * 1000);
        var forecastDate = forecastTime.toLocaleDateString('en-GB').split('/').reverse().join('');

        if (forecastByDay[forecastDate]) {
          continue;
        }

        forecastByDay[forecastDate] = forecast;

        var humidity = forecast.main.humidity;
        var windSpeed = forecast.wind.speed * 3.6;
        var temperature = forecast.main.temp;
        var description = forecast.weather[0].description;

        var forecastElement = document.createElement("div"); // Create a div container for each day's forecast
        forecastElement.classList.add("forecast-box"); // Add a CSS class for styling

        var iconCode = forecast.weather[0].icon; // Get the icon code
        var iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`; // Construct the icon URL

        forecastElement.innerHTML = `
          <p><strong>${forecastTime.toLocaleDateString()}</strong></p>
          <img src="${iconUrl}" alt="Weather Icon"> 
          <p>${description}</p>
          <p>Temp: ${temperature.toFixed(0)}&deg;C</p>
          <p>Humidity: ${humidity}%</p>
          <p>Wind Speed: ${windSpeed.toFixed(0)} km/h</p>
        `;

        forecastDaysDiv.appendChild(forecastElement);
      }
    })
    .catch(error => {
      console.log('Error:', error);
    });
}


document.getElementById('geocodingForm').addEventListener('submit', handleSubmit);
