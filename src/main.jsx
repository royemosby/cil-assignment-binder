import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/reasonable-colors.css';
import './index.css';
import './reset.css';
import './assets/styles/css-reset.css';
import App from './App.jsx';

import { BrowserRouter } from 'react-router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
