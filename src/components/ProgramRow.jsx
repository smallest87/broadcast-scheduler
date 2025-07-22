// src/components/ProgramRow.jsx

import React, { useState, useEffect, useRef } from 'react';
import { timeToSeconds, secondsToTime, isValidTimeFormat } from '../utils/timeUtils.js';

const ProgramRow = ({ item, index, onUpdateCell, baseRowHeight, BASE_HEIGHT_MINUTES, viewMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedValue, setEditedValue] = useState('');
    const inputRef = useRef(null);

    // Hitung tinggi baris berdasarkan durasi item
    const calculatedHeight = (item.DurationSeconds / (BASE_HEIGHT_MINUTES * 60)) * baseRowHeight;
    const rowHeight = Math.max(calculatedHeight, baseRowHeight || 40);

    // Cek apakah segmen ini "LIVE"
    const isLiveSegment = item.Jenis && item.Jenis.toUpperCase() === 'LIVE';

    const handleDoubleClick = (e, columnKey, initialValue) => {
        // Hanya izinkan edit di mode Traffic Manager
        if (viewMode === 'Traffic Manager') {
            setIsEditing(columnKey);
            setEditedValue(initialValue);
        }
    };

    const handleBlur = () => {
        if (isEditing) {
            onUpdateCell(index, isEditing, editedValue);
            setIsEditing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const renderCellContent = (columnKey, value) => {
        if (isEditing === columnKey) {
            return (
                <input
                    ref={inputRef}
                    type="text"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                />
            );
        }
        return value;
    };

    return (
        <div
            className={`program-row ${isLiveSegment ? 'live-segment' : ''}`}
            style={{ height: `${rowHeight}px` }}
        >
            {/* Kolom Rundown (selalu tampil) */}
            <div
                className="program-cell rundown-col"
                onDoubleClick={(e) => handleDoubleClick(e, 'Rundown', item.Rundown)}
            >
                {renderCellContent('Rundown', item.Rundown)}
            </div>

            {/* Kolom Segmen (selalu tampil) */}
            <div
                className="program-cell segment-col editable-cell"
                onDoubleClick={(e) => handleDoubleClick(e, 'Segmen', item.Segmen)}
            >
                {renderCellContent('Segmen', item.Segmen)}
                {/* Hapus blinking circle dari sini */}
            </div>

            {/* Conditional rendering untuk kolom Durasi dan Jenis */}
            {viewMode === 'Traffic Manager' && (
                <>
                    <div
                        className="program-cell duration-col editable-cell"
                        onDoubleClick={(e) => handleDoubleClick(e, 'Durasi', item.Durasi)}
                    >
                        {renderCellContent('Durasi', item.Durasi)}
                    </div>
                    <div
                        className="program-cell type-col editable-cell"
                        onDoubleClick={(e) => handleDoubleClick(e, 'Jenis', item.Jenis)}
                    >
                        {renderCellContent('Jenis', item.Jenis)}
                        {/* PERBAIKAN: Blinking circle dikembalikan ke kolom Jenis */}
                        {isLiveSegment && <span className="blinking-circle"></span>}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProgramRow;