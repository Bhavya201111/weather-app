from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx


app = FastAPI(title="Weather App API")


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# HOME
# -----------------------------

@app.get("/")
def home():
    return {
        "message": "Weather API is running!"
    }


# -----------------------------
# SEARCH CITY
# -----------------------------

@app.get("/geocode")
async def geocode_city(city: str):

    url = "https://geocoding-api.open-meteo.com/v1/search"

    params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    try:

        async with httpx.AsyncClient() as client:

            response = await client.get(
                url,
                params=params
            )

        if response.status_code != 200:

            raise HTTPException(
                status_code=500,
                detail="Geocoding API request failed"
            )

        data = response.json()

        if "results" not in data:

            raise HTTPException(
                status_code=404,
                detail="City not found"
            )

        location = data["results"][0]

        return {
            "name": location["name"],
            "country": location.get("country", ""),
            "latitude": location["latitude"],
            "longitude": location["longitude"]
        }

    except httpx.RequestError:

        raise HTTPException(
            status_code=500,
            detail="Could not connect to geocoding service"
        )


# -----------------------------
# WEATHER
# -----------------------------

@app.get("/weather")
async def get_weather(
    latitude: float,
    longitude: float
):

    url = "https://api.open-meteo.com/v1/forecast"

    params = {

        "latitude": latitude,

        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "weather_code,"
            "wind_speed_10m"
        ),

        "daily": (
            "temperature_2m_max,"
            "temperature_2m_min,"
            "weather_code"
        ),

        "timezone": "auto",

        "forecast_days": 7
    }

    try:

        async with httpx.AsyncClient() as client:

            response = await client.get(
                url,
                params=params
            )

        if response.status_code != 200:

            raise HTTPException(
                status_code=500,
                detail="Weather API request failed"
            )

        return response.json()

    except httpx.RequestError:

        raise HTTPException(
            status_code=500,
            detail="Could not connect to weather service"
        )