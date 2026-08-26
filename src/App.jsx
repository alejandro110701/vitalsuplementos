import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Carrito from './routes/Carrito.jsx';
import Checkout from './routes/Checkout.jsx';
import Home from './routes/Home.jsx';
import Nosotros from './routes/Nosotros.jsx';
import Peptidos from './routes/Peptidos.jsx';
import Producto from './routes/Producto.jsx';
import Tienda from './routes/Tienda.jsx';

export default function App() {
  return (
    <div className="vs-shell">
      <ScrollToTop />
      {/* First tab stop on every page: six header links stood between a keyboard
          or screen-reader user and the actual content. */}
      <a className="vs-skip" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/producto/:slug" element={<Producto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/peptidos" element={<Peptidos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </main>
      <Footer />
    </div>
  );
}
