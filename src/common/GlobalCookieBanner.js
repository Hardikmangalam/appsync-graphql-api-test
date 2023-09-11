import { useEffect } from 'react';

const GlobalCookieBanner = () => {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.src =
      'https://cdn.cookielaw.org/consent/1bc859cd-01cc-4642-a80c-52cc6c5abbf4/OtAutoBlock.js';
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';
    script2.type = 'text/javascript';
    script2.setAttribute(
      'data-domain-script',
      '1bc859cd-01cc-4642-a80c-52cc6c5abbf4',
    );
    script2.setAttribute('charset', 'UTF-8');
    document.body.appendChild(script2);

    const script3 = document.createElement('script');
    script3.type = 'text/javascript';
    script3.innerHTML = 'function OptanonWrapper() { }';
    document.body.appendChild(script3);

    const consentCookie = document.cookie
      .split(';')
      .find(cookie => cookie.includes('cookieConsent='));
    if (!consentCookie) {
      setTimeout(() => {
        if (window.Optanon) {
          window.Optanon.ToggleInfoDisplay(true);

          const acceptAllButton = document.querySelector(
            '#accept-recommended-btn-handler',
          );
          if (acceptAllButton) {
            acceptAllButton.addEventListener('click', () => {
              document.cookie = 'cookieConsent=true; path=/';
            });
          }
        }
      }, 5000);
    }

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
      document.body.removeChild(script3);
    };
  }, []);

  return null;
};

export default GlobalCookieBanner;
