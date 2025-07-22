// src/config/rolesConfig.js

export const ROLES_CONFIG = {
    'Subscriber': {
        name: 'Subscriber',
        features: {
            showColumns: ['Rundown', 'Segmen'],
            canDragAndDrop: false,
            canEditCells: false,
            // Tambahkan fitur lain di sini sesuai kebutuhan
            // canUploadCSV: false,
            // canDownloadCSV: false,
        }
    },
    'Traffic Manager': {
        name: 'Traffic Manager',
        features: {
            showColumns: ['Rundown', 'Durasi', 'Segmen', 'Jenis'],
            canDragAndDrop: true,
            canEditCells: true,
            // canUploadCSV: true,
            // canDownloadCSV: true,
        }
    },
    // Contoh peran baru: 'Viewer'
    'Viewer': {
        name: 'Viewer',
        features: {
            showColumns: ['Rundown', 'Segmen', 'Jenis'], // Mungkin Viewer bisa melihat Jenis tapi tidak Durasi
            canDragAndDrop: false,
            canEditCells: false,
        }
    },
    // Contoh peran baru: 'Editor'
    'Editor': {
        name: 'Editor',
        features: {
            showColumns: ['Rundown', 'Durasi', 'Segmen', 'Jenis'],
            canDragAndDrop: false, // Editor tidak bisa drag-drop, hanya edit
            canEditCells: true,
        }
    }
    // Anda bisa tambahkan peran lain di sini dengan fitur yang berbeda
};

// Fungsi utilitas untuk mendapatkan konfigurasi fitur berdasarkan peran
export const getRoleFeatures = (roleName) => {
    return ROLES_CONFIG[roleName]?.features || ROLES_CONFIG['Subscriber'].features; // Fallback ke Subscriber jika peran tidak ditemukan
};

// Mendapatkan daftar semua peran untuk dropdown
export const getAllRoleNames = () => {
    return Object.keys(ROLES_CONFIG);
};