import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import Attendees from './Attendees';
import Waitlist from './Waitlist';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import { setHostUI, changeScaleView } from '../../../store/actions/host-ui';


const MENU_LIST = [
  {
    title: 'Attendees (100)',
    component: <Attendees />,
  },
  {
    title: 'Waitlist (5)',
    component: <Waitlist />,
  },
];

export const ModeratorHostAndPresenter = props => (
  <>
    <div className="host-presenter-area">
      <Tabs
        defaultActiveKey={MENU_LIST[0].title}
        className="lined-tabs host-presenter-sidebar-tabs"
      >
        {MENU_LIST.map(menu => (
          <Tab eventKey={menu.title} title={menu.title} key={menu.title}>
            {menu.component}
          </Tab>
        ))}
      </Tabs>
    </div>
  </>
);

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = (state) => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: (payload) => dispatch(setHostUI(payload)),
    changeScaleView: (payload) => dispatch(changeScaleView(payload)),
    dispatch,
  };
}

ModeratorHostAndPresenter.propTypes = {
  host_ui: PropTypes.object,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ModeratorHostAndPresenter);