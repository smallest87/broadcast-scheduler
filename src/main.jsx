// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter di sini
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Tambahkan prop basename dengan path sub-direktori */}
    <BrowserRouter basename="/siaran"> {/* <-- PERBAIKAN DI SINI */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);