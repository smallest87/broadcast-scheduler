// src/components/settings/UserRolesSettings.jsx
import React from 'react';
import './Settings.css'; // Gaya umum pengaturan

const UserRolesSettings = () => {
    return (
        <div className="settings-content">
            <h4>Pengaturan Peran Pengguna</h4>
            <p>Ini adalah tempat untuk mengelola peran dan izin pengguna dalam aplikasi.</p>
            <div className="settings-input-group">
                <label>Contoh Opsi Peran:</label>
                <select>
                    <option>Admin</option>
                    <option>Editor</option>
                    <option>Guest</option>
                </select>
                <button>Simpan Peran</button>
            </div>
        </div>
    );
};

export default UserRolesSettings;