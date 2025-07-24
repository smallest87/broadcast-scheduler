// src/components/RealTimeIndicator.jsx

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { timeToSeconds, secondsToTime, isValidTimeFormat } from '../utils/timeUtils.js';

import './RealTimeIndicator.css'; // Pastikan file ini ada dan kosong atau berisi gaya dasar jika mau

const RealTimeIndicator = React.memo(({ programBodyRef, programTableRef, tableWrapperRef, dataWithRundownCache, baseRowHeight }) => {
    const animationFrameRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({
        top: null,
        left: null,
        width: null,
        display: 'none' // Sembunyikan secara default sampai dihitung
    });
    const [timeLabel, setTimeLabel] = useState('');

    // Optimize animation to run at 2fps instead of 60fps for better performance
    const lastUpdateRef = useRef(0);
    const UPDATE_INTERVAL = 500; // Update every 500ms (2fps)

    useEffect(() => {
        const animateIndicator = (timestamp) => {
            // Throttle updates to reduce CPU usage
            if (timestamp - lastUpdateRef.current < UPDATE_INTERVAL) {
                animationFrameRef.current = requestAnimationFrame(animateIndicator);
                return;
            }
            lastUpdateRef.current = timestamp;

            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentSeconds = now.getSeconds();
            const currentSecondsOfDay = (currentHours * 3600) + (currentMinutes * 60) + currentSeconds;

            const formattedCurrentTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;
            setTimeLabel(formattedCurrentTime); // Update label waktu

            let indicatorTop = null;
            let indicatorLeft = null;
            let indicatorWidth = null;
            let display = 'none';

            if (programTableRef.current && tableWrapperRef.current && programBodyRef.current && baseRowHeight > 0 && dataWithRundownCache && dataWithRundownCache.length > 0) {
                const tableWrapperRect = tableWrapperRef.current.getBoundingClientRect();
                const programTableRect = programTableRef.current.getBoundingClientRect();

                for (let i = 0; i < dataWithRundownCache.length; i++) {
                    const item = dataWithRundownCache[i];
                    const rowElement = programBodyRef.current.children[i];

                    if (!rowElement) continue;

                    if (currentSecondsOfDay >= item.RundownStartSeconds && currentSecondsOfDay < item.RundownEndSeconds) {
                        const elapsedSecondsInSegment = currentSecondsOfDay - item.RundownStartSeconds;
                        const percentageThroughSegment = item.DurationSeconds > 0 ? (elapsedSecondsInSegment / item.DurationSeconds) : 0;

                        const rowRect = rowElement.getBoundingClientRect();
                        const rowTopRelativeToTableWrapper = rowRect.top - tableWrapperRect.top;

                        indicatorTop = rowTopRelativeToTableWrapper + (rowRect.height * percentageThroughSegment);
                        indicatorWidth = programTableRect.width;
                        indicatorLeft = programTableRect.left - tableWrapperRect.left;
                        display = 'block'; // Tampilkan indikator jika ditemukan segmen
                        break;
                    }
                }
            }

            // Perbarui state style indikator
            setIndicatorStyle(prevStyle => ({ // Gunakan updater function untuk setStyle
                ...prevStyle, // Pertahankan properti lain yang tidak berubah
                top: indicatorTop !== null ? indicatorTop : prevStyle.top,
                left: indicatorLeft !== null ? indicatorLeft : prevStyle.left,
                width: indicatorWidth !== null ? indicatorWidth : prevStyle.width,
                display: display
            }));

            // Panggil frame berikutnya
            animationFrameRef.current = requestAnimationFrame(animateIndicator);
        };

        // Mulai loop animasi
        animationFrameRef.current = requestAnimationFrame(animateIndicator);

        // Cleanup: Hentikan loop saat komponen unmount
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [programBodyRef, programTableRef, tableWrapperRef, dataWithRundownCache, baseRowHeight]); // Dependensi: refs dan data yang diperlukan

    // Gaya inline untuk indikator garis
    const indicatorLineStyle = { // Ubah nama variabel untuk kejelasan
        opacity: '60%',
        position: 'absolute',
        backgroundColor: '#ff3333', // Warna merah asli
        height: '2px',
        // Tambahkan kembali box-shadow dan z-index asli
        boxShadow: '0 0 10px rgba(255, 51, 51, 0.7), 0 0 5px rgba(255, 51, 51, 0.5)',
        zIndex: 50,
        borderRadius: '1px',
        pointerEvents: 'none',
        transition: 'top 0.5s linear', // Transisi asli yang lebih halus
        // Gaya yang dihitung dari state
        top: indicatorStyle.top !== null ? `${indicatorStyle.top}px` : 'auto',
        left: indicatorStyle.left !== null ? `${indicatorStyle.left}px` : 'auto',
        width: indicatorStyle.width !== null ? `${indicatorStyle.width}px` : 'auto', // Auto untuk default saat hidden
        display: indicatorStyle.display
    };

    // Gaya inline untuk label waktu
    const labelTextStyle = { // Ubah nama variabel untuk kejelasan
        position: 'absolute',
        backgroundColor: '#ff3333', // Warna merah asli
        color: 'white',
        padding: '4px 8px', // Padding asli
        fontSize: '13px', // Ukuran font asli
        border: 'none', // Pastikan tidak ada border
        borderRadius: '5px', // Border-radius asli
        whiteSpace: 'nowrap',
        transform: 'translateY(-50%)', // Transform asli
        right: '0',
        marginRight: '-75px', // Margin asli
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)', // Box-shadow asli
        zIndex: 51, // Z-index asli
    };

    return (
        <div style={indicatorLineStyle}>
            <span style={labelTextStyle}>
                {timeLabel}
            </span>
        </div>
    );
});

RealTimeIndicator.displayName = 'RealTimeIndicator';

export default RealTimeIndicator;