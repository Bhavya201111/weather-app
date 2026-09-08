const API_URL = "http://127.0.0.1:8000";


async function searchWeather() {

    const input =
        document.getElementById("cityInput");

    const city =
        input.value.trim();


    if (!city) {

        showError("Please enter a city name.");

        return;
    }


    clearError();

    showLoading("Searching...");


    try {

        // STEP 1:
        // Ask FastAPI to find city coordinates

        const locationResponse =
            await fetch(
                `${API_URL}/geocode?city=${encodeURIComponent(city)}`
            );


        if (!locationResponse.ok) {

            throw new Error(
                "City not found."
            );
        }


        const location =
            await locationResponse.json();


        // STEP 2:
        // Ask FastAPI for weather

        showLoading("Getting weather...");


        const weatherResponse =
            await fetch(
                `${API_URL}/weather?latitude=${location.latitude}&longitude=${location.longitude}`
            );


        if (!weatherResponse.ok) {

            throw new Error(
                "Could not get weather."
            );
        }


        const weather =
            await weatherResponse.json();


        // STEP 3:
        // Display weather

        displayWeather(
            location,
            weather
        );

    }


    catch (error) {

        console.error(error);

        showError(
            error.message
        );

    }


    finally {

        showLoading("");

    }

}


function displayWeather(
    location,
    data
) {

    const current =
        data.current;

    const daily =
        data.daily;


    document.getElementById("cityName")
        .innerText =
        `${location.name}, ${location.country}`;


    document.getElementById("temperature")
        .innerText =
        Math.round(
            current.temperature_2m
        );


    document.getElementById("humidity")
        .innerText =
        current.relative_humidity_2m;


    document.getElementById("wind")
        .innerText =
        current.wind_speed_10m;


    document.getElementById("condition")
        .innerText =
        getWeatherDescription(
            current.weather_code
        );


    displayForecast(daily);

}


function displayForecast(daily) {

    const forecast =
        document.getElementById("forecast");


    forecast.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        const date =
            new Date(
                daily.time[i]
            );


        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const weather =
            getWeatherDescription(
                daily.weather_code[i]
            );


        const icon =
            getWeatherIcon(
                daily.weather_code[i]
            );


        card.innerHTML = `

            <div class="date">
                ${day}
            </div>

            <div class="icon">
                ${icon}
            </div>

            <div>
                ${weather}
            </div>

            <div class="max">
                ${Math.round(
                    daily.temperature_2m_max[i]
                )}°C
            </div>

            <div class="min">
                ${Math.round(
                    daily.temperature_2m_min[i]
                )}°C
            </div>

        `;


        forecast.appendChild(card);

    }

}


function getWeatherDescription(code) {

    const descriptions = {

        0: "Clear sky",

        1: "Mainly clear",

        2: "Partly cloudy",

        3: "Overcast",

        45: "Fog",

        48: "Fog",

        51: "Light drizzle",

        53: "Drizzle",

        55: "Heavy drizzle",

        61: "Light rain",

        63: "Rain",

        65: "Heavy rain",

        71: "Light snow",

        73: "Snow",

        75: "Heavy snow",

        80: "Rain showers",

        81: "Rain showers",

        82: "Heavy rain showers",

        95: "Thunderstorm"

    };


    return descriptions[code]
        || "Unknown";
}


function getWeatherIcon(code) {

    if (code === 0) return "☀️";

    if (code === 1) return "🌤️";

    if (code === 2) return "⛅";

    if (code === 3) return "☁️";

    if (
        code === 45 ||
        code === 48
    ) return "🌫️";

    if (
        code >= 51 &&
        code <= 67
    ) return "🌧️";

    if (
        code >= 71 &&
        code <= 77
    ) return "🌨️";

    if (
        code >= 80 &&
        code <= 82
    ) return "🌦️";

    if (code >= 95) return "⛈️";

    return "🌡️";
}


function showLoading(message) {

    document.getElementById("loading")
        .innerText =
        message;

}


function showError(message) {

    document.getElementById("error")
        .innerText =
        message;

}


function clearError() {

    document.getElementById("error")
        .innerText =
        "";

}


// Press Enter to search

document.getElementById("cityInput")
    .addEventListener(
        "keypress",
        function(event) {

            if (event.key === "Enter") {

                searchWeather();

            }

        }
    );