import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import classNames from 'classnames';
import injectReducer from '../../../../utils/injectReducer';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { getPermissionSuccess } from '../../../../store/actions/login';
import {
  changeScaleView,
  onDeleteQuestionSuccess,
  onGetCardResizeSuccess,
  onGetLayoutSuccess,
  onGetQuestionNumbersSuccess,
  onGetQuickAnswerSuccess,
  setHostUI,
} from '../../../../store/actions/host-ui';
import {
  appReceiveError,
  appReceiveSuccess,
} from '../../../../store/actions/error';
import reducer, { getHostUI } from '../../../../store/reducers/host-ui';

import { Resizable } from 're-resizable';
import ModeratorQuestions from '../ModeratorQuestions';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../../graphqlOperations/encryprWrapper';

var testLayout = {
  lg: [],
};

const Box = memo(function Box({
  preview,
  question,
  host_ui,
  id,
  questions,
  questionNumbers,
  index,
}) {
  const pointX = useRef();
  const pointY = useRef();
  const [selectedScreen, setSelectedScreen] = useState(0);
  const [height, setHeight] = useState(null);
  const [width, setWidth] = useState(null);
  const [queKey, setqueKey] = useState(1);

  const [, setScrollTopHeight] = useState(null);
  const [oldScrollHeight, setScrollHeight] = useState(null);
  const [newScrollHeight, setNewScrollHeight] = useState(null);
  const [inBottom, setInBottom] = useState(true);
  const [scrollToBottom, setScrollToBottom] = useState(false);
  const [, setLayouts] = useState(testLayout);
  const [layoutKey, setLayoutKey] = useState(0);
  const [list, setList] = useState([]);

  let scrollArray = JSON.parse(getSecureSessionData('newMessage')) || [];

  const handleScroll = (event, id) => {
    var positionTop = document.getElementById(`question-card-quickAns-${id}`)
      .scrollTop;
    var positionHeight = document.getElementById(`question-card-quickAns-${id}`)
      .scrollHeight;
    var positionClient = document.getElementById(`question-card-quickAns-${id}`)
      .clientHeight;

    if (
      positionHeight - positionTop === positionClient ||
      positionHeight - positionTop - 1 === positionClient
    ) {
      const data = scrollArray.filter(e => e != Number(id));
      scrollArray = data;
      setSecureSessionData('newMessage', JSON.stringify(data));
      setqueKey(queKey + 1);
    }

    if (Number(newScrollHeight) === Number(event.target.scrollHeight)) {
      if (
        oldScrollHeight <
          Number(event.target.scrollTop) + Number(event.target.clientHeight) ||
        newScrollHeight ===
          Number(event.target.scrollTop) + Number(event.target.clientHeight)
      ) {
        setScrollToBottom(true);
        setInBottom(true);
      } else {
        setScrollToBottom(false);
        setInBottom(false);
      }
    } else {
      setInBottom(false);
    }
  };

  const getQuetionNumbers = question_id => {
    let foundNumber = 'Q-#',
      foundObj = null;
    if (
      questionNumbers &&
      Array.isArray(questionNumbers) &&
      questionNumbers.length
    ) {
      foundObj = questionNumbers.find(ele => ele.id == question_id);
      foundNumber = foundObj ? foundObj.queNumber : foundNumber;
    }
    return foundNumber;
  };

  useEffect(() => {
    if (host_ui && Object.keys(host_ui.selected_screen).length) {
      setLayouts({ lg: [] });
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
      setLayouts({ lg: host_ui.screen_layout });
      setLayoutKey(layoutKey + 1);
    }
  }, [host_ui.screen_layout]);

  useEffect(() => {
    if (list && list.length === 0) {
      return;
    }
  }, [list]);

  const getSize = question => {
    if (
      question &&
      question.metadata &&
      question.metadata.width &&
      question &&
      question.metadata &&
      question.metadata.height
    ) {
      return {
        width:
          width || (question && question.metadata && question.metadata.width),
        height:
          height || (question && question.metadata && question.metadata.height),
      };
    } else if (
      (width === null && height === null) ||
      (question && question.metadata === null)
    ) {
      if (question && Number(question.type) === 3) {
        return { width: 335, height: 450 };
      } else {
        return { width: 335, height: 450 };
      }
    }
  };
  return (
    <Fragment key={question.id}>
      <Resizable
        key={question.id}
        id={`res_${question.id}`}
        role="region"
        size={getSize(question)}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        onResizeStop={(e, direction, ref, d) => {
          // e.target.style.width = `${d.width}px`;
          // e.target.style.height = `${d.height}px`;
          // handleCardResizeDataValue(
          //   document.getElementById(`res_${question.id}`).style.width,
          //   document.getElementById(`res_${question.id}`).style.height,
          //   question.id,
          // );
          // setQuestionData(question);
          setHeight(document.getElementById(`res_${question.id}`).style.height);
          setWidth(document.getElementById(`res_${question.id}`).style.width);
        }}
        onResizeStart={() => {
          const leftPos = document.querySelector('.dashboard-wrapper')
            .scrollLeft;
          const bottomPos = document.querySelector('.dashboard-wrapper')
            .scrollTop;
          pointX.current = leftPos;
          pointY.current = bottomPos;
        }}
        onResize={() => {
          document.querySelector('.dashboard-wrapper').scrollLeft =
            pointX.current;
          document.querySelector('.dashboard-wrapper').scrollTop =
            pointY.current;
        }}
        className={`${
          question && question.type === 3
            ? 'question-card-resizeQuick'
            : 'question-card-resize'
        }`}
        handleStyles={{ height: '450px' }}
      >
        <Fragment key={question.id}>
          <Card
            className="question-card observer_scroll  h-100 w-100"
            key={question && question.id}
            role="region"
          >
            <Card.Header className="fw-bold d-flex justify-content-between align-items-center py-2 fw-14">
              {getQuetionNumbers(question && question.id)}
            </Card.Header>
            <Card.Body className={classNames('moderator')} role="region">
              <Card.Title
                id={`question-card-title-${question.id}`}
                className="fw-bold fw-14 text-start bg-alice-blue"
                role="region"
              >
                {/* {question && question.label} */}
                <div dangerouslySetInnerHTML={{ __html: question.label }} />
              </Card.Title>
              <div
                key={question.id}
                role="region"
                aria-label={`question-card-quickAns-${question.id}`}
                onScroll={e => handleScroll(e, question.id)}
                id={`question-card-quickAns-${question.id}`}
                className={
                  question.type == 3
                    ? `question-card-body observerChatCard question-card-quickAns moderator question-card-quickAns-${index}`
                    : 'question-card-body'
                }
              >
                <ModeratorQuestions
                  inBottom={inBottom}
                  setInBottom={setInBottom}
                  setScrollTopHeight={setScrollTopHeight}
                  setScrollHeight={setScrollHeight}
                  setNewScrollHeight={setNewScrollHeight}
                  scrollToBottom={scrollToBottom}
                  question_id={question && question.id}
                  type={question.type}
                  answers={question.response || []}
                  qAClassname={
                    question && question.type === 3
                      ? `question-card-quickAns-`
                      : ''
                  }
                  scrollArray={scrollArray}
                />
              </div>
            </Card.Body>
          </Card>
        </Fragment>
      </Resizable>
    </Fragment>
  );
});

Box.propTypes = {
  host_ui: PropTypes.object.isRequired,
  attendeesData: PropTypes.array,
  selected_screen: PropTypes.object,
  questions: PropTypes.array,
  questionNumbers: PropTypes.array,
  onDeleteQuestionSuccess: PropTypes.func,
  appReceiveSuccess: PropTypes.func,
  appReceiveError: PropTypes.func,
  onGetQuickAnswerSuccess: PropTypes.func,
  onGetCardResizeSuccess: PropTypes.func,
  onGetLayoutSuccess: PropTypes.func,
  update: PropTypes.bool,
  setUpdate: PropTypes.bool,
  layout_view: PropTypes.string,
  onGetQuestionNumbersSuccess: PropTypes.func,
  title: PropTypes.string,
  yellow: PropTypes.bool,
  preview: PropTypes.bool,
  question: PropTypes.object,
  id: PropTypes.string,
  refs: PropTypes.func,
  index: PropTypes.number,
  cardResize: PropTypes.array,
};

const withReducer = injectReducer({ key: 'hostUI', reducer });

const mapStateToProps = state => {
  const { hostUI } = state;
  const { attendeesData, host_ui } = hostUI;
  const { selected_screen, layout_view } = host_ui;
  return {
    attendeesData,
    selected_screen,
    layout_view,
    host_ui: getHostUI(hostUI),
    questions: hostUI.questions,
    questionNumbers: hostUI.questionNumbers,
    cardResize: hostUI.cardResizeData,
  };
};

export function mapDispatchToProps(dispatch) {
  return {
    setHostUI: payload => dispatch(setHostUI(payload)),
    changeScaleView: payload => dispatch(changeScaleView(payload)),
    onDeleteQuestionSuccess: payload =>
      dispatch(onDeleteQuestionSuccess(payload)),
    appReceiveSuccess: payload => dispatch(appReceiveSuccess(payload)),
    appReceiveError: payload => dispatch(appReceiveError(payload)),
    onGetQuickAnswerSuccess: payload =>
      dispatch(onGetQuickAnswerSuccess(payload)),
    onGetCardResizeSuccess: payload =>
      dispatch(onGetCardResizeSuccess(payload)),
    onGetLayoutSuccess: payload => dispatch(onGetLayoutSuccess(payload)),
    onGetQuestionNumbersSuccess: payload =>
      dispatch(onGetQuestionNumbersSuccess(payload)),
    getPermissionSuccess: payload => dispatch(getPermissionSuccess(payload)),

    dispatch,
  };
}

export default compose(
  withReducer,
  connect(mapStateToProps, mapDispatchToProps),
)(Box);
