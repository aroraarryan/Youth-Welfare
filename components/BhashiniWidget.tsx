'use client';

import { useEffect } from 'react';

const BHASHINI_SCRIPT = 'https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js';

export default function BhashiniWidget() {
  useEffect(() => {
    if (document.querySelector(`script[src="${BHASHINI_SCRIPT}"]`)) return;

    const script = document.createElement('script');
    script.src = BHASHINI_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="bhashini-plugin-root" className="bhashini-plugin-container" />;
}
