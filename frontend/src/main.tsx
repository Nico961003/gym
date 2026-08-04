import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');

if (!container) {
  throw new Error('No se encontró el elemento #root en index.html');
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Para medir el rendimiento pasa una función, por ejemplo:
// reportWebVitals(console.log)
// Más info: https://github.com/GoogleChrome/web-vitals
reportWebVitals();
