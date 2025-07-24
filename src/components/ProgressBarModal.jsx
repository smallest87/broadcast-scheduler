// src/components/ProgressBarModal.jsx
import React from 'react';
import './ProgressBarModal.css';

const ProgressBarModal = ({ show, message }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay-progress">
            <div className="modal-content-progress">
                <div className="spinner"></div>
                <p>{message}</p> {/* Menampilkan pesan yang diterima */}
            </div>
        </div>
    );
};

export default ProgressBarModal;