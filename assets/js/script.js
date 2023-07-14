// add today's date
const currentDate = dayjs();
const formattedDate = currentDate.format('dddd,') + "<br>" + currentDate.format('D MMMM') + "<br>" + currentDate.format('YYYY');document.getElementById('formattedDate').innerHTML = formattedDate;
document.getElementById('formattedDate').innerHTML = formattedDate;

// on form submission, relevant data is fetched from the open weather API and displayed on the page
function handleSubmit(event) {
  event.preventDefault();

  const city = document.getElementById('city').value;

  saveSearch(city);

  // lat/long is detected from user input as the weather API requires it
  const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=d460e8dccd9357124bd36c9cb150895c`;

  fetch(geocodingUrl)
    .then(response => response.json())
    .then(data => {
      console.log(data);

      const latitude = data[0]?.lat;
      const longitude = data[0]?.lon;

      if (latitude && longitude) {
        getWeather(city, latitude, longitude); 
        getForecast(city, latitude, longitude);
      } else {
        console.log('Latitude or longitude not found in the API response.');
      }
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

// lat/long is input into the API fetch to return results for the current weather
function getWeather(city, latitude, longitude) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=d460e8dccd9357124bd36c9cb150895c&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const weatherDiv = document.getElementById('weather');
      weatherDiv.innerHTML = `
        <h5 class="pb-2">Currently in ${city}:</h5>
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

// function for 5 day forecast
function getForecast(city, latitude, longitude) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=d460e8dccd9357124bd36c9cb150895c&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const forecastDaysDiv = document.getElementById('forecastDays');
      forecastDaysDiv.innerHTML = "";
      const forecastByDay = {};

      for (let index = 0; index < data.list.length; index++) {
        const forecast = data.list[index];
        const forecastTime = new Date(forecast.dt * 1000);
        const forecastDate = forecastTime.toLocaleDateString('en-GB').split('/').reverse().join('');

        if (forecastByDay[forecastDate]) {
          continue;
        }

        forecastByDay[forecastDate] = forecast;

        if (Object.keys(forecastByDay).length === 1) {
          continue;
        }

        const humidity = forecast.main.humidity;
        // multiplied by 3.6 to convert the wind speed from m/s to km/hr
        const windSpeed = forecast.wind.speed * 3.6;
        const temperature = forecast.main.temp;
        const description = forecast.weather[0].description;

        const forecastElement = document.createElement("div");
        forecastElement.classList.add("forecast-box");

        const iconCode = forecast.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

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

// save recent searches to local storage and append it to the list
function saveSearch(city) {
  const searches = localStorage.getItem('recentSearches');
  let searchArray = searches ? JSON.parse(searches) : [];

  if (searchArray.includes(city)) {
    return;
  }

  searchArray.push(city);

  if (searchArray.length > 5) {
    searchArray = searchArray.slice(-5);
  }

  localStorage.setItem('recentSearches', JSON.stringify(searchArray));
  displayRecentSearches();
}

function displayRecentSearches() {
  const recentSearchesDiv = document.getElementById('recentSearches');
  recentSearchesDiv.innerHTML = "<h5>Recent Searches</h5>";

  const searches = localStorage.getItem('recentSearches');
  const searchArray = searches ? JSON.parse(searches) : [];

  for (let i = searchArray.length - 1; i >= 0; i--) {
    const searchItem = document.createElement("a");
    searchItem.textContent = searchArray[i];
    // make the list items a link that will repopulate the input field and display results
    searchItem.href = "#";
    searchItem.classList.add("recent-search-link");
    searchItem.addEventListener("click", handleRecentSearchClick);
    recentSearchesDiv.appendChild(searchItem);
  }
}

function handleRecentSearchClick(event) {
  event.preventDefault();
  const city = event.target.textContent;
  document.getElementById('city').value = city;
  handleSubmit(event);
}

displayRecentSearches();
document.getElementById('geocodingForm').addEventListener('submit', handleSubmit);
