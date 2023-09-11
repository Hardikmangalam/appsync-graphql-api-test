import React, { useState, useEffect } from 'react';
import { Button, Image } from 'react-bootstrap';
import classNames from 'classnames';
import sharingIcon from '../../../assets/images/sharing-illustration.svg';
import activeSharingIcon from '../../../assets/images/sharing-illustration-blue.svg';
import PODIcon from '../../../assets/images/POD-illustration.svg';
import activePODIcon from '../../../assets/images/POD-illustration-blue.svg';
import tickIcon from '../../../assets/images/tick.svg';
// import { changeScaleView } from '../../../store/reducers/host-ui';
import { connect } from 'react-redux';
import { compose } from 'redux';
import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';
import { setHostUI, changeScaleView } from '../../../store/actions/host-ui';
import PropTypes from 'prop-types';

const LAYOUTS = [
  {
    type: 'Sharing',
    icon: sharingIcon,
    icon2: activeSharingIcon,
  },
  {
    type: 'POD',
    icon: PODIcon,
    icon2: activePODIcon,
  },
];
const Layouts = ({ changeScaleView, host_ui }) => {
  const [layoutType, setLayoutType] = useState('POD');

  useEffect(() => {
    changeScaleView({ layout_view: layoutType });
  }, [layoutType]);

  useEffect(() => {
    if (host_ui.layout_view !== layoutType) {
      setLayoutType(host_ui.layout_view);
    }
  }, [host_ui.layout_view]);

  return (
    <>
      <div className="host-sidebar__heading">Layouts</div>
      <div className="host-sidebar-pad layouts-btn ticks-btn">
        {LAYOUTS.map((layout, i) => (
          <div className="layout__card" key={i}>
            <Button
              onClick={() => setLayoutType(layout.type)}
              onFocus={() => setLayoutType(layout.type)}
              className={classNames(
                { active: layout.type == layoutType },
                'm-0',
              )}
              aria-label="Sharing"
            >
              <Image
                className="w-100 layout__illustration"
                src={layoutType == layout.type ? layout.icon2 : layout.icon}
                alt="Sharing"
              />

              {layout.type == layoutType && (
                <Image src={tickIcon} alt="tick" className="tick-icon" />
              )}
            </Button>
            <div className="layout__text">{layout.type}</div>
          </div>
        ))}
      </div>
    </>
  );
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    dispatch,
  };
}

Layouts.propTypes = {
  changeScaleView: PropTypes.func,
  host_ui: PropTypes.object,
};

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Layouts);
