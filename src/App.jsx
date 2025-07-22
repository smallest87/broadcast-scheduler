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
import SuccessModal from './components/SuccessModal.jsx'; // NEW: Import SuccessModal

function App() {
  const [startTime, setStartTime] = useState('12:00:00');
  const [programData, setProgramData] = useState([]); // State programData dimiliki oleh App.jsx
  const [showExampleScheduleNote, setShowExampleScheduleNote] = useState(true); // State ini juga dimiliki oleh App.jsx
  const [currentTheme, setCurrentTheme] = useState('glassmorphism'); // State untuk tema aktif
  const [showLoadDbButton, setShowLoadDbButton] = useState(false); // NEW: State untuk visibilitas tombol Load DB

  // NEW: State untuk Modal Notifikasi
  const [modalShow, setModalShow] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const navigate = useNavigate(); // Hook untuk navigasi programatis

  // Fungsi untuk menampilkan modal
  const showNotificationModal = useCallback((message) => {
    setModalMessage(message);
    setModalShow(true);
  }, []);

  // Fungsi untuk menyembunyikan modal
  const closeNotificationModal = useCallback(() => {
    setModalShow(false);
    setModalMessage('');
  }, []);

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
        setShowLoadDbButton(true); // NEW: Tampilkan tombol Load DB setelah CSV dimuat
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setShowExampleScheduleNote(false); // Sembunyikan keterangan jika gagal muat
        setShowLoadDbButton(true); // NEW: Tetap tampilkan tombol Load DB meskipun gagal muat CSV
      });
  }, []); // Array dependensi kosong: efek hanya berjalan sekali saat mount

  // NEW: Fungsi untuk memuat data dari database MySQL
  const handleLoadFromDatabase = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/jadwal'); // Asumsi API berjalan di port 3001
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Map data dari API agar sesuai dengan format yang diharapkan (misal: 'id' dari DB, 'Durasi' dari DB jadi 'durasi')
      const formattedData = data.map(item => ({
        id: item.id,
        Durasi: item.durasi,
        Segmen: item.segmen,
        Jenis: item.jenis
      }));
      setProgramData(formattedData);
      setShowExampleScheduleNote(false); // Sembunyikan keterangan saat data DB dimuat
      showNotificationModal('Jadwal berhasil dimuat dari database!'); // NEW: Ganti alert() dengan modal
    } catch (error) {
      console.error('Error loading data from database:', error);
      showNotificationModal('Gagal memuat jadwal dari database. Pastikan backend berjalan.'); // NEW: Ganti alert() dengan modal
      setShowExampleScheduleNote(false); // Sembunyikan keterangan jika gagal
    }
  }, [showNotificationModal]); // Tambahkan showNotificationModal sebagai dependensi

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

  // NEW: Gaya untuk tombol Load Database
  const loadDbButtonStyle = {
    padding: '10px 18px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#28a745', // Warna hijau
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    marginLeft: '15px',
  };

  const loadDbButtonHoverStyle = {
    backgroundColor: '#218838', // Warna hijau lebih gelap saat hover
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
  };
  const [isLoadDbHovered, setIsLoadDbHovered] = useState(false); // State hover untuk tombol Load DB


  // Fungsi untuk menerapkan pengaturan Jam Mulai (dipanggil dari SettingsPage)
  const applySettings = useCallback((newStartTime) => {
    if (isValidTimeFormat(newStartTime)) {
      setStartTime(newStartTime);
      showNotificationModal(`Pengaturan berhasil diterapkan. Jam Mulai diperbarui ke ${newStartTime}.`); // NEW: Ganti alert() dengan modal
      navigate('/'); // Kembali ke halaman utama setelah menerapkan
    } else {
      showNotificationModal('Format Jam Mulai tidak valid! Harap gunakan format HH:MM:SS.'); // NEW: Ganti alert() dengan modal
    }
  }, [navigate, showNotificationModal]); // Tambahkan showNotificationModal sebagai dependensi

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
        showNotificationModal('File CSV berhasil diunggah dan diterapkan!'); // NEW: Ganti alert() dengan modal
        navigate('/'); // NEW: Kembali ke halaman utama setelah upload CSV
      };
      reader.readAsText(file);
    }
  }, [navigate, showNotificationModal]); // Tambahkan navigate dan showNotificationModal sebagai dependensi

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
    showNotificationModal('Jadwal berhasil diunduh sebagai CSV!'); // NEW: Ganti alert() dengan modal
  }, [programData, showNotificationModal]); // Tambahkan showNotificationModal sebagai dependensi

  // Handler untuk mengubah tema (dipanggil dari DisplaySettings)
  const handleThemeChange = useCallback((themeName) => {
    setCurrentTheme(themeName);
    showNotificationModal(`Tema berhasil diubah ke: ${themeName}`); // NEW: Ganti alert() dengan modal
  }, [showNotificationModal]); // Tambahkan showNotificationModal sebagai dependensi

  return (
    <> {/* Fragment digunakan sebagai pembungkus root karena BrowserRouter ada di main.jsx */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-app-content"> {/* NEW: Tambahkan div pembungkus untuk menampung tombol*/}
              {showLoadDbButton && (
                <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '20px' }}>
                  <button
                    onClick={handleLoadFromDatabase}
                    style={isLoadDbHovered ? { ...loadDbButtonStyle, ...loadDbButtonHoverStyle } : loadDbButtonStyle}
                    onMouseEnter={() => setIsLoadDbHovered(true)}
                    onMouseLeave={() => setIsLoadDbHovered(false)}
                  >
                    Muat dari Database
                  </button>
                </div>
              )}
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
            </div>
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

      {/* NEW: Render SuccessModal di sini */}
      <SuccessModal
        show={modalShow}
        message={modalMessage}
        onClose={closeNotificationModal}
      />
    </>
  );
}

export default App;