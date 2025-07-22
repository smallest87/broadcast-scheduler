// src/components/ProgramTable.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sortable from 'sortablejs';
import ProgramRow from './ProgramRow.jsx';
import RealTimeIndicator from './RealTimeIndicator.jsx';
import { timeToSeconds, secondsToTime, isValidTimeFormat, durationToMinutes } from '../utils/timeUtils.js';
import { parseCSV, convertToCSV } from '../utils/csvUtils.js';

import './ProgramTable.css';

const BASE_HEIGHT_MINUTES = 10;
const DEFAULT_ROW_HEIGHT_PX = 40;

const ProgramTable = () => {
    const [programData, setProgramData] = useState([]);
    const [dataWithRundownCache, setDataWithRundownCache] = useState([]);
    const [startTime, setStartTime] = useState('12:00:00');
    const [baseRowHeight, setBaseRowHeight] = useState(DEFAULT_ROW_HEIGHT_PX);
    const [showExampleScheduleNote, setShowExampleScheduleNote] = useState(true);
    const [viewMode, setViewMode] = useState('Traffic Manager'); // Default: tampilkan semua kolom

    const [indicatorState, setIndicatorState] = useState({
        top: null,
        left: null,
        width: null,
        timeLabel: ''
    });

    const programBodyRef = useRef(null);
    const programTableRef = useRef(null);
    const tableWrapperRef = useRef(null);
    const sortableInstanceRef = useRef(null); // NEW: Ref untuk menyimpan instance Sortable

    useEffect(() => {
        const calculateBaseHeight = () => {
            if (programBodyRef.current) {
                const dummyRow = document.createElement('div');
                dummyRow.classList.add('program-row');
                dummyRow.style.visibility = 'hidden';
                dummyRow.style.position = 'absolute';
                dummyRow.style.width = '100%';
                dummyRow.style.minWidth = 'unset';
                dummyRow.style.padding = '0';
                dummyRow.innerHTML = `
                    <div class="program-cell rundown-col">00:00:00</div>
                    <div class="program-cell duration-col">00:00:00</div>
                    <div class="program-cell segment-col">Sample Text</div>
                    <div class="program-cell type-col">Type</div>
                `;

                programBodyRef.current.appendChild(dummyRow);
                const measuredHeight = dummyRow.offsetHeight;
                programBodyRef.current.removeChild(dummyRow);

                if (measuredHeight > 0) {
                    setBaseRowHeight(measuredHeight);
                    console.log('Base row height for 10 minutes:', measuredHeight);
                } else {
                    console.warn('Measured base row height is 0, using default:', DEFAULT_ROW_HEIGHT_PX);
                    setBaseRowHeight(DEFAULT_ROW_HEIGHT_PX);
                }
            }
        };

        calculateBaseHeight();

        // Muat CSV awal
        // Memuat file CSV 'jadwal_siaran.csv' sebagai contoh jadwal siaran
        fetch('/jadwal_siaran.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                const parsedData = parseCSV(csvText).map((item, idx) => ({ ...item, id: `${item.Segmen}-${idx}` }));
                setProgramData(parsedData);
                setShowExampleScheduleNote(true);
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                setShowExampleScheduleNote(false);
            });

    }, []);

    const calculateRundown = useCallback((data) => {
        let currentAccumulatedSeconds = timeToSeconds(startTime);

        return data.map((item, index) => {
            const itemDurationSeconds = isValidTimeFormat(item.Durasi) ? timeToSeconds(item.Durasi) : 0;

            const rundownStartTime = secondsToTime(currentAccumulatedSeconds);
            const rundownStartSeconds = currentAccumulatedSeconds;

            currentAccumulatedSeconds += itemDurationSeconds;
            const rundownEndSeconds = currentAccumulatedSeconds;
            const rundownEndTime = secondsToTime(rundownEndSeconds);

            return {
                id: item.id || `${item.Segmen}-${index}-${Date.now()}`,
                Rundown: rundownStartTime,
                RundownStartSeconds: rundownStartSeconds,
                RundownEnd: rundownEndTime,
                RundownEndSeconds: rundownEndSeconds,
                DurationSeconds: itemDurationSeconds,
                Durasi: item.Durasi,
                Segmen: item.Segmen,
                Jenis: item.Jenis
            };
        });
    }, [startTime]);

    useEffect(() => {
        setDataWithRundownCache(calculateRundown(programData));
    }, [programData, startTime, calculateRundown]);

    // NEW useEffect untuk mengontrol Sortable berdasarkan viewMode dan programData
    useEffect(() => {
        if (sortableInstanceRef.current) {
            sortableInstanceRef.current.destroy(); // Hancurkan instance yang ada
            sortableInstanceRef.current = null;
        }

        if (viewMode === 'Traffic Manager' && programBodyRef.current) {
            sortableInstanceRef.current = Sortable.create(programBodyRef.current, {
                animation: 300,
                ghostClass: 'sortable-ghost-custom',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                handle: '.program-row',
                onEnd: function (evt) {
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;

                    setProgramData(prevData => {
                        const newData = [...prevData];
                        const [movedItem] = newData.splice(oldIndex, 1);
                        newData.splice(newIndex, 0, movedItem);
                        return newData;
                    });
                }
            });
        }

        // Cleanup function: Hancurkan Sortable saat komponen unmount atau dependensi berubah
        return () => {
            if (sortableInstanceRef.current) {
                sortableInstanceRef.current.destroy();
                sortableInstanceRef.current = null;
            }
        };
    }, [programData, viewMode]); // Dependensi: programData dan viewMode

    const updateRealTimeIndicator = useCallback(() => {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        const currentSecondsOfDay = (currentHours * 3600) + (currentMinutes * 60) + currentSeconds;

        const formattedCurrentTime = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;

        let foundSegment = false;
        let indicatorTop = null;
        let indicatorLeft = null;
        let indicatorWidth = null;

        if (programTableRef.current && tableWrapperRef.current && programBodyRef.current && baseRowHeight > 0) {
            const tableWrapperRect = tableWrapperRef.current.getBoundingClientRect();
            const programTableRect = programTableRef.current.getBoundingClientRect();

            for (let i = 0; i < dataWithRundownCache.length; i++) {
                const item = dataWithRundownCache[i];
                const rowElement = programBodyRef.current.children[i];

                if (!rowElement) continue;

                if (currentSecondsOfDay >= item.RundownStartSeconds && currentSecondsOfDay < item.RundownEndSeconds) {
                    foundSegment = true;

                    const elapsedSecondsInSegment = currentSecondsOfDay - item.RundownStartSeconds;
                    const percentageThroughSegment = item.DurationSeconds > 0 ? (elapsedSecondsInSegment / item.DurationSeconds) : 0;

                    const rowRect = rowElement.getBoundingClientRect();
                    const rowTopRelativeToTableWrapper = rowRect.top - tableWrapperRect.top;

                    indicatorTop = rowTopRelativeToTableWrapper + (rowRect.height * percentageThroughSegment);
                    indicatorWidth = programTableRect.width;
                    indicatorLeft = programTableRect.left - tableWrapperRect.left;

                    break;
                }
            }
        }

        setIndicatorState({
            top: indicatorTop,
            left: indicatorLeft,
            width: indicatorWidth,
            timeLabel: formattedCurrentTime
        });

        requestAnimationFrame(updateRealTimeIndicator);
    }, [dataWithRundownCache, baseRowHeight]);

    useEffect(() => {
        requestAnimationFrame(updateRealTimeIndicator);
    }, [updateRealTimeIndicator]);

    const handleCsvFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvText = e.target.result;
                const parsedData = parseCSV(csvText).map((item, idx) => ({ ...item, id: `${item.Segmen}-${idx}` }));
                setProgramData(parsedData);
                setShowExampleScheduleNote(false);
            };
            reader.readAsText(file);
        }
    };

    const handleDownloadCsv = () => {
        const csvContent = convertToCSV(programData);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jadwal_siaran_terbaru.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleApplyStartTime = () => {
        const startTimeInput = document.getElementById('startTimeInput');
        const newStartTime = startTimeInput.value;
        if (isValidTimeFormat(newStartTime)) {
            setStartTime(newStartTime);
            alert(`Jam Mulai berhasil diperbarui ke ${newStartTime}.`);
        } else {
            alert('Format Jam Mulai tidak valid! Harap gunakan format HH:MM:SS.');
        }
    };

    const handleUpdateCell = useCallback((rowIndex, columnKey, newValue) => {
        setProgramData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
                const updatedItem = { ...newData[rowIndex], [columnKey]: newValue };
                if (columnKey === 'Durasi') {
                    updatedItem.DurationSeconds = isValidTimeFormat(newValue) ? timeToSeconds(newValue) : 0;
                }
                newData[rowIndex] = updatedItem;
            }
            return newData;
        });
    }, []);

    // Handler untuk perubahan dropdown
    const handleViewModeChange = (event) => {
        setViewMode(event.target.value);
    };

    return (
        <div>
            <h1>Jadwal Acara</h1>
            {showExampleScheduleNote && (
                <p style={{ textAlign: 'center', color: '#495057', fontSize: '1.1em', marginTop: '-15px', marginBottom: '20px', textShadow: '0 0 2px rgba(255,255,255,0.5)' }}>
                    Contoh Jadwal Siaran
                </p>
            )}

            <div className="controls">
                <label htmlFor="viewModeSelect">Tampilan:</label>
                <select id="viewModeSelect" value={viewMode} onChange={handleViewModeChange}>
                    <option value="Subscriber">Subscriber</option>
                    <option value="Traffic Manager">Traffic Manager</option>
                </select>

                <label htmlFor="startTimeInput">Jam Mulai:</label>
                <input
                    type="time"
                    id="startTimeInput"
                    defaultValue={startTime}
                    step="1"
                />
                <button onClick={handleApplyStartTime}>Terapkan Jam Mulai</button>

                <input type="file" id="csvFileInput" accept=".csv" onChange={handleCsvFileUpload} />
                <button onClick={handleDownloadCsv}>Unduh CSV</button>
            </div>

            <div id="tableWrapper" ref={tableWrapperRef}>
                <RealTimeIndicator
                    top={indicatorState.top}
                    left={indicatorState.left}
                    width={indicatorState.width}
                    timeLabel={indicatorState.timeLabel}
                />
                <div id="programTable" className="program-container" ref={programTableRef}>
                    <div className="program-header">
                        <div className="program-row">
                            <div className="program-cell rundown-col">Rundown</div>
                            <div className="program-cell segment-col">Segmen</div>
                            {/* Conditional rendering untuk header kolom Durasi dan Jenis */}
                            {viewMode === 'Traffic Manager' && (
                                <>
                                    <div className="program-cell duration-col">Durasi</div>
                                    <div className="program-cell type-col">Jenis</div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="program-body" ref={programBodyRef}>
                        {dataWithRundownCache.map((item, index) => (
                            <ProgramRow
                                key={item.id}
                                item={item}
                                index={index}
                                onUpdateCell={handleUpdateCell}
                                baseRowHeight={baseRowHeight}
                                BASE_HEIGHT_MINUTES={BASE_HEIGHT_MINUTES}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramTable;