export function timeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(Number);
    return (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);
}

export function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function isValidTimeFormat(timeStr) {
    const timeRegex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9]):(?:[0-5]?[0-9])$/;
    return timeRegex.test(timeStr);
}

export function durationToMinutes(durationStr) {
    if (!isValidTimeFormat(durationStr)) {
        return 0;
    }
    const parts = durationStr.split(':').map(Number);
    return parts[0] * 60 + parts[1] + (parts[2] / 60);
}