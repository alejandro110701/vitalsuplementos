import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './lib/cart.jsx';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter, not BrowserRouter: WordPress.com Atomic hands any path that
        is not a real file to WordPress, which answers /tienda/producto/creatina
        with its own 404 (and redirects /tienda/producto/serum-anua to the
        WooCommerce permalink). Atomic ignores the .htaccess rewrite that would
        normally fix this. Routing through the fragment keeps every request on
        /tienda/index.html, which does exist, so deep links and refreshes work
        with no server configuration at all. */}
    <HashRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </HashRouter>
  </React.StrictMode>
);
