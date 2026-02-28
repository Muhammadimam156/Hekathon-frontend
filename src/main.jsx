import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { store } from './store/store';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1e293b', color: '#f8fafc', borderRadius: '10px', fontSize: '14px' },
            success: { iconTheme: { primary: '#34d399', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#fff' } }
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
