import React, { useEffect, useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import arrowIcon from '../../../assets/images/arrow-btn.svg';
import clsoeIcon from '../../../assets/images/close.svg';
import Chat from '../../../common/chat/chat';
import HostAndPresenter from '../HostAndPresenters/HostAndPresenter';
// import { changeScaleView } from '../../../redux/modules/host';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import { compose } from 'redux';
import { setHostUI, changeScaleView } from '../../../store/actions/host-ui';
import injectReducer from '../../../utils/injectReducer';

export const RightSidebar = ({
  changeScaleView,
  host,
  setHostUI,
  userRole,
}) => {
  const [openNavbar, setSideNavbar] = useState('POD');
  useEffect(() => {
    const broadcastCard = document.querySelector('.broadcast-card');
    const screenHeader = document.querySelector('.dashboard');

    if (openNavbar == 'POD') {
      broadcastCard.classList.remove('expand');
      broadcastCard.classList.add('collapse');
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
      broadcastCard.classList.add('expand');
      broadcastCard.classList.remove('collapse');
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
  }, [openNavbar, host.layout_view]);

  const updateRedux = () => {
    setSideNavbar(host.layout_view);
  };
  const changeSideNav = value => {
    setSideNavbar(value);
    changeScaleView({ layout_view: value });
  };

  // useEffect(() => {
  //   if (openNavbar) {
  //     return;
  //   }
  //   const chatDiv = document.querySelector('.chat');
  //   console.log(props.chat_expand, chatDiv.classList.contains('expanded'));
  //   if (props.chat_expand && chatDiv.classList.contains('expanded')) {
  //     chatDiv.style.animation = 'chat-0-100 1s forwards';
  //   } else {
  //     chatDiv.style.animation = 'chat-100-0 1s forwards';
  //   }
  // }, [openNavbar, props.chat_expand]);
  // useEffect(() => {
  //   const chatDiv = document.querySelector('.chat');
  //   if (props.chat_expand && chatDiv.classList.contains('expanded')) {
  //     chatDiv.style.animation = 'chat-0-100 1s forwards';
  //   } else {
  //     chatDiv.style.animation = 'chat-100-0 1s forwards';
  //   }
  // }, [props.chat_expand]);

  // const setSideNavbar = val => {
  //   setHostUI({
  //     ...props.host_ui,
  //     layout_view: val,
  //   });
  // };

  return (
    <>
      <div
        className={classNames(
          {
            show: openNavbar == 'POD',
            hide: openNavbar == 'Sharing',
            'is-video-chat': host.scale_view,
            'chat-expanded': host.chat_expand,
          },
          'host-presenter-sidebar',
        )}
      >
        {host.chat_expand && (
          <Chat isChatExpanded={host.chat_expand} userRole={userRole} />
        )}

        {openNavbar == 'Sharing' && (
          <Button
            variant="outline-secondary"
            aria-label='Sharing'
            onClick={() => changeSideNav('POD')}
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
              onClick={() => changeSideNav('Sharing')}
            />
          </Button>
        )}
        <div className="host-sidebar__heading text-uppercase">
          HOST & Presenter Area
        </div>
        <div
          className="d-flex flex-column justify-content-between align-items-stretch"
          style={{ height: 'calc(100vh - 125px)' }}
        >
          <HostAndPresenter />
          <Chat userRole={userRole} />
        </div>
      </div>
    </>
  );
};

RightSidebar.propTypes = {
  host: PropTypes.object.isRequired,
  changeScaleView: PropTypes.func,
  setHostUI: PropTypes.func,
  userRole: PropTypes.string,
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
)(RightSidebar);
