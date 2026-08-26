import { useEffect } from 'react';

const SUFFIX = 'Vital Suplementos';

/**
 * Name the document per route. Every page shared one static <title>, which made
 * tabs, history entries and bookmarks indistinguishable — a shopper with three
 * products open saw the same words three times.
 */
export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} · Suplementos y skincare importados`;
  }, [title]);
}

export default useTitle;
