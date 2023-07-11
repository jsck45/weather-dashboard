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
      <h2>The current weather in ${city}:</h2>
      <p>Temperature: ${data.main.temp}°C</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind Speed: ${(data.wind.speed * 3.6).toFixed(0)}km/h</p>
      `;
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

document.getElementById('geocodingForm').addEventListener('submit', handleSubmit);
