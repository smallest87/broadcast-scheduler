import React from 'react';

const RealTimeIndicator = ({ top, left, width, timeLabel }) => {
    // Gaya langsung di-inline untuk kemudahan, atau bisa dipindahkan ke CSS module
    const indicatorStyle = {
        opacity: '60%',
        position: 'absolute', // Penting agar bisa diposisikan di dalam #tableWrapper
        backgroundColor: '#ff3333',
        height: '2px',
        boxShadow: '0 0 10px rgba(255, 51, 51, 0.7), 0 0 5px rgba(255, 51, 51, 0.5)',
        zIndex: 50,
        borderRadius: '1px',
        pointerEvents: 'none',
        transition: 'top 0.5s linear',
        top: `${top}px`, // Nilai ini datang dari state parent
        left: `${left}px`, // Nilai ini datang dari state parent
        width: `${width}px`, // Nilai ini datang dari state parent
        display: top === null || isNaN(top) ? 'none' : 'block' // Sembunyikan jika top belum valid
    };

    const labelStyle = {
        position: 'absolute',
        backgroundColor: '#ff3333',
        color: 'white',
        padding: '4px 8px',
        fontSize: '13px',
        borderRadius: '5px',
        whiteSpace: 'nowrap',
        transform: 'translateY(-50%)',
        right: '0',
        marginRight: '-75px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 51,
    };

    return (
        <div id="realTimeIndicator" style={indicatorStyle}>
            <span id="realTimeLabel" style={labelStyle}>{timeLabel}</span>
        </div>
    );
};

export default RealTimeIndicator;