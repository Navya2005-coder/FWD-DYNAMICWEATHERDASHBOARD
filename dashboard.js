// Check if user is logged in, otherwise redirect to login page
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!loggedInUser) {
  window.location.href = 'index.html';
}


// Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastWeatherDiv = document.getElementById('forecastWeather');
const locationChoicesDiv = document.getElementById('locationChoices');
const logoutBtn = document.getElementById('logoutBtn');
// Logout button handler
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = 'index.html';
});
// Search button handler
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city, village or country name');
    return;
  }
// Clear previous results
  currentWeatherDiv.innerHTML = '';
  forecastWeatherDiv.innerHTML = '';
  locationChoicesDiv.innerHTML = '';

  getCoordinates(city)
    .then(locations => {
      if (locations.length === 1) {
        const loc = locations[0];
        const state = loc.state ? `, ${loc.state}` : '';
        const fullName = `${loc.name}${state}${loc.country ? ', ' + loc.country : ''}`;
        fetchAndDisplayWeather(loc.lat, loc.lon, fullName);
      } else if (locations.length > 1) {
        showLocationChoices(locations);
      } else {
        currentWeatherDiv.innerText = 'Location not found';
      }
    })
    .catch(err => {
      console.error(err);
      currentWeatherDiv.innerText = 'Error finding location';
    });
});

// Get up to 5 locations matching input string
function getCoordinates(city) {
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`;
  return fetch(geoUrl)
    .then(resp => resp.json())
    .then(data => {
      if (!data || data.length === 0) return [];
      // Try exact match ignoring case
      const exactMatch = data.find(item => item.name.toLowerCase() === city.toLowerCase());
      if (exactMatch) return [exactMatch];
      return data;
    });
}

// Show location choices if multiple found
function showLocationChoices(locations) {
  locationChoicesDiv.innerHTML = '<h3>Multiple locations found. Please select one:</h3>';

  locations.forEach(loc => {
    const locName = loc.name;
    const state = loc.state ? `, ${loc.state}` : '';
    const country = loc.country ? `, ${loc.country}` : '';
    const button = document.createElement('button');
    button.innerText = `${locName}${state}${country}`;
    button.style.margin = '5px';
    button.addEventListener('click', () => {
      locationChoicesDiv.innerHTML = '';
      const fullName = `${locName}${state}${country}`;
      fetchAndDisplayWeather(loc.lat, loc.lon, fullName);
    });
    locationChoicesDiv.appendChild(button);
  });
}

// Fetch and display weather info
function fetchAndDisplayWeather(lat, lon, locationName) {
  getCurrentWeatherByCoords(lat, lon, locationName);
  getForecastByCoords(lat, lon);
}

function getCurrentWeatherByCoords(lat, lon, locationName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  fetch(url)
    .then(resp => resp.json())
    .then(data => {
      if (data.cod !== 200) {
        currentWeatherDiv.innerText = 'Weather data not found';
        return;
      }

      currentWeatherDiv.innerHTML = `
        <h2>Weather in ${locationName || data.name}</h2>
        <p>🌡️ Temperature: ${data.main.temp} °C</p>
        <p>☁️ Condition: ${data.weather[0].main} - ${data.weather[0].description}</p>
        <p>💧 Humidity: ${data.main.humidity}% | 🌬️ Wind: ${data.wind.speed} m/s</p>
      `;

      setWeatherBackground(data.weather[0].main);
    })
    .catch(() => {
      currentWeatherDiv.innerText = 'Error fetching weather data';
    });
}

function getForecastByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  fetch(url)
    .then(resp => resp.json())
    .then(data => {
      if (data.cod !== "200") {
        forecastWeatherDiv.innerText = 'Forecast data not available';
        return;
      }

      const forecastAtNoon = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);

      let forecastHTML = '<h3>5-Day Forecast</h3><div class="forecast-container">';

      forecastAtNoon.forEach(item => {
        const date = new Date(item.dt_txt);
        const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
        forecastHTML += `
          <div class="forecast-day">
            <p><strong>${dayName}</strong></p>
            <p>🌡️ ${item.main.temp.toFixed(1)}°C</p>
            <p>☁️ ${item.weather[0].main}</p>
          </div>
        `;
      });

      forecastHTML += '</div>';
      forecastWeatherDiv.innerHTML = forecastHTML;
    })
    .catch(() => {
      forecastWeatherDiv.innerText = 'Error fetching forecast';
    });
}

// Change background based on weather condition
function setWeatherBackground(condition) {
  const body = document.body;
  body.className = ''; // Clear previous

  const cond = condition.toLowerCase();

  if (cond.includes('clear')) {
    body.classList.add('clear-bg');
  } else if (cond.includes('cloud')) {
    body.classList.add('clouds-bg');
  } else if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm')) {
    body.classList.add('rain-bg');
  } else if (cond.includes('snow')) {
    body.classList.add('snow-bg');
  } else if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || cond.includes('smoke')) {
    body.classList.add('mist-bg');
  } else {
    body.classList.add('default-bg');
  }
}
