import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Carrito from './routes/Carrito.jsx';
import Checkout from './routes/Checkout.jsx';
import Gracias from './routes/Gracias.jsx';
import Home from './routes/Home.jsx';
import Nosotros from './routes/Nosotros.jsx';
import Peptidos from './routes/Peptidos.jsx';
import Producto from './routes/Producto.jsx';
import Tienda from './routes/Tienda.jsx';

export default function App() {
  return (
    <div className="vs-shell">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/producto/:slug" element={<Producto />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/gracias" element={<Gracias />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/peptidos" element={<Peptidos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
