var currentDate = dayjs();
var formattedDate = currentDate.format('dddd,') + "<br>" + currentDate.format('D MMMM') + "<br>" + currentDate.format('YYYY');
document.getElementById('formattedDate').innerHTML = formattedDate;


// Function to handle form submission for geocoding
function handleSubmit(event) {
  event.preventDefault();

  // Get the city value from the input field
  var city = document.getElementById('city').value;

  saveSearch(city);

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
      <h5 class = "pb-2">Currently in ${city}:</h5>
      <div class="weather-info">

      <div id="large-temp">${data.main.temp.toFixed(0)}&deg;C
          <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon" class="weather-icon">
          </div>
          <div class="weather-details">
            <p>${data.weather[0].description}</p>
            <p>Temperature: ${data.main.temp.toFixed(0)}&deg;C</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind Speed: ${(data.wind.speed * 3.6).toFixed(0)} km/h</p>
          </div>
          
          

        </div>
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

        if (Object.keys(forecastByDay).length === 1) {
          continue;
        }

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
          <p>Temperature: ${temperature.toFixed(0)}&deg;C</p>
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

// Function to save the city to local storage
function saveSearch(city) {
  var searches = localStorage.getItem('recentSearches');
  var searchArray = searches ? JSON.parse(searches) : [];

  // Check if the city is already in the recent searches
  if (searchArray.includes(city)) {
    return; // Don't save duplicate entries
  }

  // Add the city to the recent searches
  searchArray.push(city);

  // Limit the recent searches to 5 entries
  if (searchArray.length > 6) {
    searchArray = searchArray.slice(-6);
  }

  // Save the updated recent searches to local storage
  localStorage.setItem('recentSearches', JSON.stringify(searchArray));

  // Update the recent searches display
  displayRecentSearches();
}

// Function to display the recent searches
function displayRecentSearches() {
  var recentSearchesDiv = document.getElementById('recentSearches');
  recentSearchesDiv.innerHTML = "<h5>Recent Searches</h5>";

  var searches = localStorage.getItem('recentSearches');
  var searchArray = searches ? JSON.parse(searches) : [];

  for (var i = searchArray.length - 1; i >= 0; i--) {
    var searchItem = document.createElement("a");
    searchItem.textContent = searchArray[i];
    searchItem.href = "#";
    searchItem.classList.add("recent-search-link");
    searchItem.addEventListener("click", handleRecentSearchClick);
    recentSearchesDiv.appendChild(searchItem);
  }
}

function handleRecentSearchClick(event) {
  event.preventDefault();
  var city = event.target.textContent;
  document.getElementById('city').value = city; // Set the input field value to the selected city
  handleSubmit(event); // Trigger form submission to retrieve weather results
}

// Call the displayRecentSearches function on page load
displayRecentSearches();

document.getElementById('geocodingForm').addEventListener('submit', handleSubmit);
