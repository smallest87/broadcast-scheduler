// src/components/settings/SettingsMenu.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Settings.css';

const SettingsMenu = () => {
    return (
        <div className="settings-sidebar">
            <h3>Pengaturan</h3>
            {/* Gunakan path relatif tanpa awalan '.' */}
            {/* React Router v6 cukup pintar untuk menangani ini dalam nested routes */}
            <NavLink to="general" className={({ isActive }) => "settings-menu-item" + (isActive ? " active" : "")}>
                Umum
            </NavLink>
            <NavLink to="data" className={({ isActive }) => "settings-menu-item" + (isActive ? " active" : "")}>
                Manajemen Data
            </NavLink>
            <NavLink to="roles" className={({ isActive }) => "settings-menu-item" + (isActive ? " active" : "")}>
                Peran Pengguna
            </NavLink>
            <NavLink to="display" className={({ isActive }) => "settings-menu-item" + (isActive ? " active" : "")}>
                Tampilan
            </NavLink>
            {/* Tambahkan item menu lain di sini */}
        </div>
    );
};

export default SettingsMenu;