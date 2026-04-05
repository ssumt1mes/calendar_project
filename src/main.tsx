import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';
import { appConfig } from './config';
import { isIOSNativeApp, isNativeApp } from './platform';
import { CalendarStorageProvider } from './hooks/useCalendarStorage';

const rootElement = document.documentElement;
const bodyElement = document.body;

bodyElement.classList.toggle('native-shell', isNativeApp());
bodyElement.classList.toggle('native-ios', isIOSNativeApp());
rootElement.classList.toggle('native-shell', isNativeApp());
rootElement.classList.toggle('native-ios', isIOSNativeApp());

const syncViewportHeight = () => {
  rootElement.style.setProperty('--app-height', `${window.innerHeight}px`);
};

syncViewportHeight();
window.addEventListener('resize', syncViewportHeight);
window.visualViewport?.addEventListener('resize', syncViewportHeight);

const root = (
  <React.StrictMode>
    <CalendarStorageProvider>
      <App />
    </CalendarStorageProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  appConfig.googleEnabled && appConfig.googleClientId ? (
    <GoogleOAuthProvider clientId={appConfig.googleClientId}>{root}</GoogleOAuthProvider>
  ) : (
    root
  ),
);
