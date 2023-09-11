/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Image } from 'react-bootstrap';
import Chat from '../../../common/chat/chat';
import arrowIcon from '../../../assets/images/arrow-btn.svg';

// import { changeScaleView } from '../../../redux/modules/host';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import { compose } from 'redux';
import { setHostUI, changeScaleView } from '../../../store/actions/host-ui';
import injectReducer from '../../../utils/injectReducer';
import { getSecureSessionData } from '../../../graphqlOperations/encryprWrapper';

const ParticipantRightSidebar = ({
  changeScaleView,
  host,
  setHostUI,
  userRole,
}) => {
  const [openNavbar, setSideNavbar] = useState('POD');
  const [openChat, setOpenChat] = useState(true);

  useEffect(() => {
    // // const broadcastCard = document.querySelector('.broadcast-card');
    // const screenHeader = document.querySelector('.dashboard');
    // if (openNavbar == 'POD' ) {
    //   // broadcastCard.classList.remove('expand');
    //   // broadcastCard.classList.add('collapse');
    //   screenHeader.classList.remove('expand-to-right');
    //   if (!screenHeader.classList.contains('expand-to-left')) {
    //     screenHeader.style.left = '240px';
    //   } else {
    //     screenHeader.style.left = '20px';
    //   }
    //   const hostSidebar = document.querySelector('.host-presenter-sidebar');
    //   if (hostSidebar.classList.contains('chat-expanded')) {
    //     screenHeader.style.animation = 'dashboard-chat-right-width 1s forwards';
    //   } else {
    //     screenHeader.style.animation = 'dashboard-right-width 1s forwards';
    //   }
    // } else {
    //   // broadcastCard.classList.add('expand');
    //   // broadcastCard.classList.remove('collapse');
    //   screenHeader.classList.add('expand-to-right');
    //   if (!screenHeader.classList.contains('expand-to-left')) {
    //     screenHeader.style.left = '240px';
    //   } else {
    //     screenHeader.style.left = '20px';
    //   }
    //   const hostSidebar = document.querySelector('.host-presenter-sidebar');
    //   if (hostSidebar.classList.contains('chat-expanded')) {
    //     screenHeader.style.animation = 'dashboard-chat-right-0 1s forwards';
    //   } else {
    //     screenHeader.style.animation = 'dashboard-right-0 1s forwards';
    //   }
    // }
    // updateRedux();
  }, [openNavbar]);

  // const updateRedux = () => {
  //   setSideNavbar(host.layout_view);
  // };
  // const changeSideNav = value => {
  //   setSideNavbar(value);
  //   changeScaleView({ layout_view: value });
  // };

  return (
    <>
      <div
        className={classNames(
          { show: openChat, hide: openChat == false },
          'is-video-chat chat-expanded host-presenter-sidebar',
          userRole === 'MODERATOR' &&
            [true, 'true'].includes(getSecureSessionData('isLockedScreen'))
            ? 'moderator_chat'
            : 'participant_chat',
        )}
      >
        <Button
          variant="outline-secondary "
          aria-label='openChat'
          onClick={() => setOpenChat(!openChat)}
          className="p-0 toggle-btn"
        >
          <Image src={arrowIcon} alt="Arrow" />
        </Button>
        {/* {host.chat_expand && <Chat isChatExpanded={host.chat_expand} />} */}

        {/* {openNavbar == 'Sharing' && (
          <Button
            variant="outline-secondary"
            onClick={() => changeSideNav('POD')}
            className="p-0 toggle-btn"
          >
            <Image src={arrowIcon} />
          </Button>
        )}

        {openNavbar == 'POD' && (
          <Button className="p-0 host-presenter-sidebar__close">
            <Image
              src={clsoeIcon}
              alt="Close"
              onClick={() => changeSideNav('Sharing')}
            />
          </Button>
        )}
        <div className="host-sidebar__heading text-uppercase">
          HOST & Presenter Area
        </div> */}
        <div
          className="d-flex flex-column justify-content-between align-items-stretch"
          style={{ height: 'calc(100vh - 125px)' }}
        >
          {/* <HostAndPresenter /> */}
          <Chat userRole={userRole} />
        </div>
      </div>
    </>
  );
};

ParticipantRightSidebar.propTypes = {
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
)(ParticipantRightSidebar);
