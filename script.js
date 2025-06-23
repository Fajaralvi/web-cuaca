// Website Pendeteksi Cuaca - JavaScript

// Konfigurasi API
// Ganti dengan API key Anda dari OpenWeatherMap
const API_KEY = "fb856ab42e58ea5781274ada093827b0"
const API_URL = "https://api.openweathermap.org/data/2.5/weather"

// DOM Elements
const cityInput = document.getElementById("cityInput")
const searchBtn = document.getElementById("searchBtn")
const weatherResult = document.getElementById("weatherResult")
const weatherForm = document.getElementById("weatherForm")
const searchText = document.querySelector(".search-text")
const loadingText = document.querySelector(".loading")

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Inisialisasi aplikasi
function initializeApp() {
  // Event listener untuk form submit
  weatherForm.addEventListener("submit", handleFormSubmit)

  // Auto-focus pada input saat halaman dimuat
  cityInput.focus()

  // Enter key untuk submit
  cityInput.addEventListener("keypress", handleKeyPress)

  // Clear hasil saat input berubah
  cityInput.addEventListener("input", function () {
    if (this.value.trim() === "") {
      weatherResult.innerHTML = ""
    }
  })
}

// Handle form submit
function handleFormSubmit(e) {
  e.preventDefault()
  const cityName = cityInput.value.trim()

  if (cityName) {
    fetchWeather(cityName)
  } else {
    displayError("Silakan masukkan nama kota.")
  }
}

// Handle key press
function handleKeyPress(e) {
  if (e.key === "Enter") {
    weatherForm.dispatchEvent(new Event("submit"))
  }
}

// Fungsi utama untuk mengambil data cuaca
async function fetchWeather(cityName) {
  // Tampilkan loading state
  showLoading(true)

  // Clear previous results
  weatherResult.innerHTML = ""

  try {
    // Validasi API key
    if (API_KEY === "YOUR_API_KEY_HERE") {
      throw new Error("API key belum diatur. Silakan dapatkan API key dari OpenWeatherMap dan ganti di file script.js.")
    }

    // Buat URL dengan parameter
    const url = buildApiUrl(cityName)

    // Fetch data dari API
    const response = await fetch(url)

    // Handle response errors
    if (!response.ok) {
      handleApiError(response.status)
      return
    }

    const data = await response.json()

    // Validasi data response
    if (!data || !data.main || !data.weather) {
      throw new Error("Data cuaca tidak lengkap dari server.")
    }

    displayWeather(data)
  } catch (error) {
    console.error("Error fetching weather:", error)
    displayError(error.message)
  } finally {
    showLoading(false)
  }
}

// Build API URL dengan parameter
function buildApiUrl(cityName) {
  const params = new URLSearchParams({
    q: cityName,
    appid: API_KEY,
    units: "metric",
    lang: "id",
  })

  return `${API_URL}?${params.toString()}`
}

// Handle API errors
function handleApiError(status) {
  let errorMessage

  switch (status) {
    case 404:
      errorMessage = "Kota tidak ditemukan. Periksa ejaan nama kota dan coba lagi."
      break
    case 401:
      errorMessage = "API key tidak valid. Periksa API key Anda di file script.js."
      break
    case 429:
      errorMessage = "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit."
      break
    case 500:
      errorMessage = "Server sedang bermasalah. Silakan coba lagi nanti."
      break
    default:
      errorMessage = `Terjadi kesalahan saat mengambil data cuaca (Error ${status}).`
  }

  throw new Error(errorMessage)
}

// Fungsi untuk menampilkan data cuaca
function displayWeather(data) {
  try {
    const weatherInfo = extractWeatherInfo(data)
    const weatherHTML = buildWeatherHTML(weatherInfo)

    weatherResult.innerHTML = weatherHTML

    // Scroll ke hasil jika diperlukan
    weatherResult.scrollIntoView({ behavior: "smooth", block: "nearest" })
  } catch (error) {
    console.error("Error displaying weather:", error)
    displayError("Terjadi kesalahan saat menampilkan data cuaca.")
  }
}

// Extract weather information dari API response
function extractWeatherInfo(data) {
  return {
    cityName: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: capitalizeFirstLetter(data.weather[0].description),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    pressure: data.main.pressure,
    visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : "N/A",
    weatherMain: data.weather[0].main,
    icon: data.weather[0].icon,
  }
}

// Build HTML untuk menampilkan cuaca
function buildWeatherHTML(weather) {
  const weatherIcon = getWeatherIcon(weather.weatherMain)

  return `
        <div class="weather-info">
            <div class="text-center mb-4">
                <div class="weather-icon">${weatherIcon}</div>
                <h2 class="city-name mt-2">${weather.cityName}, ${weather.country}</h2>
                <div class="temp-display">${weather.temperature}°C</div>
                <p class="text-muted mb-0">Terasa seperti ${weather.feelsLike}°C</p>
            </div>
            
            <div class="row">
                ${buildWeatherDetail("bi-cloud", "Deskripsi Cuaca", weather.description)}
                ${buildWeatherDetail("bi-droplet", "Kelembapan", `${weather.humidity}%`)}
                ${buildWeatherDetail("bi-wind", "Kecepatan Angin", `${weather.windSpeed} m/s`)}
                ${buildWeatherDetail("bi-thermometer", "Tekanan", `${weather.pressure} hPa`)}
                ${buildWeatherDetail("bi-eye", "Jarak Pandang", `${weather.visibility} km`)}
            </div>
        </div>
    `
}

// Build individual weather detail
function buildWeatherDetail(icon, label, value) {
  return `
        <div class="col-12">
            <div class="weather-detail">
                <div class="d-flex justify-content-between align-items-center">
                    <span><i class="bi ${icon} me-2"></i>${label}</span>
                    <strong>${value}</strong>
                </div>
            </div>
        </div>
    `
}

// Fungsi untuk menampilkan error
function displayError(message) {
  const errorHTML = `
        <div class="error-message">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Error:</strong> ${message}
        </div>
    `
  weatherResult.innerHTML = errorHTML
}

// Fungsi untuk menampilkan loading state
function showLoading(isLoading) {
  if (isLoading) {
    searchText.style.display = "none"
    loadingText.style.display = "inline"
    searchBtn.disabled = true
    cityInput.disabled = true
  } else {
    searchText.style.display = "inline"
    loadingText.style.display = "none"
    searchBtn.disabled = false
    cityInput.disabled = false
  }
}

// Fungsi untuk mendapatkan icon cuaca
function getWeatherIcon(weatherMain) {
  const icons = {
    Clear: '<i class="bi bi-sun"></i>',
    Clouds: '<i class="bi bi-cloud"></i>',
    Rain: '<i class="bi bi-cloud-rain"></i>',
    Drizzle: '<i class="bi bi-cloud-drizzle"></i>',
    Thunderstorm: '<i class="bi bi-cloud-lightning"></i>',
    Snow: '<i class="bi bi-cloud-snow"></i>',
    Mist: '<i class="bi bi-cloud-fog"></i>',
    Fog: '<i class="bi bi-cloud-fog"></i>',
    Haze: '<i class="bi bi-cloud-haze"></i>',
    Smoke: '<i class="bi bi-cloud-fog"></i>',
    Dust: '<i class="bi bi-cloud-haze"></i>',
    Sand: '<i class="bi bi-cloud-haze"></i>',
    Ash: '<i class="bi bi-cloud-fog"></i>',
    Squall: '<i class="bi bi-wind"></i>',
    Tornado: '<i class="bi bi-tornado"></i>',
  }

  return icons[weatherMain] || '<i class="bi bi-cloud"></i>'
}

// Utility function untuk capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Fungsi untuk format waktu (jika diperlukan untuk fitur tambahan)
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Error handling untuk network issues
window.addEventListener("online", () => {
  console.log("Koneksi internet tersedia")
})

window.addEventListener("offline", () => {
  console.log("Koneksi internet terputus")
  displayError("Koneksi internet terputus. Periksa koneksi Anda dan coba lagi.")
})

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K untuk focus ke search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault()
    cityInput.focus()
    cityInput.select()
  }

  // Escape untuk clear hasil
  if (e.key === "Escape") {
    weatherResult.innerHTML = ""
    cityInput.value = ""
    cityInput.focus()
  }
})
