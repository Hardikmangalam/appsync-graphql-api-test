import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import eabBranding from '../assets/images/evs.jpg';
import seramountBranding from '../assets/images/seramount.jpeg';
import seramountLogo from '../assets/images/seramount_locked_logo.svg';
import logo from '../assets/images/locked-logo.svg';
import EabLogo from '../assets/images/EABbrand.svg';
import seraLogo from '../assets/images/EABseramount.svg';
import favicon from '../assets/images/favicon.ico';
import favicon_eab from '../assets/images/favicon_eab.ico';
import closeIcon from '../assets/images/whiteClose.svg';
import CookieConsent from 'react-cookie-consent';
import clearCookie from 'js-cookie';
import { Button, Image } from 'react-bootstrap';
import classNames from 'classnames';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../graphqlOperations/encryprWrapper';

const CookieBanner = ({
  setIsOpenCookieBanner,
  manageCookie,
  onAcceptCookie,
}) => {
  const [isSeramount, setIsSeramount] = useState(true);

  useEffect(() => {
    const branding = JSON.parse(getSecureSessionData('branding'));
    const header = document.querySelector('.locked-screen-header');

    if (branding === null || branding === true) {
      header.style.backgroundImage = `url(${seramountBranding})`;
      document.body.style.backgroundImage = `url('${seraLogo}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      header.style.backgroundImage = `url(${eabBranding})`;
      document.body.style.backgroundImage = `url('${EabLogo}')`;
      document.body.style.backgroundSize = 'cover';
    }
    header.style.display = 'block';

    setIsSeramount(
      branding === null ? true : JSON.parse(getSecureSessionData('branding')),
    );

    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (branding === null || branding === true) {
      link.href = favicon;
      document.title = 'Seramount';
    } else {
      link.href = favicon_eab;
      document.title = 'EAB';
    }
  }, [JSON.parse(getSecureSessionData('branding'))]);
  return (
    <CookieConsent
      enableDeclineButton
      buttonText="Accept All Cookies"
      declineButtonText="Reject All"
      onDecline={() => {
        setSecureSessionData('CookieConsent', false);
        manageCookie({ isEnable: false });
        setIsOpenCookieBanner(false);
        setTimeout(() => {
          var Cookies = document.cookie.split(';');
          // set past expiry to all cookies
          for (var i = 0; i < Cookies.length; i++) {
            document.cookie =
              Cookies[i] + '=; expires=' + new Date(0).toUTCString();
            clearCookie.remove('CookieConsent');
          }
          window.location.reload();
        }, 1000);
      }}
      onAccept={() => {
        setSecureSessionData('CookieConsent', 'true');
        sessionStorage.removeItem('cookieRejected');
        manageCookie({ isEnable: true });
        onAcceptCookie();
      }}
      style={{
        alignItem: 'baseline',
        background: '#ffffff',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'fixed',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '650px',
        minWidth: '500px',
        top: '50%',
        borderRadius: '10px',
        minHeight: '425px',
      }}
      buttonClasses="btn btn-primary"
      declineButtonClasses="btn btn-primary"
      overlay
      buttonStyle={{
        background: '#0072ce',
        color: 'white',
        borderRadius: '5px',
        height: '36px',
        marginTop: '5px',
        margin: '20px',
      }}
      declineButtonStyle={{
        background: '#0072ce',
        color: 'white',
        borderRadius: '5px',
        height: '36px',
        marginTop: '5px',
        padding: '5px 27px',
        margin: '20px',
      }}
    >
      <span>
        <header
          className={classNames(
            { 'is-seramount': isSeramount },
            'locked-screen-header',
          )}
          style={{
            backgroundImage: `url(${
              isSeramount ? seramountBranding : eabBranding
            })`,
            borderRadius: '10px 10px 0px 0px',
          }}
        >
          <Image
            src={isSeramount ? seramountLogo : logo}
            alt="Logo"
            width={isSeramount ? 192 : 108}
            className="mb-2"
          />
          <Button
            onClick={() => setIsOpenCookieBanner(false)}
            className="cookie_close_button p-0 border-0"
            aria-label="Close"
          >
            <Image src={closeIcon} alt="Close" />
          </Button>
        </header>
        <div className="banner_text">
          <p>
            <strong>
              It appears you are trying to register, but you have not accepted
              our cookie policy.
            </strong>
          </p>
          <p>
            {isSeramount ? 'SERAMOUNT' : 'EAB'} asks you to accept cookies for
            authorization purposes, as well as to track usage data and for
            marketing purposes. To get more information about these cookies and
            the processing of your personal information, please see our{' '}
            <a
              style={{ color: '#0072ce' }}
              rel="noreferrer"
              target="_blank"
              href="https://seramount.com/privacy-policy/"
            >
              Privacy Policy.
            </a>{' '}
            Do you accept these cookies and the processing of your personal
            information involved?
          </p>
        </div>
      </span>
    </CookieConsent>
  );
};

CookieBanner.propTypes = {
  onAcceptCookie: PropTypes.func,
  manageCookie: PropTypes.func,
  setIsOpenCookieBanner: PropTypes.func,
};

export default CookieBanner;
