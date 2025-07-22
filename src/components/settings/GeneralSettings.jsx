// src/components/settings/GeneralSettings.jsx
import React, { useState, useEffect } from 'react';
import './Settings.css'; // Gaya umum pengaturan

const GeneralSettings = ({ currentStartTime, onApplySettings }) => {
    const [newTime, setNewTime] = useState(currentStartTime);

    // Update newTime jika currentStartTime dari props berubah (misalnya, saat kembali ke halaman ini)
    useEffect(() => {
        setNewTime(currentStartTime);
    }, [currentStartTime]);

    const handleApplyClick = () => {
        onApplySettings(newTime);
    };

    return (
        <div className="settings-content">
            <h4>Pengaturan Umum</h4>
            <div className="settings-input-group">
                <label htmlFor="startTimeInputSettings">Jam Mulai Default:</label>
                <input
                    type="time"
                    id="startTimeInputSettings"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    step="1"
                />
                <button onClick={handleApplyClick}>
                    Terapkan Jam Mulai
                </button>
            </div>
            {/* Tambahkan pengaturan umum lainnya di sini */}
        </div>
    );
};

export default GeneralSettings;