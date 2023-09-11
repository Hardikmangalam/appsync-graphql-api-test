/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
import React from 'react';
import classNames from 'classnames';
import { Image } from 'react-bootstrap';
import logo from '../../assets/images/locked-logo1.svg';
import seramountLogo from '../../assets/images/seramount_locked_logo.svg';
import eabBranding from '../../assets/images/evs.jpg';
import seramountBranding from '../../assets/images/seramount.jpeg';
import EABfavicon from '../../assets/images/favicon_eab.ico';
import SeramountFavicon from '../../assets/images/favicon.ico';

const LockedHeader = registrationFormPages => {
  const IsSeramount = registrationFormPages.registrationFormPages.is_seramount;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  if (
    IsSeramount === null ||
    IsSeramount === undefined ||
    IsSeramount === true
  ) {
    link.href = SeramountFavicon;
    document.title = 'Seramount';
  } else {
    link.href = EABfavicon;
    document.title = 'EAB';
  }

  return (
    <header
      className={classNames(
        { 'is-seramount': IsSeramount },
        'locked-screen-header',
      )}
      style={{
        backgroundImage: `url(${
          // IsSeramount ? seramountBranding : eabBranding
          IsSeramount === undefined
            ? seramountBranding
            : IsSeramount
            ? seramountBranding
            : eabBranding
        })`,
      }}
    >
      <Image
        // src={IsSeramount ? seramountLogo : logo}
        src={
          IsSeramount === undefined
            ? seramountLogo
            : IsSeramount
            ? seramountLogo
            : logo
        }
        alt="Logo"
        width={IsSeramount === undefined ? 192 : IsSeramount ? 192 : 108}
        className="mb-2"
      />
      {IsSeramount === false ? (
        <div className="text-white mt-1">We Empower Inclusive Workplaces</div>
      ) : (
        ''
      )}
    </header>
  );
};
export default LockedHeader;
