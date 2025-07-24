// src/components/ProgramTable.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sortable from 'sortablejs';
import { Link } from 'react-router-dom';
import SettingsIcon from './SettingsIcon.jsx';
import ProgramRow from './ProgramRow.jsx';
import RealTimeIndicator from './RealTimeIndicator.jsx';
import { timeToSeconds, secondsToTime, isValidTimeFormat, durationToMinutes } from '../utils/timeUtils.js';
// Hapus import { parseCSV, convertToCSV } dari sini
import { ROLES_CONFIG, getRoleFeatures, getAllRoleNames } from '../config/rolesConfig.js';

import './ProgramTable.css';

const BASE_HEIGHT_MINUTES = 10;
const DEFAULT_ROW_HEIGHT_PX = 40;

// Terima startTime, programData, setProgramData, showExampleScheduleNote, dan settingsButton dari App.jsx sebagai props
const ProgramTable = ({ startTime, programData, setProgramData, showExampleScheduleNote, settingsButton }) => { // NEW: Terima props baru
    // Hapus state programData dan setShowExampleScheduleNote dari sini
    // const [programData, setProgramData] = useState([]);
    // const [showExampleScheduleNote, setShowExampleScheduleNote] = useState(true);

    const [dataWithRundownCache, setDataWithRundownCache] = useState([]);
    const [baseRowHeight, setBaseRowHeight] = useState(DEFAULT_ROW_HEIGHT_PX);
    const [currentRole, setCurrentRole] = useState('Traffic Manager');

    const currentFeatures = getRoleFeatures(currentRole);

    const programBodyRef = useRef(null);
    const programTableRef = useRef(null);
    const tableWrapperRef = useRef(null);
    const sortableInstanceRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Effect 1: Inisialisasi awal (hitung baseRowHeight)
    // Hapus bagian fetch CSV dari sini karena sudah dipindahkan ke App.jsx
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

    }, []); // Array dependensi kosong: efek hanya berjalan sekali saat mount

    // Memoize fungsi calculateRundown
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

    // Effect 2: Perbarui dataWithRundownCache saat programData (dari props) atau startTime berubah
    useEffect(() => {
        setDataWithRundownCache(calculateRundown(programData));
    }, [programData, startTime, calculateRundown]); // Dependensi: programData (dari props), startTime, calculateRundown

    // Effect 3: Inisialisasi/Hancurkan Sortable.js
    useEffect(() => {
        if (sortableInstanceRef.current) {
            sortableInstanceRef.current.destroy();
            sortableInstanceRef.current = null;
        }

        if (currentFeatures.canDragAndDrop && programBodyRef.current) {
            sortableInstanceRef.current = Sortable.create(programBodyRef.current, {
                animation: 300,
                ghostClass: 'sortable-ghost-custom',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                handle: '.program-row',
                onEnd: function (evt) {
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;

                    setProgramData(prevData => { // setProgramData dari props
                        const newData = [...prevData];
                        const [movedItem] = newData.splice(oldIndex, 1);
                        newData.splice(newIndex, 0, movedItem);
                        return newData;
                    });
                }
            });
        }

        return () => {
            if (sortableInstanceRef.current) {
                sortableInstanceRef.current.destroy();
                sortableInstanceRef.current = null;
            }
        };
    }, [programData, currentFeatures.canDragAndDrop, setProgramData]); // Tambahkan setProgramData sebagai dependensi

    // Hapus handleCsvFileUpload dan handleDownloadCsv dari sini
    // const handleCsvFileUpload = (event) => { ... };
    // const handleDownloadCsv = () => { ... };

    // Hapus handleApplyStartTime dari sini
    // const handleApplyStartTime = () => { ... };

    const handleUpdateCell = useCallback((rowIndex, columnKey, newValue) => {
        if (!currentFeatures.canEditCells) {
            alert('Anda tidak memiliki izin untuk mengedit sel pada peran ini.');
            return;
        }

        setProgramData(prevData => { // setProgramData dari props
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
    }, [currentFeatures.canEditCells, setProgramData]); // Tambahkan setProgramData sebagai dependensi

    const handleRoleChange = (event) => {
        setCurrentRole(event.target.value);
    };

    return (
        <div>
            <h1>Broadcast Scheduler v1.0</h1>
            {showExampleScheduleNote && ( // showExampleScheduleNote dari props
                <p style={{ textAlign: 'center', color: '#495057', fontSize: '1.1em', marginTop: '-15px', marginBottom: '20px', textShadow: '0 0 2px rgba(255,255,255,0.5)' }}>
                    Contoh Jadwal Siaran
                </p>
            )}

            <div className="controls">
                <label htmlFor="roleSelect">Peran:</label>
                <select id="roleSelect" value={currentRole} onChange={handleRoleChange}>
                    {getAllRoleNames().map(roleName => (
                        <option key={roleName} value={roleName}>{roleName}</option>
                    ))}
                </select>

                {/* Hapus input Jam Mulai dan tombol Terapkan Jam Mulai */}
                {/* Hapus input file dan tombol Unduh CSV */}

                <Link
                    to="/settings"
                    style={settingsButton.isHovered ? { ...settingsButton.style, ...settingsButton.hoverStyle } : settingsButton.style}
                    onMouseEnter={() => settingsButton.setIsHovered(true)}
                    onMouseLeave={() => settingsButton.setIsHovered(false)}
                >
                    <SettingsIcon size={14} />
                    Pengaturan
                </Link>
            </div>

            <div id="tableWrapper" ref={tableWrapperRef}>
                <RealTimeIndicator
                    programBodyRef={programBodyRef}
                    programTableRef={programTableRef}
                    tableWrapperRef={tableWrapperRef}
                    dataWithRundownCache={dataWithRundownCache}
                    baseRowHeight={baseRowHeight}
                />
                <div id="programTable" className="program-container" ref={programTableRef}>
                    <div className="program-header">
                        <div className="program-row">
                            {currentFeatures.showColumns.includes('Rundown') && <div className="program-cell rundown-col">Rundown</div>}
                            {currentFeatures.showColumns.includes('Segmen') && <div className="program-cell segment-col">Segmen</div>}
                            {currentFeatures.showColumns.includes('Durasi') && <div className="program-cell duration-col">Durasi</div>}
                            {currentFeatures.showColumns.includes('Jenis') && <div className="program-cell type-col">Jenis</div>}
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
                                currentFeatures={currentFeatures}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramTable;