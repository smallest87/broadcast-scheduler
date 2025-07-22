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
import './styles/theme-dark.css'; // NEW: Import gaya tema dark

function App() {
  const [startTime, setStartTime] = useState('12:00:00');
  const [programData, setProgramData] = useState([]);
  const [showExampleScheduleNote, setShowExampleScheduleNote] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('glassmorphism'); // Default ke glassmorphism

  const navigate = useNavigate();

  // Effect untuk mengatur kelas di elemen body berdasarkan tema yang dipilih
  useEffect(() => {
    // Hapus semua kelas tema yang mungkin ada
    document.body.classList.remove('light-theme', 'dark-theme');

    // Tambahkan kelas tema yang sesuai
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme');
    } else if (currentTheme === 'dark') { // NEW: Tambahkan kondisi untuk tema dark
      document.body.classList.add('dark-theme');
    }
    // Jika currentTheme adalah 'glassmorphism', tidak ada kelas tambahan yang ditambahkan,
    // sehingga gaya default di index.css dan ProgramTable.css yang `:not(.light-theme):not(.dark-theme)` akan berlaku.
  }, [currentTheme]); // Dipicu setiap kali currentTheme berubah

  // ... (sisanya kode App.jsx sama seperti sebelumnya) ...

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
    textDecoration: 'none',
    display: 'inline-block',
    lineHeight: 'normal',
    marginLeft: '15px'
  };

  const settingsButtonHoverStyle = {
    backgroundColor: '#0056b3',
    transform: 'translateY(-1px)',
    boxCshadow: '0 4px 8px rgba(0,0,0,0.25)',
  };
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  useEffect(() => {
    fetch('/jadwal_siaran.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        const parsedData = parseCSV(csvText).map((item, idx) => ({ ...item, id: `${item.Segmen}-${idx}` }));
        setProgramData(parsedData);
        setShowExampleScheduleNote(true);
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setShowExampleScheduleNote(false);
      });
  }, []);

  const applySettings = useCallback((newStartTime) => {
    if (isValidTimeFormat(newStartTime)) {
      setStartTime(newStartTime);
      alert(`Pengaturan berhasil diterapkan. Jam Mulai diperbarui ke ${newStartTime}.`);
      navigate('/');
    } else {
      alert('Format Jam Mulai tidak valid! Harap gunakan format HH:MM:SS.');
    }
  }, [navigate]);

  const handleCsvFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const parsedData = parseCSV(csvText).map((item, idx) => ({ ...item, id: `${item.Segmen}-${idx}` }));
        setProgramData(parsedData);
        setShowExampleScheduleNote(false);
        alert('File CSV berhasil diunggah dan diterapkan!');
      };
      reader.readAsText(file);
    }
  }, []);

  const handleDownloadCsv = useCallback(() => {
    const csvContent = convertToCSV(programData);
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
  }, [programData]);

  // Handler untuk mengubah tema
  const handleThemeChange = useCallback((themeName) => {
    setCurrentTheme(themeName);
    alert(`Tema berhasil diubah ke: ${themeName}`);
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProgramTable
              startTime={startTime}
              programData={programData}
              setProgramData={setProgramData}
              showExampleScheduleNote={showExampleScheduleNote}
              settingsButton={{
                style: settingsButtonStyle,
                hoverStyle: settingsButtonHoverStyle,
                isHovered: isSettingsHovered,
                setIsHovered: setIsSettingsHovered,
              }}
            />
          }
        />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route
            index
            element={<GeneralSettings currentStartTime={startTime} onApplySettings={applySettings} />}
          />
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