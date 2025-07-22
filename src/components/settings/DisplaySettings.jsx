// src/components/settings/DisplaySettings.jsx
import React from 'react';
import './Settings.css'; // Gaya umum pengaturan

const DisplaySettings = ({ currentTheme, onThemeChange }) => {
    return (
        <div className="settings-content">
            <h4>Pengaturan Tampilan</h4>
            <p>Ini adalah tempat untuk mengubah preferensi tampilan aplikasi (misalnya tema, ukuran font).</p>
            <div className="settings-input-group">
                <label htmlFor="themeSelect">Pilih Tema:</label>
                <select
                    id="themeSelect"
                    value={currentTheme}
                    onChange={(e) => onThemeChange(e.target.value)}
                >
                    <option value="glassmorphism">Glassmorphism (Default)</option>
                    <option value="light">Ringan & Bersih</option>
                    <option value="dark">Gelap (Bersih)</option> {/* <--- BARIS BARU UNTUK TEMA DARK */}
                </select>
            </div>
            {/* Tambahkan opsi tampilan lain di sini */}
        </div>
    );
};

export default DisplaySettings;