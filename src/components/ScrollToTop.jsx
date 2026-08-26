import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** The design scrolled to the top on every `go()`. Same behaviour, per navigation. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
