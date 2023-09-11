/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import classNames from 'classnames';
import arrowIcon from '../../../assets/images/arrow-btn.svg';
import Moderator from './Moderator';
import Layouts from './Layouts';
import Templates from './Templates';
import { getSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

export const Sidebar = () => {
  const usrData = JSON.parse(getSecureSessionData('UserData')) || {};
  const role_name =
    usrData && Object.keys(usrData).length && usrData.userData.role_name;
  const [openNavbar, setOpenNavbar] = useState(true);
  const [isTemplateLoad, setIsTemplateLoad] = useState(false);
  const [userRole, setUserRole] = useState(role_name || 'OBSERVER');
  useEffect(() => {
    const screenHeader = document.querySelector('.dashboard');
    const hostSidebar = document.querySelector('.host-presenter-sidebar');
    const isChatExpanded =
      hostSidebar && hostSidebar.classList.contains('chat-expanded');

    // if (getSecureSessionData('templateView') === 'true') {
    //   screenHeader.style.right = '0px !important';

    if (openNavbar) {
      screenHeader.classList.remove('expand-to-left');
      if (!screenHeader.classList.contains('expand-to-right')) {
        screenHeader.style.right = isChatExpanded ? '580px' : '290px';
      } else {
        screenHeader.style.right = isChatExpanded ? '310px' : '20px';
      }
      screenHeader.style.animation = 'dashboard-left-width 1s forwards';
    } else {
      screenHeader.classList.add('expand-to-left');
      if (!screenHeader.classList.contains('expand-to-right')) {
        screenHeader.style.right = isChatExpanded ? '580px' : '290px';
      } else {
        screenHeader.style.right = isChatExpanded ? '310px' : '20px';
      }
      screenHeader.style.animation = 'dashboard-left-0 1s forwards';
    }
  }, [openNavbar, isTemplateLoad]);

  useEffect(() => {
    if (userRole !== 'HOST' && userRole !== 'ADMIN') {
      setOpenNavbar(false);
    }
  }, []);

  useEffect(() => {
    if (
      (openNavbar && getSecureSessionData('templateView') === 'false') ||
      getSecureSessionData('templateView') === null
    ) {
      setOpenNavbar(openNavbar);
      setTimeout(() => {
        const dashEle = document.querySelector('.dashboard-wrapper');
        let dashEleWidth = '100%';
        if (dashEle !== null) {
          const dashwidth = dashEle.clientWidth;
          dashEleWidth = dashwidth;
          const main_width = document.querySelector('.main-box');
          if (main_width !== null) {
            main_width.class = 'expand-to-right';
            main_width.style.width = dashEleWidth + 'px';
          }
        }
      }, 800);
    }
  }, [openNavbar]);

  return (
    <>
      {(userRole === 'HOST' || userRole === 'ADMIN') && (
        <div
          id="tempViewCard"
          className={classNames(
            {
              show: openNavbar,
              hide: openNavbar == false,
            },
            getSecureSessionData('templateView') === 'false' ||
              getSecureSessionData('templateView') === null
              ? `host-sidebar ${isTemplateLoad && 'host-sidebar_temp'}`
              : 'host-sidebar host-sidebar_temp',
          )}
        >
          <Button
            variant="outline-secondary"
            onClick={() => setOpenNavbar(!openNavbar)}
            className="p-0 toggle-btn"
            aria-label={openNavbar ? 'Close Navigation' : 'Open Navigation'}
          >
            <Image src={arrowIcon} alt={openNavbar ? 'Close' : 'Open'} />
          </Button>

          <Moderator />
          <Layouts />
          <Templates setIsTempLoad={setIsTemplateLoad} />
        </div>
      )}
    </>
  );
};

export default Sidebar;
