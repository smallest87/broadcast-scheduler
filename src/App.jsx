// src/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ProgramTable from './components/ProgramTable.jsx';
import SettingsLayout from './components/settings/SettingsLayout.jsx';
import GeneralSettings from './components/settings/GeneralSettings.jsx';
import DataManagementSettings from './components/settings/DataManagementSettings.jsx';
import UserRolesSettings from './components/settings/UserRolesSettings.jsx';
import DisplaySettings from './components/settings/DisplaySettings.jsx';

import { isValidTimeFormat } from './utils/timeUtils.js';
import { parseCSV, convertToCSV } from './utils/csvUtils.js';
import './index.css'; // Import gaya default (glassmorphism)
import './styles/theme-light.css'; // Import gaya tema light
import './styles/theme-dark.css'; // Import gaya tema dark

function App() {
  const [startTime, setStartTime] = useState('12:00:00');
  const [programData, setProgramData] = useState([]); // State programData dimiliki oleh App.jsx
  const [showExampleScheduleNote, setShowExampleScheduleNote] = useState(true); // State ini juga dimiliki oleh App.jsx
  const [currentTheme, setCurrentTheme] = useState('glassmorphism'); // State untuk tema aktif

  const navigate = useNavigate(); // Hook untuk navigasi programatis

  // Effect untuk mengatur kelas di elemen body berdasarkan tema yang dipilih
  useEffect(() => {
    // Hapus semua kelas tema yang mungkin ada sebelumnya
    document.body.classList.remove('light-theme', 'dark-theme');

    // Tambahkan kelas tema yang sesuai
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme');
    } else if (currentTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
    // Jika currentTheme adalah 'glassmorphism', tidak ada kelas tambahan yang ditambahkan,
    // sehingga gaya default di index.css dan ProgramTable.css yang selector-nya :not(.light-theme):not(.dark-theme) akan berlaku.
  }, [currentTheme]); // Dipicu setiap kali currentTheme berubah

  // Effect untuk memuat CSV awal saat aplikasi pertama kali dimuat
  useEffect(() => {
    // Gunakan import.meta.env.BASE_URL untuk fetching assets yang berada di folder public
    // Ini penting untuk penanganan base path saat aplikasi di-deploy di sub-direktori
    fetch(`${import.meta.env.BASE_URL}jadwal_siaran.csv`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        const parsedData = parseCSV(csvText).map((item, idx) => ({ ...item, id: `${item.Segmen}-${idx}` }));
        setProgramData(parsedData);
        setShowExampleScheduleNote(true); // Tampilkan keterangan contoh jadwal
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setShowExampleScheduleNote(false); // Sembunyikan keterangan jika gagal muat
      });
  }, []); // Array dependensi kosong: efek hanya berjalan sekali saat mount

  // Gaya untuk tombol Pengaturan (didefinisikan di sini karena prop drilling)
  const settingsButtonStyle = {
    padding: '10px 18px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    textDecoration: 'none', // Untuk Link agar tidak ada garis bawah
    display: 'inline-block', // Untuk Link agar berperilaku seperti button
    lineHeight: 'normal', // Untuk memastikan teks rata tengah di Link
    marginLeft: '15px' // Memberi jarak dari elemen kontrol lainnya
  };

  const settingsButtonHoverStyle = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
  };
  const [isSettingsHovered, setIsSettingsHovered] = useState(false); // State hover untuk tombol Pengaturan

  // Fungsi untuk menerapkan pengaturan Jam Mulai (dipanggil dari SettingsPage)
  const applySettings = useCallback((newStartTime) => {
    if (isValidTimeFormat(newStartTime)) {
      setStartTime(newStartTime);
      alert(`Pengaturan berhasil diterapkan. Jam Mulai diperbarui ke ${newStartTime}.`);
      navigate('/'); // Kembali ke halaman utama setelah menerapkan
    } else {
      alert('Format Jam Mulai tidak valid! Harap gunakan format HH:MM:SS.');
    }
  }, [navigate]); // `Maps` perlu menjadi dependensi `useCallback`

  // Fungsi untuk mengunggah file CSV (dipanggil dari SettingsPage)
  const handleCsvFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const parsedData = parseCSV(csvText).map((item, idx) => ({ ...item, id: `${item.Segmen}-${idx}` }));
        setProgramData(parsedData); // Perbarui programData di App.jsx
        setShowExampleScheduleNote(false); // Sembunyikan keterangan saat CSV baru diunggah
        alert('File CSV berhasil diunggah dan diterapkan!');
      };
      reader.readAsText(file);
    }
  }, []); // Tidak ada dependensi karena hanya menggunakan setter state

  // Fungsi untuk mengunduh file CSV (dipanggil dari SettingsPage)
  const handleDownloadCsv = useCallback(() => {
    const csvContent = convertToCSV(programData); // Menggunakan programData dari state App.jsx
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jadwal_siaran_terbaru.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Jadwal berhasil diunduh sebagai CSV!');
  }, [programData]); // `programData` adalah dependensi `useCallback` karena digunakan di dalamnya

  // Handler untuk mengubah tema (dipanggil dari DisplaySettings)
  const handleThemeChange = useCallback((themeName) => {
    setCurrentTheme(themeName);
    alert(`Tema berhasil diubah ke: ${themeName}`);
  }, []); // Tidak ada dependensi karena hanya menggunakan setter state

  return (
    <> {/* Fragment digunakan sebagai pembungkus root karena BrowserRouter ada di main.jsx */}
      <Routes>
        <Route
          path="/"
          element={
            <ProgramTable
              startTime={startTime} // Teruskan startTime ke ProgramTable
              programData={programData} // Teruskan programData ke ProgramTable
              setProgramData={setProgramData} // Teruskan setProgramData ke ProgramTable (untuk drag/drop & edit cell)
              showExampleScheduleNote={showExampleScheduleNote} // Teruskan ini juga
              settingsButton={{ // Teruskan props tombol Pengaturan ke ProgramTable
                style: settingsButtonStyle,
                hoverStyle: settingsButtonHoverStyle,
                isHovered: isSettingsHovered,
                setIsHovered: setIsSettingsHovered,
              }}
            />
          }
        />
        {/* Deklarasikan SettingsLayout sebagai induk dengan children routes */}
        <Route path="/settings" element={<SettingsLayout />}>
          {/* Default child route untuk /settings, menampilkan GeneralSettings */}
          <Route
            index
            element={<GeneralSettings currentStartTime={startTime} onApplySettings={applySettings} />}
          />
          {/* Child routes untuk sub-menu pengaturan lainnya */}
          <Route
            path="general"
            element={<GeneralSettings currentStartTime={startTime} onApplySettings={applySettings} />}
          />
          <Route
            path="data"
            element={<DataManagementSettings onCsvFileUpload={handleCsvFileUpload} onDownloadCsv={handleDownloadCsv} />}
          />
          <Route path="roles" element={<UserRolesSettings />} />
          <Route
            path="display"
            element={<DisplaySettings currentTheme={currentTheme} onThemeChange={handleThemeChange} />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;