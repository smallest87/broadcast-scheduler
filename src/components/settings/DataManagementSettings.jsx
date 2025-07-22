// src/components/settings/DataManagementSettings.jsx
import React from 'react';
import './Settings.css'; // Gaya umum pengaturan

const DataManagementSettings = ({ onCsvFileUpload, onDownloadCsv }) => {
    return (
        <div className="settings-content">
            <h4>Manajemen Data</h4>
            <div className="settings-input-group">
                <label htmlFor="csvFileInputSettings">Unggah Jadwal CSV:</label>
                <input type="file" id="csvFileInputSettings" accept=".csv" onChange={onCsvFileUpload} />
                {/* Tombol unduh CSV kini terpisah dari input file */}
                <button onClick={onDownloadCsv}>
                    Unduh Jadwal CSV
                </button>
            </div>
            {/* Tambahkan pengaturan data lainnya di sini */}
        </div>
    );
};

export default DataManagementSettings;