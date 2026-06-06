import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

const getWeatherMaterialIcon = (iconCode) => {
  const mapping = {
    '01d': 'sunny',
    '01n': 'nights_stay',
    '02d': 'partly_cloudy_day',
    '02n': 'partly_cloudy_night',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rainy_heavy',
    '09n': 'rainy_heavy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'ac_unit',
    '13n': 'ac_unit',
    '50d': 'foggy',
    '50n': 'foggy'
  };
  return mapping[iconCode] || 'sunny';
};

const getWeatherIconColor = (iconCode) => {
  const mapping = {
    '01d': '#fbbf24', // Sunny (Amber)
    '01n': '#94a3b8', // Nights Stay (Slate)
    '02d': '#f59e0b', // Partly Cloudy Day (Warm Gold)
    '02n': '#64748b', // Partly Cloudy Night (Deep Slate)
    '03d': '#94a3b8', // Cloudy
    '03n': '#94a3b8',
    '04d': '#64748b', // Overcast
    '04n': '#64748b',
    '09d': '#38bdf8', // Showers (Sky Blue)
    '09n': '#38bdf8',
    '10d': '#0ea5e9', // Rain (Deep Sky Blue)
    '10n': '#0ea5e9',
    '11d': '#fbbf24', // Thunderstorm (Yellow Lightning)
    '11n': '#fbbf24',
    '13d': '#99f6e4', // Snow (Teal)
    '13n': '#99f6e4',
    '50d': '#cbd5e1', // Mist/Fog (Silver)
    '50n': '#cbd5e1'
  };
  return mapping[iconCode] || '#73d4fc';
};



const SkeletonLoader = () => (
  <section className="dashboard-sections-grid skeleton-loader-grid">
    <div className="current-weather-section">
      <div className="skeleton skeleton-weather-card"></div>
    </div>
    <div className="highlights-grid">
      <div className="skeleton skeleton-stat-card"></div>
      <div className="skeleton skeleton-stat-card"></div>
      <div className="skeleton skeleton-stat-card"></div>
      <div className="skeleton skeleton-stat-card"></div>
      <div className="skeleton skeleton-stat-card"></div>
      <div className="skeleton skeleton-stat-card"></div>
    </div>
    <div className="dashboard-bottom-grid">
      <div className="skeleton skeleton-map-card"></div>
      <div className="forecast-section">
        <div className="skeleton skeleton-forecast-title"></div>
        <div className="forecast-row">
          <div className="skeleton skeleton-forecast-card"></div>
          <div className="skeleton skeleton-forecast-card"></div>
          <div className="skeleton skeleton-forecast-card"></div>
          <div className="skeleton skeleton-forecast-card"></div>
          <div className="skeleton skeleton-forecast-card"></div>
        </div>
      </div>
    </div>
  </section>
);

function App() {
  const [cityInput, setCityInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [units, setUnits] = useState('metric');
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const lastQueryRef = useRef({ type: 'coords', lat: -6.2088, lon: 106.8456 });

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
  const isApiKeyPlaceholder = !API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE' || API_KEY.trim() === '';

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setShowErrorToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hr = currentTime.getHours();
    if (hr < 5) return 'Selamat dini hari';
    if (hr < 11) return 'Selamat pagi';
    if (hr < 15) return 'Selamat siang';
    if (hr < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatEpochTime = (epoch) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const addRecentSearch = (name) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== name.toLowerCase());
      const updated = [name, ...filtered].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const processWeatherData = (data) => {
    const tempSymbol = units === 'metric' ? '°C' : '°F';
    const windRaw = data.wind.speed;
    const windSpeed = units === 'metric' ? `${(windRaw * 3.6).toFixed(1)} km/h` : `${windRaw.toFixed(1)} mph`;

    const cityName = data.name === 'Kepatihan' ? 'Bandung' : data.name;

    return {
      name: cityName,
      temp: Math.round(data.main.temp),
      tempUnit: tempSymbol,
      condition: data.weather[0].description,
      iconCode: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: windSpeed,
      pressure: `${data.main.pressure} hPa`,
      visibility: `${(data.visibility / 1000).toFixed(1)} km`,
      feelsLike: `${Math.round(data.main.feels_like)}${tempSymbol}`,
      sunrise: formatEpochTime(data.sys.sunrise),
      sunset: formatEpochTime(data.sys.sunset),
      lat: data.coord.lat,
      lon: data.coord.lon
    };
  };

  const processForecastData = (list) => {
    const dailyData = list.filter((item) => item.dt_txt.includes('12:00:00'));
    return dailyData.map((item) => {
      const date = new Date(item.dt * 1000);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
      return {
        day: dayName,
        temp: Math.round(item.main.temp),
        condition: item.weather[0].description,
        iconCode: item.weather[0].icon,
        pop: item.pop !== undefined ? Math.round(item.pop * 100) : 0
      };
    });
  };

  const fetchWeather = async (query) => {
    setLoading(true);
    setError('');
    lastQueryRef.current = query;

    const weatherUrl =
      query.type === 'coords'
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&units=${units}&lang=id`
        : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query.name)}&appid=${API_KEY}&units=${units}&lang=id`;

    const forecastUrl =
      query.type === 'coords'
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${query.lat}&lon=${query.lon}&appid=${API_KEY}&units=${units}&lang=id`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(query.name)}&appid=${API_KEY}&units=${units}&lang=id`;

    try {
      const [resWeather, resForecast] = await Promise.all([fetch(weatherUrl), fetch(forecastUrl)]);

      if (!resWeather.ok) {
        if (resWeather.status === 404) {
          throw new Error('Kota tidak ditemukan. Silakan periksa kembali ejaan nama kota.');
        }
        if (resWeather.status === 401) {
          throw new Error('Kunci API OpenWeatherMap tidak valid. Silakan periksa kembali berkas .env Anda.');
        }
        throw new Error('Gagal mengambil data cuaca aktual.');
      }

      if (!resForecast.ok) {
        throw new Error('Gagal mengambil data ramalan cuaca 5 hari.');
      }

      const weatherJson = await resWeather.json();
      const forecastJson = await resForecast.json();

      updateMapAndMarker(weatherJson.coord.lat, weatherJson.coord.lon);
      setWeatherData(processWeatherData(weatherJson));
      setForecastData(processForecastData(forecastJson.list));
      addRecentSearch(weatherJson.name);
    } catch (err) {
      setError(err.message);
      setShowErrorToast(true);
    } finally {
      setLoading(false);
    }
  };

  const updateMapAndMarker = (lat, lon) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 10, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, lon]);
      }
    }
  };

  useEffect(() => {
    if (isApiKeyPlaceholder) return;

    const initWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather({
              type: 'coords',
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          () => {
            fetchWeather({ type: 'city', name: 'Jakarta' });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        fetchWeather({ type: 'city', name: 'Jakarta' });
      }
    };

    const timer = setTimeout(initWeather, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isApiKeyPlaceholder || loading) return;
    fetchWeather(lastQueryRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  useEffect(() => {
    if (loading && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerInstanceRef.current = null;
    }
  }, [loading]);

  useEffect(() => {
    const mapElement = document.getElementById('map');
    if (mapElement && !mapInstanceRef.current && weatherData) {
      const map = L.map('map', {
        zoomControl: true,
        attributionControl: true
      }).setView([weatherData.lat, weatherData.lon], 10);

      const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps'
      });

      const googleStreets = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps'
      });

      const darkSlate = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      });

      const rainOverlay = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        maxZoom: 18,
        attribution: '&copy; OpenWeatherMap'
      });

      const cloudsOverlay = L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        maxZoom: 18,
        attribution: '&copy; OpenWeatherMap'
      });

      const tempOverlay = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        maxZoom: 18,
        attribution: '&copy; OpenWeatherMap'
      });

      const windOverlay = L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        maxZoom: 18,
        attribution: '&copy; OpenWeatherMap'
      });

      googleHybrid.addTo(map);
      rainOverlay.addTo(map);

      const baseMaps = {
        "Google Satelit": googleHybrid,
        "Google Jalan": googleStreets,
        "Tema Gelap": darkSlate
      };

      const overlayMaps = {
        "Radar Hujan": rainOverlay,
        "Lapisan Awan": cloudsOverlay,
        "Peta Suhu (Panas)": tempOverlay,
        "Radar Angin": windOverlay
      };

      L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          width: 16px;
          height: 16px;
          background: #73d4fc;
          border: 2px solid #060913;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(115, 212, 252, 0.6);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([weatherData.lat, weatherData.lon], { icon: customIcon }).addTo(map);

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, loading]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    fetchWeather({ type: 'city', name: cityInput });
    setCityInput('');
  };

  const handleRecentClick = (cityName) => {
    fetchWeather({ type: 'city', name: cityName });
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const deleteHistoryItem = (cityName) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((c) => c !== cityName);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather({
            type: 'coords',
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setLoading(false);
          let errMsg = 'Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.';
          if (err.code === err.PERMISSION_DENIED) {
            errMsg = 'Izin akses lokasi ditolak.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg = 'Informasi lokasi tidak tersedia.';
          } else if (err.code === err.TIMEOUT) {
            errMsg = 'Waktu permintaan lokasi habis.';
          }
          setError(errMsg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolokasi tidak didukung oleh browser Anda.');
    }
  };

  // SkeletonLoader moved outside App component to follow react-hooks/static-components rule

  if (isApiKeyPlaceholder) {
    return (
      <main className="app-container">
        <header className="header-container setup-header">
          <div className="brand-section">
            <div className="brand-logo-row">
              <img src="/favicon.svg" alt="Cloudy Logo" className="brand-logo-img" />
              <span className="brand-name">Cloudy</span>
            </div>
          </div>
        </header>

        <section className="error-container setup-container">
          <h2 className="setup-title">
            Konfigurasi Kunci API Dibutuhkan
          </h2>
          <p className="setup-desc">
            Cloudy membutuhkan kunci API OpenWeatherMap untuk memuat data cuaca riil di seluruh Indonesia dan peta interaktif.
          </p>
          <div className="setup-steps-card">
            <p className="setup-steps-title">Langkah-langkah Setup:</p>
            <ol className="setup-steps-list">
              <li>Buka file <strong>.env</strong> di direktori utama proyek.</li>
              <li>Ganti teks <code>YOUR_OPENWEATHERMAP_API_KEY_HERE</code> dengan API Key Anda yang valid.</li>
              <li>Simpan berkas dan muat ulang halaman peramban ini.</li>
            </ol>
          </div>
          <p className="setup-footer">
            Catatan: Dapatkan API Key gratis di openweathermap.org dengan mendaftarkan akun.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-container">
      <aside className="sidebar-panel">
        <div className="brand-section">
          <div className="brand-logo-row">
            <img src="/favicon.svg" alt="Cloudy Logo" className="brand-logo-img" />
            <h1 className="brand-name">Cloudy</h1>
          </div>
          <div className="brand-badge">
            <span className="badge-dot"></span>
            <span>Weather Station</span>
          </div>
        </div>

        <div className="live-clock-card">
          <div className="live-clock-header">
            <span className="material-symbols-outlined clock-icon">schedule</span>
            <span className="clock-title-text">Waktu Lokal</span>
          </div>
          <div className="clock-time">{formatTime(currentTime)}</div>
          <div className="clock-date">{formatDate(currentTime)}</div>
        </div>

        <div className="unit-selector">
          <button
            className={`unit-btn ${units === 'metric' ? 'active' : ''}`}
            onClick={() => setUnits('metric')}
          >
            Celcius (°C)
          </button>
          <button
            className={`unit-btn ${units === 'imperial' ? 'active' : ''}`}
            onClick={() => setUnits('imperial')}
          >
            Fahrenheit (°F)
          </button>
        </div>

        <div className="history-section">
          <div className="history-header">
            <h2 className="history-title">Riwayat Kota</h2>
            {recentSearches.length > 0 && (
              <button onClick={clearHistory} className="clear-history-btn" title="Hapus semua riwayat">
                Hapus Semua
              </button>
            )}
          </div>
          <div className="history-list">
            {recentSearches.length === 0 ? (
              <div className="history-empty-state">
                <span className="material-symbols-outlined history-empty-icon">history_toggle_off</span>
                <span className="history-empty-text">Belum ada riwayat</span>
              </div>
            ) : (
              recentSearches.map((city, idx) => (
                <div
                  key={idx}
                  className="history-item"
                  onClick={() => handleRecentClick(city)}
                >
                  <span className="history-item-name">{city}</span>
                  <button
                    className="history-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(city);
                    }}
                    title={`Hapus ${city} dari riwayat`}
                  >
                    <span className="material-symbols-outlined delete-icon-small">close</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="main-content">
        <div className="search-bar-row">
          <div className="welcome-greeting">
            <span className="greeting-text">
              <span className="material-symbols-outlined greeting-icon">waving_hand</span>
              {getGreeting()}!
            </span>
            <span className="greeting-subtext">Pantau cuaca hari ini.</span>
          </div>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Cari kota se-Indonesia..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="search-input"
            />
            <button
              type="button"
              className="location-button"
              onClick={handleGeolocation}
              title="Gunakan lokasi saya"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
            <button type="submit" className="search-button">
              <span className="material-symbols-outlined">search</span>
            </button>
          </form>
        </div>

        {loading && <SkeletonLoader />}

        {showErrorToast && (
          <div className="toast-notification">
            <span className="material-symbols-outlined toast-icon">warning</span>
            <span className="toast-message">{error}</span>
            <button className="toast-close" onClick={() => setShowErrorToast(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {!loading && !weatherData && error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && weatherData && (
          <div className="dashboard-sections-grid">
            <div className="current-weather-section">
              <article className="weather-card">
                <h2 className="city-name">{weatherData.name}</h2>
                <div className="weather-icon-container">
                  <span
                    className="material-symbols-outlined weather-icon-symbol"
                    style={{
                      color: getWeatherIconColor(weatherData.iconCode),
                      filter: `drop-shadow(0 4px 12px ${getWeatherIconColor(weatherData.iconCode)}40)`
                    }}
                  >
                    {getWeatherMaterialIcon(weatherData.iconCode)}
                  </span>
                </div>
                <div className="temperature">
                  {weatherData.temp}
                  <span className="temp-unit">{weatherData.tempUnit}</span>
                </div>
                <p className="weather-condition">{weatherData.condition}</p>
              </article>
            </div>

            <div className="highlights-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Suhu Terasa</span>
                  <span className="material-symbols-outlined stat-icon">thermostat</span>
                </div>
                <span className="stat-value">{weatherData.feelsLike}</span>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Kelembapan</span>
                  <span className="material-symbols-outlined stat-icon">water_drop</span>
                </div>
                <span className="stat-value">{weatherData.humidity}%</span>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${weatherData.humidity}%` }}></div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Kecepatan Angin</span>
                  <span className="material-symbols-outlined stat-icon">air</span>
                </div>
                <span className="stat-value">{weatherData.windSpeed}</span>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Tekanan Udara</span>
                  <span className="material-symbols-outlined stat-icon">compress</span>
                </div>
                <span className="stat-value">{weatherData.pressure}</span>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Visibilitas</span>
                  <span className="material-symbols-outlined stat-icon">visibility</span>
                </div>
                <span className="stat-value">{weatherData.visibility}</span>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-label">Terbit / Terbenam</span>
                  <span className="material-symbols-outlined stat-icon">wb_twilight</span>
                </div>
                <div className="sun-details">
                  <div className="sun-row">
                    <span className="material-symbols-outlined sun-icon-small">sunny</span>
                    <span className="sun-value">{weatherData.sunrise}</span>
                  </div>
                  <div className="sun-row">
                    <span className="material-symbols-outlined sun-icon-small">nights_stay</span>
                    <span className="sun-value">{weatherData.sunset}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-bottom-grid">
              <div className="map-section">
                <div className="map-card">
                  <div className="map-header">
                    <div className="map-title">
                      <div className="map-title-dot"></div>
                      <span>Peta Cuaca Satelit</span>
                    </div>
                  </div>
                  <div className="map-wrapper">
                    <div id="map"></div>
                  </div>
                </div>
              </div>

              <div className="forecast-section">
                <h3 className="forecast-title">Ramalan 5 Hari</h3>
                <div className="forecast-row">
                  {forecastData.map((dayData, idx) => (
                    <div key={idx} className="forecast-card">
                      <span className="forecast-day">{dayData.day}</span>
                      <div className="forecast-weather-visual">
                        <span
                          className="material-symbols-outlined forecast-icon-symbol"
                          style={{ color: getWeatherIconColor(dayData.iconCode) }}
                        >
                          {getWeatherMaterialIcon(dayData.iconCode)}
                        </span>
                        {dayData.pop > 10 && (
                          <span className="forecast-pop" title="Probabilitas Hujan">
                            <span className="material-symbols-outlined pop-icon">water_drop</span>
                            {dayData.pop}%
                          </span>
                        )}
                      </div>
                      <span className="forecast-temp">{dayData.temp}{weatherData.tempUnit}</span>
                      <span className="forecast-condition">{dayData.condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
