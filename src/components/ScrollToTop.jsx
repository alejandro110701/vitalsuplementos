import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Start a new page at the top — but only when the shopper actually asked for a
 * new page. On Back and Forward the browser restores the old offset, and
 * forcing 0 there threw away the shopper's place in the catalogue every time
 * they returned from a product.
 *
 * Keyed on search as well as pathname: switching worlds from the header only
 * changes ?mundo=, and leaving the reader halfway down a different catalogue is
 * the same disorientation.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo(0, 0);
  }, [pathname, search, navigationType]);

  return null;
}
