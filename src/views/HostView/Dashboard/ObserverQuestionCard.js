/* eslint-disable no-unused-vars */
/* eslint-disable indent */
import React, { useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import seramount_Logo from '../../../assets/images/seramountLogo.svg';
import eabLogo from '../../../assets/images/EABLogoColor-primaryLogo.png';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
//store
import { connect } from 'react-redux';
import { compose } from 'redux';

import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';

import { setHostUI, changeScaleView } from '../../../store/actions/host-ui';
import { questionGQL } from '../../../graphqlOperations';
import { appReceiveError } from '../../../store/actions/error';
import classNames from 'classnames';
import { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Example from './dnd-flow-observer/Example';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';
const ResponsiveGridLayout = WidthProvider(Responsive);

const isSeramount = JSON.parse(getSecureSessionData('branding'));
const meetingName = JSON.parse(getSecureSessionData('UserData'));
let currentMeetingId = null;
if (meetingName !== null && Object.keys(meetingName).length) {
  const {
    meetingData: { id },
  } = meetingName;
  currentMeetingId = Number(id);
}

var testLayout = {
  lg: [],
};

const ObserverQuestionCard = ({ host_ui, questions, appReceiveError }) => {
  const [list, setList] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [update, setUpdate] = useState(true);
  const [newLayout, setNewLayout] = useState(testLayout);
  const [layoutKey, setLayoutKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(
    Number(getSecureSessionData('zoomLevel')) || 1,
  );

  useEffect(() => {
    setSecureSessionData('zoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    if (host_ui && Object.keys(host_ui.selected_screen).length) {
      setSelectedScreen(host_ui.selected_screen.id);
    } else {
      let meetData = getSecureSessionData('meetData');
      meetData = meetData ? JSON.parse(meetData) : null;

      if (
        meetData &&
        meetData.meetingData &&
        meetData.meetingData.selectedscreen
      ) {
        setSelectedScreen(meetData.meetingData.selectedscreen);
        setLayoutKey(layoutKey + 1);
      }
    }
  }, [host_ui.selected_screen]);

  useEffect(() => {
    if (host_ui && Object.keys(host_ui.selected_screen).length) {
      setList([]);
      setNewLayout({ lg: [] });
    }
  }, [host_ui.selected_screen.id]);

  useEffect(() => {
    if (host_ui && host_ui.screen_layout && host_ui.screen_layout.length > 0) {
      setNewLayout({ lg: host_ui.screen_layout });
      setLayoutKey(layoutKey + 1);
    }
  }, [host_ui.screen_layout]);

  useEffect(() => {
    if (questions && questions.length >= 0) {
      setList(questions);
    }
  }, [questions]);

  const getYvalue = i => {
    if (i < 4) {
      return 0;
    }
    const divideVal = i / 4;
    const test = Math.floor(divideVal);
    return test * 3;
  };
  const getXvalue = i => {
    if (i === 0 || i % 4 === 0) {
      return 0;
    }
    if (i === 1 || i % 4 === 1) {
      return 3;
    }
    if (i === 2 || i % 4 === 2) {
      return 6;
    }
    if (i === 3 || i % 4 === 3) {
      return 9;
    }
  };
  const generateLayout = () => {
    if (list && list.length === 0) {
      return;
    }
    const ids = list.map(l => l.id);

    const data = [...Array(ids.length).keys()];
    return data.map((item, i) => {
      const y = Math.ceil(Math.random() * 2) + 1;

      return {
        x: getXvalue(i),
        y: getYvalue(i),
        w: 350,
        h: 3,
        i: ids[i],
        minW: 3,
        maxW: 12,
        minH: 2,
      };
    });
  };
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (list && list.length === 0) {
      return;
    }

    if (!isMounted) {
      setIsMounted(true);
      getScreenLayoutHandlerdata();
    }
  }, [list]);

  async function getScreenLayoutHandlerdata() {
    const screenJson = JSON.parse(getSecureSessionData('selectedScreen'));
    try {
      const payload = {
        screen_id: screenJson.id,
      };

      const {
        success,
        data,
        message,
      } = await questionGQL.getScreenLayoutHandler(payload);
      if (success) {
        let lyData = [];
        if (screenJson.id.toString() === data.screen_id.toString()) {
          if (data.layout === null) {
            lyData = generateLayout();
            setNewLayout({ lg: lyData });
          } else {
            if (data.layout.length === list.length) {
              lyData = data.layout;
              setNewLayout({ lg: data.layout });
            }
            setLayoutKey(layoutKey + 1);
          }
        }
      } else {
        appReceiveError(message);
      }
    } catch (err) {
      appReceiveError(err);
    }
  }

  return (
    <>
      {!selectedScreen ? (
        <section
          className="locked-screen-wrapper text-center"
          style={{ width: '100%' }}
        >
          <form className="card col-md-9 observer-card">
            <div className="wrapper__heading mb-4 center">
              Please wait for the session to continue
            </div>
            <div className="col-md-12">
              <Image
                src={isSeramount ? seramount_Logo : eabLogo}
                alt="Logo"
                width={isSeramount ? 192 : 108}
                className="mb-2"
              />
            </div>
          </form>
        </section>
      ) : (
        <DndProvider
          backend={HTML5Backend}
          options={{
            enableTouchEvents: false,
            enableMouseEvents: false,
          }}
        >
          <Example
            list={list}
            // onUpdateLayout={onUpdateLayout}
            layouts={newLayout}
            setUpdate={setUpdate}
            isHost={false}
            setZoomLevel={setZoomLevel}
            zoomLevel={zoomLevel}
          />
        </DndProvider>
      )}
    </>
  );
};

ObserverQuestionCard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  questions: PropTypes.array,
  appReceiveError: PropTypes.func,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
    questions: hostUI.questions,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ObserverQuestionCard);
