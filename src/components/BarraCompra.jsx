import { Button } from '../ds/index.js';
import { money } from '../lib/format.js';

/**
 * The persistent buy bar. Docks the moment Act I's add-to-cart leaves the
 * viewport and stays for the rest of the page, so a shopper deep in the gallery
 * never has to scroll back to buy.
 *
 * Holds no state of its own: `pack` and `qty` live in Producto, so what the
 * shopper configured up top is exactly what this adds. Rendered last in the DOM
 * so keyboard users reach the in-page control first.
 */
export default function BarraCompra({ product, image, unit, pack, qty, onInc, onDec, onAdd, added, show }) {
  return (
    <div className="vp-barra" data-on={show ? 'true' : 'false'} aria-hidden={show ? undefined : 'true'}>
      <div className="vp-barra__thumb">
        <img src={image} alt="" />
      </div>
      <span className="vp-barra__name">{product.n}</span>

      <div className="vp-barra__qty">
        <button
          type="button"
          className="vs-stepper-btn"
          style={{ width: 34 }}
          onClick={onDec}
          disabled={qty <= 1}
          tabIndex={show ? 0 : -1}
          aria-label="Quitar uno"
        >
          −
        </button>
        <span>{qty}</span>
        <button
          type="button"
          className="vs-stepper-btn"
          style={{ width: 34 }}
          onClick={onInc}
          disabled={qty >= 9}
          tabIndex={show ? 0 : -1}
          aria-label="Agregar uno"
        >
          +
        </button>
      </div>

      <Button variant="default" size="lg" onClick={onAdd} tabIndex={show ? 0 : -1}>
        {added ? 'Agregado' : `Agregar · ${money(unit * pack * qty)}`}
      </Button>

      <span className="vp-sr-only" aria-live="polite">
        {added ? `Agregado: ${product.n}` : ''}
      </span>
    </div>
  );
}
