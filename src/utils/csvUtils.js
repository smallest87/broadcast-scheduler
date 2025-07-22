export function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    const parseLine = (line) => {
        const values = [];
        let inQuote = false;
        let currentField = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i - 1] === ',' || inQuote)) {
                if (inQuote && line[i + 1] === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuote = !inQuote;
                }
            } else if (char === ',' && !inQuote) {
                values.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField.trim());
        return values;
    };

    // Skip header row for actual data parsing
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseLine(lines[i]);
        // Adjust column mapping based on your CSV structure (Durasi, Segmen, Jenis)
        // Assuming the order is fixed in your CSV: 0:Rundown(ignored), 1:Durasi, 2:Segmen, 3:Jenis
        if (values.length >= 4) { // Ensure enough columns
            data.push({
                Durasi: values[1],
                Segmen: values[2],
                Jenis: values[3] || '',
            });
        } else if (values.length >= 3) { // Case for CSV without 'Jenis'
             data.push({
                Durasi: values[1],
                Segmen: values[2],
                Jenis: '',
            });
        } else {
            console.warn('CSV row format mismatch (column count issue):', lines[i]);
        }
    }
    return data;
}

export function convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = ['Durasi', 'Segmen', 'Jenis']; // Hanya kolom ini untuk output CSV
    let csv = headers.map(header => {
        if (header.includes(',') || header.includes('"') || header.includes('\n')) {
            return `"${header.replace(/"/g, '""')}"`;
        }
        return header;
    }).join(',') + '\n';

    data.forEach(row => {
        const values = headers.map(header => {
            const value = String(row[header] || '');
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                const escapedValue = value.replace(/"/g, '""');
                return `"${escapedValue}"`;
            }
            return value;
        });
        csv += values.join(',') + '\n';
    });
    return csv;
}