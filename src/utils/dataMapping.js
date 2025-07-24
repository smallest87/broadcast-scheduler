// src/utils/dataMappers.js

/**
 * Memetakan data program dari format API ke format yang digunakan di aplikasi.
 * @param {Array<Object>} apiDataArray - Array data program dari API.
 * @returns {Array<Object>} Data program dalam format yang diharapkan aplikasi.
 */
export const mapApiProgramData = (apiDataArray) => {
  if (!Array.isArray(apiDataArray)) {
    console.error("Input ke mapApiProgramData bukan array:", apiDataArray);
    return [];
  }

  // Mengurutkan data berdasarkan 'id' secara ascending (terkecil ke terbesar)
  const sortedData = apiDataArray.sort((a, b) => a.id - b.id);

  return sortedData.map(item => ({
    id: item.id,
    Durasi: item.durasi,
    Segmen: item.jadwal_namaacara, // Sesuaikan jika nama properti API berubah
    Jenis: item.jenis
  }));
};