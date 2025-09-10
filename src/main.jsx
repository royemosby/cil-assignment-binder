import { Theme } from '@radix-ui/themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@radix-ui/themes/styles.css';
import './assets/styles/css-reset.css';
import './assets/styles/reasonable-colors.css';
import './index.css';
import App from './App.jsx';

import { BrowserRouter } from 'react-router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Theme accentColor="blue" grayColor="sage" radius="small">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Theme>
  </StrictMode>
);
