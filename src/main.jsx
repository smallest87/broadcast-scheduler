// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- PASTIKAN BrowserRouter DIIMPOR DI SINI
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- DAN HANYA ADA SATU INSTANCE DI SINI */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);