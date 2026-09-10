const params = new URLSearchParams(
    window.location.search
);

const date = params.get("date");
const latitude = params.get("lat");
const longitude = params.get("lon");
const city = params.get("city");

const API_URL = "http://127.0.0.1:8000";


document.getElementById("hourlyTitle").innerText =
    `${city} — ${date}`;


async function loadHourlyWeather() {

    try {

        const response = await fetch(
            `${API_URL}/weather?latitude=${latitude}&longitude=${longitude}`
        );

        if (!response.ok) {
            throw new Error("Could not get weather");
        }

        const data = await response.json();

        displayHourlyWeather(data.hourly);

    } catch (error) {

        console.error(error);

        document.getElementById("hourlyForecast").innerText =
            "Could not load hourly weather.";

    }

}


function displayHourlyWeather(hourly) {

    const container =
        document.getElementById("hourlyForecast");

    container.innerHTML = "";

    for (let i = 0; i < hourly.time.length; i++) {

        // Only show selected day
        if (!hourly.time[i].startsWith(date)) {
            continue;
        }

        const card =
            document.createElement("div");

        card.className = "hourly-card";

        const time =
            new Date(hourly.time[i])
                .toLocaleTimeString(
                    "en-US",
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );

        const temperature =
            Math.round(
                hourly.temperature_2m[i]
            );

        const humidity =
            hourly.relative_humidity_2m[i];

        const wind =
            Math.round(
                hourly.wind_speed_10m[i]
            );

        const rain =
            hourly.precipitation_probability[i];

        const condition =
            getWeatherDescription(
                hourly.weather_code[i]
            );

        const icon =
            getWeatherIcon(
                hourly.weather_code[i]
            );


        card.innerHTML = `

            <div class="hour-time">
                ${time}
            </div>

            <div class="hour-icon">
                ${icon}
            </div>

            <div class="hour-temp">
                ${temperature}°C
            </div>

            <div class="hour-condition">
                ${condition}
            </div>

            <div>
                💧 ${humidity}%
            </div>

            <div>
                💨 ${wind} km/h
            </div>

            <div>
                🌧️ ${rain}% rain
            </div>

        `;

        container.appendChild(card);

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

    return descriptions[code] || "Unknown";

}


function getWeatherIcon(code) {

    if (code === 0) return "☀️";
    if (code === 1) return "🌤️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";

    if (code === 45 || code === 48)
        return "🌫️";

    if (code >= 51 && code <= 67)
        return "🌧️";

    if (code >= 71 && code <= 77)
        return "🌨️";

    if (code >= 80 && code <= 82)
        return "🌦️";

    if (code >= 95)
        return "⛈️";

    return "🌡️";

}


loadHourlyWeather();