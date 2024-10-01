const apiKey = '4874183aa6c78f710ca668bc0cee795e'; // openweatherapp api key
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

// function fetchCurrentLocationWeather is created for fetching current location using navigator object inside windows object
const fetchCurrentLocationWeather = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoords(latitude, longitude);
        }, () => {
            // if user blocks the request for fetching their geolocation the message will be shown
            alert("Unable to retrieve your location.");
        });
    } else {// if browser does not support to fetch geolocation
        alert("Geolocation is not supported by this browser.");
    }
};

// function validateCityinput is created to check whether the input city field is empty or not with regular expression
const validateCityInput = (city) => {
    if (!city) {
        alert("City name cannot be empty.");
        return false;
    }
    const regexp = /^[a-zA-Z\s]+$/;
    if (!regexp.test(city)) {
        alert("Invalid city name. Please enter a valid location.");
        return false;
    }
    return true;
};

/*fetchWeather function is created to fetch the data from the openweather app using key and if the fetch is successful then returns the
  data of the json file to the function which will further do their activities  */
const fetchWeather = (city) => {
    if (!validateCityInput(city)) {
        return;
    }
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                // if there is any issue while fetching from the server it shows an error
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
            //if there is any issue while fetching from the server it shows an error with throw error
            weatherDisplay.innerHTML = `<p class="text-red-500">Error occurred: ${error.message}</p>`;
        });
};

//fetchWeatherByCoords is created for searching the location according to the longitude and latitude
const fetchWeatherByCoords = (latitude, longitude) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        //if any error while fetching location coordinates then it will show an error
        .catch(error => {
            weatherDisplay.innerHTML = `<p class="text-red-500">Error occurred: ${error.message}</p>`;
        });
};
//displayWeather is created to show the weather which user seached for
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


// for recent city to be saved in localstorage, saveRecentCity is created
const saveRecentCity = (city) => {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentCitiesDropdown();
    }
};

//updateRecetnCitiesDropdown is created to get the cities from local storage and show them in display
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

//updateRecentCitiedDropdown is created to show the city which user has clicked from the dropdown
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

//fetchExtendedForeCast is created to fetch the 5-Day Forecast data from the server 
const fetchExtendedForecast = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayExtendedForecast(data);
        })
        // if there is any error while fetching then it will show an error
        .catch(error => {
            extendedForecast.innerHTML = `<p class="text-red-500">Error occurred: ${error.message}</p>`;
        });
};

//displayEntendedFooreCast is created to show the 5-Day Forecast Weather
const displayExtendedForecast = (data) => {
    foreCastHeading.style.display = "block";
    const forecastDays = {};

    data.list.forEach(item => {
        //dt_txt split the string and return the date only
        const date = item.dt_txt.split(' ')[0];
        if (!forecastDays[date]) {
            forecastDays[date] = [];
        }
        forecastDays[date].push(item);
    });
    // Here Object.keys gets an array of keys from the object of foreCastDays object
    // And slice put the only first 5 days weather forecast keys to an array
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

        /*Here Date is an Object from which we are getting out the local Date and setting the date in
         Indian format having 2 digit number, 2digit month, year will be numeric*/
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-'); //replace is used to replace the "\/" with "-"


        //Cards are made to show the output 5-Day Weather Forecast to display

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



// Search Button Event Handler
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim(); //trim removes the extra spaces from string if any
    fetchWeather(city);
});

// Current Button Event Handler
currentLocationBtn.addEventListener('click', () => {
    fetchCurrentLocationWeather();
});

// Event Handler using Enter Key
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        fetchWeather(city);
    }
});


updateRecentCitiesDropdown();

// recent cities change .....thorugh changing the option ....using Change Event Handler
recentCitiesSelect.addEventListener('change', (event) => {
    const city = recentCitiesSelect.value;
    if (city) {
        fetchWeather(city);
        recentCitiesSelect.value = '';
    }
});
