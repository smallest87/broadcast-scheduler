// src/components/settings/SettingsLayout.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate, Outlet, Link } from 'react-router-dom'; // Import Link

import SettingsMenu from './SettingsMenu.jsx';
// Import komponen settings (meskipun tidak langsung dirender di sini,
// mereka dideklarasikan di App.jsx dan dirender via Outlet)
// import GeneralSettings from './GeneralSettings.jsx';
// import DataManagementSettings from './DataManagementSettings.jsx';
// import UserRolesSettings from './UserRolesSettings.jsx';
// import DisplaySettings from './DisplaySettings.jsx';

import './Settings.css'; // Import CSS baru

const SettingsLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Redirect ke sub-menu default jika hanya /settings yang diakses
    useEffect(() => {
        if (location.pathname === '/settings' || location.pathname === '/settings/') {
            navigate('/settings/general', { replace: true });
        }
    }, [location.pathname, navigate]);

    // NEW: Gaya untuk tombol kembali
    const backButtonStyle = {
        padding: '8px 15px',
        fontSize: '14px',
        cursor: 'pointer',
        backgroundColor: '#6c757d', // Warna abu-abu yang lebih netral
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
        textDecoration: 'none', // Untuk Link
        display: 'inline-block',
        lineHeight: 'normal',
        alignSelf: 'flex-start', // Posisikan di awal baris flex item
        marginBottom: '20px' // Jarak dari konten di bawahnya
    };

    const backButtonHoverStyle = {
        backgroundColor: '#5a6268',
        transform: 'translateY(-1px)',
        boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
    };

    const [isBackHovered, setIsBackHovered] = React.useState(false); // State untuk efek hover

    return (
        <div className="settings-container">
            <SettingsMenu />
            <div className="settings-content">
                {/* Tombol kembali ke halaman utama */}
                <Link
                    to="/" // Mengarah ke root path
                    style={isBackHovered ? { ...backButtonStyle, ...backButtonHoverStyle } : backButtonStyle}
                    onMouseEnter={() => setIsBackHovered(true)}
                    onMouseLeave={() => setIsBackHovered(false)}
                >
                    &larr; Kembali ke Utama
                </Link>

                {/* Outlet akan merender komponen Route anak yang cocok dari App.jsx */}
                <Outlet />
            </div>
        </div>
    );
};

export default SettingsLayout;