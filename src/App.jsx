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
import { mapApiProgramData } from './utils/dataMapping.js'; // NEW: Import fungsi mapper
import './index.css';
import './styles/theme-light.css';
import './styles/theme-dark.css';
import SuccessModal from './components/SuccessModal.jsx';

function App() {
  const [startTime, setStartTime] = useState('12:00:00');
  const [programData, setProgramData] = useState([]);
  const [showExampleScheduleNote, setShowExampleScheduleNote] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('glassmorphism');
  const [showLoadDbButton, setShowLoadDbButton] = useState(false);

  const [modalShow, setModalShow] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const navigate = useNavigate();

  const showNotificationModal = useCallback((message) => {
    setModalMessage(message);
    setModalShow(true);
  }, []);

  const closeNotificationModal = useCallback(() => {
    setModalShow(false);
    setModalMessage('');
  }, []);

  useEffect(() => {
    document.body.classList.remove('light-theme', 'dark-theme');
    if (currentTheme === 'light') {
      document.body.classList.add('light-theme');
    } else if (currentTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }
  }, [currentTheme]);

  useEffect(() => {
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
        setShowExampleScheduleNote(true);
        setShowLoadDbButton(true);
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setShowExampleScheduleNote(false);
        setShowLoadDbButton(true);
      });
  }, []);

  const handleLoadFromDatabase = useCallback(async () => {
    try {
      const response = await fetch('https://api.newsnoid.com/jadwal-program');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('API Raw Response Result:', result);

      if (!result || !Array.isArray(result.data)) {
        throw new TypeError('API response does not contain an array in the "data" property. Please check the API endpoint structure.');
      }

      const apiDataArray = result.data;

      // NEW: Panggil fungsi mapper yang sudah dipisahkan
      const formattedData = mapApiProgramData(apiDataArray);

      setProgramData(formattedData);
      setShowExampleScheduleNote(false);
      showNotificationModal('Jadwal berhasil dimuat dari database!');
    } catch (error) {
      console.error('Error loading data from database:', error);
      showNotificationModal(`Gagal memuat jadwal dari database: ${error.message}.`);
      setShowExampleScheduleNote(false);
    }
  }, [showNotificationModal]);

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
    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
  };
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  const loadDbButtonStyle = {
    padding: '10px 18px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    marginLeft: '15px',
  };

  const loadDbButtonHoverStyle = {
    backgroundColor: '#218838',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
  };
  const [isLoadDbHovered, setIsLoadDbHovered] = useState(false);

  const applySettings = useCallback((newStartTime) => {
    if (isValidTimeFormat(newStartTime)) {
      setStartTime(newStartTime);
      showNotificationModal(`Pengaturan berhasil diterapkan. Jam Mulai diperbarui ke ${newStartTime}.`);
      navigate('/');
    } else {
      showNotificationModal('Format Jam Mulai tidak valid! Harap gunakan format HH:MM:SS.');
    }
  }, [navigate, showNotificationModal]);

  const handleCsvFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const parsedData = parseCSV(csvText).map((item, idx) => ({ ...item, id: `${item.Segmen}-${idx}` }));
        setProgramData(parsedData);
        setShowExampleScheduleNote(false);
        showNotificationModal('File CSV berhasil diunggah dan diterapkan!');
        navigate('/');
      };
      reader.readAsText(file);
    }
  }, [navigate, showNotificationModal]);

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
    showNotificationModal('Jadwal berhasil diunduh sebagai CSV!');
  }, [programData, showNotificationModal]);

  const handleThemeChange = useCallback((themeName) => {
    setCurrentTheme(themeName);
    showNotificationModal(`Tema berhasil diubah ke: ${themeName}`);
  }, [showNotificationModal]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-app-content">
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
            </div>
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

      <SuccessModal
        show={modalShow}
        message={modalMessage}
        onClose={closeNotificationModal}
      />
    </>
  );
}

export default App;