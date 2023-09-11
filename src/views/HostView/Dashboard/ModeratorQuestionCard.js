/* eslint-disable no-unused-vars */
/* eslint-disable indent */
import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';

import seramount_Logo from '../../../assets/images/seramountLogo.svg';
import eabLogo from '../../../assets/images/EABLogoColor-primaryLogo.png';
//store
import { connect } from 'react-redux';
import { compose } from 'redux';

import reducer, { getHostUI } from '../../../store/reducers/host-ui';
import injectReducer from '../../../utils/injectReducer';

import {
  setHostUI,
  changeScaleView,
  onDeleteQuestionSuccess,
} from '../../../store/actions/host-ui';
import { questionGQL } from '../../../graphqlOperations';
import ModeratorQuestions from './ModeratorQuestions';
import { appReceiveSuccess } from '../../../store/actions/error';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Example from './dnd-flow-moderator/Example';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

var testLayout = {
  lg: [],
};

const ModeratorQuestionCard = ({ host_ui, questions }) => {
  const [list, setList] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [update, setUpdate] = useState(true);
  const [newLayout, setNewLayout] = useState(testLayout);
  const [layoutKey, setLayoutKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(
    Number(getSecureSessionData('zoomLevel')) || 1,
  );

  const isSeramount = JSON.parse(getSecureSessionData('branding'));

  useEffect(() => {
    setSecureSessionData('zoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    if (host_ui && Object.keys(host_ui.selected_screen).length) {
      setNewLayout({ lg: [] });
      setList([]);
      setSelectedScreen(host_ui.selected_screen.id);
    }
  }, [host_ui.selected_screen.id]);

  useEffect(() => {
    document.querySelector('.dashboard-wrapper').scrollTo(0, 0);
  }, [selectedScreen]);

  useEffect(() => {
    if (questions && questions.length >= 0) {
      setList(questions);
    }
  }, [questions]);

  useEffect(() => {
    if (host_ui && host_ui.screen_layout && host_ui.screen_layout.length > 0) {
      setNewLayout({ lg: host_ui.screen_layout });
      setLayoutKey(layoutKey + 1);
    }
  }, [host_ui.screen_layout]);

  useEffect(() => {
    if (list && list.length === 0) {
      return;
    }
  }, [list]);

  return (
    <>
      {!selectedScreen ? (
        <section
          className="locked-screen-wrapper text-center"
          style={{ width: '100%' }}
        >
          <form className="card col-md-9 observer-card align-items-center">
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

ModeratorQuestionCard.propTypes = {
  host_ui: PropTypes.object.isRequired,
  questions: PropTypes.array,
  questionNumbers: PropTypes.array,
  appReceiveSuccess: PropTypes.func,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  return {
    host_ui: getHostUI(hostUI),
    questions: hostUI.questions,
    questionNumbers: hostUI.questionNumbers,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(ModeratorQuestionCard);
