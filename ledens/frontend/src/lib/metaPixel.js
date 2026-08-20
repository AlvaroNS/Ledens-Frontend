// Meta (Facebook) Pixel — loaded only after the user grants "marketing"
// consent via CookieConsent.jsx, so it never fires before opt-in.
const PIXEL_ID = '1441327277814616';
const CONSENT_KEY = 'ledens.cookieConsent.v1';

function injectPixel() {
  if (window.fbq) return;

  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

function hasMarketingConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? !!JSON.parse(raw).marketing : false;
  } catch {
    return false;
  }
}

export function initMetaPixel() {
  if (hasMarketingConsent()) injectPixel();

  document.addEventListener('ledens:cookieconsent', (e) => {
    if (e.detail?.marketing) injectPixel();
  });
}
