# SkyFlow Pro - Dashboard Pemantauan Cuaca Premium

SkyFlow Pro adalah aplikasi dashboard pemantauan cuaca modern berbasis React + Vite yang mengadopsi estetika **Luminous Light Glassmorphism** (kaca frosted cerah). Aplikasi ini menyajikan data meteorologi riil dari seluruh Indonesia secara langsung serta peta satelit radar cuaca yang interaktif.

## 🌟 Fitur Utama

- **Dashboard Cuaca Riil**: Menyajikan informasi suhu, deskripsi cuaca, suhu terasa (*feels like*), kelembapan (dengan progress bar dinamis), kecepatan angin, tekanan udara, visibilitas, serta waktu terbit & terbenam (format WIB).
- **Peta Satelit Radar Interaktif**: Peta interaktif berbasis Leaflet yang mendukung penjelajahan koordinat kota secara dinamis (efek *flyTo*), dilengkapi lapisan peta (Google Satelit, Google Jalan, Peta Gelap) dan radar cuaca real-time (Curah Hujan, Awan, Suhu, Angin).
- **Live Waktu Lokal**: Penunjuk jam digital serta hari dan tanggal dalam format bahasa Indonesia (WIB) yang diperbarui setiap detik.
- **Unit Selector**: Tombol konversi instan untuk mengubah satuan suhu dari Celcius (°C) ke Fahrenheit (°F) secara menyeluruh.
- **Riwayat Pencarian & Smart Alert**: Sidebar penyimpan daftar riwayat kota yang baru dicari dan notifikasi eror melayang (*floating toast alert*) yang akan menghilang secara otomatis setelah 4 detik.

## 🛠️ Teknologi yang Digunakan

- **Frontend Core**: React (Functional Components, Hooks like useState, useEffect, useRef)
- **Bundler & Tooling**: Vite
- **Peta & Geospasial**: Leaflet, Google Maps Tiles, OpenWeatherMap Map Layers
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid, Backdrop Filters, Glassmorphism, CSS Transitions/Animations)
- **Ikonografi**: Google Material Symbols (Material 3)

## 🚀 Cara Menjalankan Proyek

1. **Unduh Dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Kunci API**:
   Buka berkas `.env` di direktori utama, lalu masukkan kunci API OpenWeatherMap Anda yang valid:
   ```env
   VITE_OPENWEATHER_API_KEY=YOUR_OPENWEATHERMAP_API_KEY_HERE
   ```

3. **Jalankan Server Lokal (Development Server)**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di alamat `http://localhost:5173/`.
