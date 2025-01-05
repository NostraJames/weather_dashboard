"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ReactAnimatedWeather from "react-animated-weather";

// Map OpenWeatherMap icon codes to ReactAnimatedWeather icons
const iconMapping = {
  "01d": "CLEAR_DAY",
  "01n": "CLEAR_NIGHT",
  "02d": "PARTLY_CLOUDY_DAY",
  "02n": "PARTLY_CLOUDY_NIGHT",
  "03d": "CLOUDY",
  "03n": "CLOUDY",
  "04d": "CLOUDY",
  "04n": "CLOUDY",
  "09d": "RAIN",
  "09n": "RAIN",
  "10d": "RAIN",
  "10n": "RAIN",
  "11d": "WIND",
  "11n": "WIND",
  "13d": "SNOW",
  "13n": "SNOW",
  "50d": "FOG",
  "50n": "FOG",
};

// List of locations
const locations = [
  { name: "Longyearbyen Svalbard", lat: 78.2253, lon: 15.6256 },
  { name: "Queenstown, New Zealand", lat: -45.0312, lon: 168.6626 },
  { name: "London, England", lat: 51.5074, lon: -0.1278 },
  { name: "Hattiesburg, Mississippi", lat: 31.3271, lon: -89.2903 },
  { name: "Vancouver, Canada", lat: 49.2827, lon: -123.1207 },
  { name: "Bentonville, Arkansas", lat: 36.3724, lon: 94.2102 },
];

export default function Home() {
  const API_KEY = "183fd55e886c331c654f358c4562d900"; // Replace with your OpenWeatherMap API key
  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
  const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

  const [weatherData, setWeatherData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch current weather for all locations
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const promises = locations.map(async (location) => {
          const response = await axios.get(BASE_URL, {
            params: {
              lat: location.lat,
              lon: location.lon,
              appid: API_KEY,
              units: "metric",
            },
          });
          return {
            ...location,
            temp: response.data.main.temp,
            condition: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
          };
        });

        const data = await Promise.all(promises);
        setWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeatherData();
  }, []);

  // Fetch 5-day / 3-hour forecast for a selected location
  const fetchForecast = async (location) => {
    try {
      setLoading(true);
      const response = await axios.get(FORECAST_URL, {
        params: {
          lat: location.lat,
          lon: location.lon,
          appid: API_KEY,
          units: "metric",
        },
      });

      // Filter to show one forecast per day at 12:00 PM
      const dailyForecasts = response.data.list.filter((entry) =>
        entry.dt_txt.includes("12:00:00")
      ).slice(0, 5); // Limit to 5 days

      setForecast(dailyForecasts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      setLoading(false);
    }
  };

  const handleCardClick = (location) => {
    setSelectedLocation(location);
    fetchForecast(location);
  };

  const handleBack = () => {
    setSelectedLocation(null);
    setForecast([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-300 to-green-100 p-8">
      <h1 className="text-5xl font-extrabold text-white text-center mb-12 drop-shadow-lg">
        {selectedLocation ? selectedLocation.name : "Places You've Been"}
      </h1>

      {selectedLocation ? (
        <div>
          <button
            onClick={handleBack}
            className="mb-6 px-4 py-2 bg-white text-blue-500 rounded-md shadow hover:bg-blue-100"
          >
            Back
          </button>
          {loading ? (
            <p className="text-center text-gray-500">Loading forecast...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecast.map((entry, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center"
                >
                  <p className="text-gray-700 font-semibold">
                    {new Date(entry.dt * 1000).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                  <ReactAnimatedWeather
                    icon={iconMapping[entry.weather[0].icon]}
                    color="black"
                    size={64}
                    animate={true}
                  />
                  <p>{entry.main.temp}°C</p>
                  <p className="capitalize text-gray-500">
                    {entry.weather[0].description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weatherData.map((weather, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(weather)}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center transition-transform transform hover:scale-105 cursor-pointer"
            >
              <ReactAnimatedWeather
                icon={iconMapping[weather.icon]}
                color="black"
                size={80}
                animate={true}
              />
              <h2 className="text-2xl font-semibold text-gray-800">
                {weather.name}
              </h2>
              <p className="text-lg text-gray-600">
                {weather.temp}°C / {((weather.temp * 9) / 5 + 32).toFixed(1)}°F
              </p>
              <p className="capitalize text-gray-500">{weather.condition}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}