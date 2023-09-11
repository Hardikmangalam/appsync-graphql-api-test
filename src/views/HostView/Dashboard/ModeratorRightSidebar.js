import React, { useEffect, useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import arrowIcon from '../../../assets/images/arrow-btn.svg';
import clsoeIcon from '../../../assets/images/close.svg';
import Chat from '../../../common/chat/chat';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import { compose } from 'redux';
import { setHostUI, changeScaleView } from '../../../store/actions/host-ui';
import injectReducer from '../../../utils/injectReducer';
import { ModeratorHostAndPresenter } from '../HostAndPresenters/ModeratorHostAndPresenter';
import classNames from 'classnames';
import { getSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

const ModeratorRightSidebar = ({ changeScaleView, host, setHostUI }) => {
  const usrData = JSON.parse(getSecureSessionData('UserData')) || {};

  const userRole =
    usrData && Object.keys(usrData).length && usrData.userData.role_name;
  const [openNavbar, setSideNavbar] = useState('POD');
  useEffect(() => {
    const screenHeader = document.querySelector('.dashboard');
    if (openNavbar === 'POD') {
      screenHeader.classList.remove('expand-to-right');
      if (!screenHeader.classList.contains('expand-to-left')) {
        screenHeader.style.left = '240px';
      } else {
        screenHeader.style.left = '20px';
      }
      const hostSidebar = document.querySelector('.host-presenter-sidebar');
      if (hostSidebar.classList.contains('chat-expanded')) {
        screenHeader.style.animation = 'dashboard-chat-right-width 1s forwards';
      } else {
        screenHeader.style.animation = 'dashboard-right-width 1s forwards';
      }
    } else {
      screenHeader.classList.add('expand-to-right');
      if (!screenHeader.classList.contains('expand-to-left')) {
        screenHeader.style.left = '240px';
      } else {
        screenHeader.style.left = '20px';
      }
      const hostSidebar = document.querySelector('.host-presenter-sidebar');
      if (hostSidebar.classList.contains('chat-expanded')) {
        screenHeader.style.animation = 'dashboard-chat-right-0 1s forwards';
      } else {
        screenHeader.style.animation = 'dashboard-right-0 1s forwards';
      }
    }
    updateRedux();
  }, [openNavbar]);

  const updateRedux = () => {
    if (openNavbar === host.layout_view) setSideNavbar(host.layout_view);
  };
  const changeSideNav = value => {
    setSideNavbar(value);
    changeScaleView({ layout_view: value });
  };

  return (
    <>
      <div
        className={classNames(
          {
            show: openNavbar === 'POD',
            hide: openNavbar === 'Sharing',
          },
          'is-video-chat host-presenter-sidebar',
        )}
      >
        {/* {host.chat_expand && <Chat isChatExpanded={host.chat_expand} />} */}

        {openNavbar == 'Sharing' && (
          <Button
            variant="outline-secondary"
            aria-label='Sharing'
            onClick={() => {
              changeSideNav('POD');
            }}
            className="p-0 toggle-btn"
          >
            <Image src={arrowIcon} alt="Arrow" />
          </Button>
        )}

        {openNavbar == 'POD' && (
          <Button className="p-0 host-presenter-sidebar__close" aria-label='Close'>
            <Image
              src={clsoeIcon}
              alt="Close"
              onClick={() => {
                changeSideNav('Sharing');
              }}
            />
          </Button>
        )}
        <div className="host-sidebar__heading text-uppercase">
          {getSecureSessionData('role') !== 'OBSERVER' &&
            ' HOST & Presenter Area'}
        </div>
        <div
          className="d-flex flex-column justify-content-between align-items-stretch"
          style={{ height: 'calc(100vh - 125px)' }}
        >
          {getSecureSessionData('role') !== 'MODERATOR' && (
            <ModeratorHostAndPresenter />
          )}
          <Chat userRole={userRole} />
        </div>
      </div>
    </>
  );
};

ModeratorRightSidebar.propTypes = {
  host: PropTypes.object.isRequired,
  changeScaleView: PropTypes.func,
  setHostUI: PropTypes.func,
};

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host: getHostUI(hostUI),
  };
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ModeratorRightSidebar);
