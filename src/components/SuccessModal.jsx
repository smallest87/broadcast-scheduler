// src/components/SuccessModal.jsx
import React from 'react';
import '../styles/SuccessModal.css'; // Kita akan membuat file CSS ini nanti

const SuccessModal = ({ show, message, onClose }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Berhasil!</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose}>Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;