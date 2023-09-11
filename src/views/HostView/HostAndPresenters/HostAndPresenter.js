import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import Attendees from './Attendees';
import Waitlist from './Waitlist';
import ShareVideo from './ShareVideo';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import { setHostUI, changeScaleView } from '../../../store/actions/host-ui';

export const HostAndPresenter = props => {
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [totalWaitlist, setTotalWaitlist] = useState(0);
  const [key, setKey] = useState(0);

  const MENU_LIST = [
    {
      title: `Attendees (${totalAttendees})`,
      component: <Attendees />,
    },
    {
      title: `Waitlist (${totalWaitlist})`,
      component: <Waitlist />,
    },
  ];

  useEffect(() => {
    if (props.attendeesData && Array.isArray(props.attendeesData)) {
      setTotalAttendees(props.attendeesData.length);
    }
    if (props.updateUserData && Array.isArray(props.updateUserData)) {
      setTotalWaitlist(props.updateUserData.length);
    }
  }, [props.attendeesData, props.updateUserData]);

  return (
    <>
      <div className="host-presenter-area">
        {props.host_ui.scale_view && <ShareVideo />}

        <Tabs
          defaultActiveKey={key}
          activeKey={key}
          onSelect={k => setKey(k)}
          className="lined-tabs host-presenter-sidebar-tabs"
        >
          {MENU_LIST.map((menu, i) => (
            <Tab eventKey={i} title={menu.title} key={menu.title}>
              {menu.component}
            </Tab>
          ))}
        </Tabs>
      </div>
    </>
  );
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
    updateUserData: hostUI.updateUserData,
    attendeesData: hostUI.attendeesData,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    dispatch,
  };
}

HostAndPresenter.propTypes = {
  host_ui: PropTypes.object,
  updateUserData: PropTypes.array,
  attendeesData: PropTypes.array,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(HostAndPresenter);
