const apiKey = '4874183aa6c78f710ca668bc0cee795e';
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const cityInput = document.getElementById('cityInput');
const weatherDisplay = document.getElementById('weatherDisplay');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');
const recentCitiesSelect = document.getElementById('recentCities');
const extendedForecast = document.getElementById('extendedForecast');
const selectedCityDisplay = document.getElementById('selectedCityDisplay');
const foreCastHeading = document.getElementById('heading');
const result = document.getElementById("results");
foreCastHeading.style.display = "none";
result.style.display="none";


const fetchCurrentLocationWeather = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        }, () => {
            alert("Unable to retrieve your location.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};


const validateCityInput = (city) => {
    if (!city) {
        alert("City name cannot be empty.");
        return false;
    }
    const regex = /^[a-zA-Z\s]+$/;
    if (!regex.test(city)) {
        alert("Invalid city name. Please enter a valid location.");
        return false;
    }
    return true;
};


const fetchWeather = (city) => {
    if (!validateCityInput(city)) {
        return;
    }
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            saveRecentCity(city);
            cityInput.value = '';
            recentCitiesSelect.value = '';
        })
        .catch(error => {
            weatherDisplay.innerHTML = `<p class="text-red-500">Error occurred: ${error.message}</p>`;
        });
};


const fetchWeatherByCoords = (latitude, longitude) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            weatherDisplay.innerHTML = `<p class="text-red-500">Error occurred: ${error.message}</p>`;
        });
};

const displayWeather = (data) => {
    result.style.display = "block";
    const { main, wind, weather } = data;
    weatherDisplay.innerHTML = `
        <div class="p-6 text-center">
            <h2 class="text-2xl font-bold text-blue-600">${data.name}</h2>
            <p class="text-xl mt-2">Temperature: <span class="font-semibold text-red-600">${main.temp}°C</span></p>
            <p class="text-lg">Humidity: <span class="font-semibold text-red-600">${main.humidity}%</span></p>
            <p class="text-lg">Wind Speed: <span class="font-semibold text-red-600">${wind.speed} m/s</span></p>
            <div class="flex justify-center">
                <img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" alt="${weather[0].description}" class="mx-auto mt-2 w-24 h-24">
            </div>
            <p class="text-sm text-gray-500 mt-2 capitalize">${weather[0].description}</p>
        </div>
    `;
    fetchExtendedForecast(data.coord.lat, data.coord.lon);
};



const saveRecentCity = (city) => {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentCitiesDropdown();
    }
};

const updateRecentCitiesDropdown = () => {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCitiesDropdown.classList.toggle('hidden', recentCities.length === 0);
    recentCitiesSelect.innerHTML = '<option value="">Recently Searched Cities</option>';

    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesSelect.appendChild(option);
    });


    recentCitiesSelect.addEventListener('change', (event) => {
        const selectedCity = event.target.value;
        if (selectedCity) {
            recentCitiesSelect.options[0].textContent = selectedCity;
            selectedCityDisplay.textContent = `Selected City: ${selectedCity}`;
        } else {
            recentCitiesSelect.options[0].textContent = 'Recently Searched Cities';
            selectedCityDisplay.textContent = '';
        }
    });
};


updateRecentCitiesDropdown();


const fetchExtendedForecast = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayExtendedForecast(data);
        })
        .catch(error => {
            extendedForecast.innerHTML = `<p class="text-red-500">Error occurred: ${error.message}</p>`;
        });
};


const displayExtendedForecast = (data) => {
    foreCastHeading.style.display = "block";
    const forecastDays = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!forecastDays[date]) {
            forecastDays[date] = [];
        }
        forecastDays[date].push(item);
    });

    const dayKeys = Object.keys(forecastDays).slice(0, 5);


    extendedForecast.innerHTML = '';

    
    const forecastContainer = document.createElement('div');
    forecastContainer.className = 'forecast-grid';

    dayKeys.forEach(date => {
        const items = forecastDays[date];
        const avgTemp = items.reduce((sum, item) => sum + item.main.temp, 0) / items.length;
        const avgHumidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;
        const avgWindSpeed = items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length;
        const icon = items[0].weather[0].icon;
        const description = items[0].weather[0].description;

        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <h4 class="font-bold text-gray-700">${formattedDate}</h4>
            <div class="flex justify-center">
                <img src="http://openweathermap.org/img/wn/${icon}.png" alt="weather icon" class="weather-icon">
            </div>
            <p class="text-lg">Description: <span class="font-semibold text-red-600">${description}</span></p>
            <p class="text-lg">Temperature: <span class="font-semibold text-red-600">${avgTemp.toFixed(1)}°C</span></p>
            <p class="text-lg">Humidity: <span class="font-semibold text-red-600">${avgHumidity.toFixed(1)}%</span></p>
            <p class="text-lg">Wind Speed: <span class="font-semibold text-red-600">${avgWindSpeed.toFixed(1)} m/s</span></p>
        `;

        forecastContainer.appendChild(forecastCard);
    });

    extendedForecast.appendChild(forecastContainer);
};




searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    fetchWeather(city);
});

currentLocationBtn.addEventListener('click', () => {
    fetchCurrentLocationWeather();
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        fetchWeather(city);
    }
});


updateRecentCitiesDropdown();


recentCitiesSelect.addEventListener('change', (event) => {
    const city = recentCitiesSelect.value;
    if (city) {
        fetchWeather(city);
        recentCitiesSelect.value = '';
    }
});
