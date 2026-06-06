# Cloudy - Dashboard Pemantauan Cuaca

Cloudy adalah aplikasi web interaktif bernuansa *dark mode* premium untuk memantau prakiraan cuaca, suhu, kondisi iklim, dan melihat peta satelit radar cuaca secara real-time di seluruh wilayah Indonesia.

## Kegunaan
Aplikasi ini berguna untuk:
- Memantau kondisi cuaca hari ini secara akurat (suhu aktual, kelembapan, kecepatan angin, tekanan udara, dan visibilitas).
- Melihat ringkasan analisis tren cuaca untuk keesokan hari.
- Membaca ramalan cuaca 5 hari ke depan beserta persentase probabilitas turunnya hujan secara visual.
- Melacak lokasi pengguna secara otomatis melalui fitur geolokasi bawaan peramban (*browser*).
- Mengamati persebaran awan, peta suhu, dan curah hujan secara visual melalui integrasi peta satelit interaktif.
- Menyimpan riwayat kota-kota yang sebelumnya pernah dicari pengguna.

## Bahasa Pemrograman
- **JavaScript (ES6+)**: Menangani logika fungsionalitas utama aplikasi, fetch data cuaca secara asinkron dari API, dan manajemen status *(state)*.
- **HTML5**: Struktur kerangka dasar semantik halaman web.
- **CSS3 (Vanilla)**: Sistem desain antarmuka (*UI*) modern menggunakan pola arsitektur *CSS Variables*, *Flexbox*, *CSS Grid*, dan kueri media responsif tanpa bantuan framework CSS eksternal (murni).

## Tools & Teknologi yang Digunakan
- **React 19**: Pustaka (*Library*) frontend utama untuk membangun antarmuka pengguna interaktif berbasis komponen yang reaktif (menggunakan React Hooks: `useState`, `useEffect`, `useRef`).
- **Vite**: *Build tool* generasi baru dan *development server* super cepat untuk lingkungan React.
- **Leaflet**: Pustaka peta interaktif open-source (*Map tiles* dirender menggunakan citra satelit hibrida Google Maps dan lapisan satelit cuaca dari OpenWeatherMap).
- **OpenWeatherMap API**: Sumber pihak ketiga yang menyuplai data cuaca historis, cuaca hari ini, dan ramalan cuaca 5 hari ke depan.
- **Google Material Symbols**: Menggunakan kumpulan pustaka ikon modern bergaris luar (Material 3).
- **Tipografi Premium**: Menggunakan Google Fonts *Plus Jakarta Sans* untuk keterbacaan teks dan *JetBrains Mono* untuk estetika penampilan presisi data numerik.

---

## Cara Menjalankan Proyek Secara Lokal

### Prasyarat
Pastikan sistem operasi komputer Anda sudah terinstal perangkat lunak **Node.js** (sangat disarankan menggunakan versi 18 atau yang lebih baru) beserta **npm** (Node Package Manager).

### Langkah-langkah Instalasi:

1. **Buka Direktori Proyek**
   Buka terminal Anda (Command Prompt / PowerShell / Bash) lalu navigasikan ke folder proyek ini.

2. **Instalasi Dependensi**
   Jalankan perintah ini untuk mengunduh dan menginstal semua library/komponen yang dibutuhkan oleh aplikasi:
   ```bash
   npm install
   ```

3. **Konfigurasi Kunci API (API Key)**
   - Buka berkas bernama `.env` yang berada di direktori paling luar (sejajar dengan `package.json`).
   - Ganti bagian variabel *placeholder* `VITE_OPENWEATHER_API_KEY` menggunakan API Key asli milik Anda yang didapatkan dari pendaftaran di situs OpenWeatherMap:
   ```env
   VITE_OPENWEATHER_API_KEY=KUNCI_API_ANDA_DI_SINI
   ```

4. **Jalankan Server Lokal (Development)**
   Mulai jalankan web server mode pengembangan agar Anda dapat menguji aplikasi langsung di komputer:
   ```bash
   npm run dev
   ```
   
5. **Akses Aplikasi di Browser**
   Setelah server berhasil berjalan, buka aplikasi peramban (Chrome / Firefox / Edge) dan tuju ke alamat tautan yang tertera di terminal Anda, secara standar berada pada:
   ```text
   http://localhost:5173/
   ```
   
Aplikasi Cloudy siap memantau cuaca untuk Anda!
