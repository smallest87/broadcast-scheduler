import React, { useState, useRef, useEffect } from 'react';
import { isValidTimeFormat } from '../utils/timeUtils.js'; // Pastikan .js

const ProgramRow = React.memo(({ item, index, onUpdateCell, baseRowHeight, BASE_HEIGHT_MINUTES }) => {
    const [isEditing, setIsEditing] = useState(null); // Menyimpan kolom yang sedang diedit ('Durasi', 'Segmen', 'Jenis')
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null); // Ref untuk input field saat mengedit

    // Hitung tinggi dinamis berdasarkan durasi
    const durationInMinutes = parseFloat(item.DurationSeconds / 60); // Konversi detik ke menit
    const calculatedHeight = (durationInMinutes / BASE_HEIGHT_MINUTES) * baseRowHeight;
    const rowHeight = Math.max(calculatedHeight, baseRowHeight || 40); // Minimal 40px atau baseRowHeight jika 0

    // Fokus ke input field saat mode edit aktif
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = (columnKey, currentValue) => {
        setIsEditing(columnKey);
        setInputValue(currentValue);
    };

    const handleBlur = () => {
        if (isEditing) {
            let newValue = inputValue.trim();
            let shouldUpdate = true;

            if (isEditing === 'Durasi') {
                if (!isValidTimeFormat(newValue)) {
                    alert('Format waktu tidak valid! Harap gunakan format HH:MM:SS (contoh: 01:23:45).');
                    shouldUpdate = false; // Jangan update jika format tidak valid
                }
            }

            if (shouldUpdate) {
                onUpdateCell(index, isEditing, newValue); // Panggil fungsi update dari parent
            }
            setIsEditing(null); // Keluar dari mode edit
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur(); // Selesai edit saat Enter
        }
    };

    // Fungsi untuk merender konten sel (teks biasa atau input field)
    const renderCellContent = (columnKey, value) => {
        if (isEditing === columnKey) {
            return (
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                />
            );
        }
        return (
            <>
                {value}
                {/* Tambahkan blinking circle hanya jika Jenis adalah LIVE */}
                {columnKey === 'Jenis' && value && value.toUpperCase() === 'LIVE' && (
                    <span className="blinking-circle"></span>
                )}
            </>
        );
    };

    return (
        <div
            className={`program-row ${item.Jenis && item.Jenis.toUpperCase() === 'LIVE' ? 'live-segment' : ''}`}
            data-program-data-index={index}
            id={`row-${index}`}
            style={{ height: `${rowHeight}px` }}
        >
            <div className="program-cell rundown-col">{item.Rundown || ''}</div>
            <div
                className="program-cell duration-col editable-cell"
                onDoubleClick={() => handleDoubleClick('Durasi', item.Durasi)}
            >
                {renderCellContent('Durasi', item.Durasi)}
            </div>
            <div
                className="program-cell segment-col editable-cell"
                onDoubleClick={() => handleDoubleClick('Segmen', item.Segmen)}
            >
                {renderCellContent('Segmen', item.Segmen)}
            </div>
            <div
                className="program-cell type-col editable-cell"
                onDoubleClick={() => handleDoubleClick('Jenis', item.Jenis)}
            >
                {renderCellContent('Jenis', item.Jenis)}
            </div>
        </div>
    );
});

export default ProgramRow;