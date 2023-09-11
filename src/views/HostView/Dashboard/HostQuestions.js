/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import downIcon from '../../../assets/images/downArrow.svg';
import { setSecureSessionData } from '../../../graphqlOperations/encryprWrapper';
import { List, AutoSizer } from 'react-virtualized';

const HostQuestions = memo(function HostQuestions({
  question,
  type,
  answers,
  qAClassname,
  inBottom,
  setInBottom,
  setScrollTopHeight,
  setScrollHeight,
  setNewScrollHeight,
  scrollArray,
  meetingGroupChatId,
}) {
  const [newMessageClicked, setNewMessageClicked] = useState(false);
  const [messageKey, setMessageKey] = useState(0);
  const [messageArray, setMessageArray] = useState(scrollArray);
  const [messageIdArray, setMessageIdArray] = useState([]);

  const listRef = useRef(null);
  const [scrollToIndex, setScrollToIndex] = useState(0);
  const textMeasurementRef = useRef([]);
  const textMeasurementUserRef = useRef([]);
  const [isScrollBottom, setIsScrollBottom] = useState(false); // State to track manual scrolling
  const [isScrollVisible, setIsScrollVisible] = useState(false); // State to track manual scrolling
  const [chatArray, setChatArray] = useState([]);

  useEffect(() => {
    if (!newMessageClicked) {
      if (inBottom) {
        if (!qAClassname) {
          return;
        }
        const chatElement = document.querySelector(
          `#${qAClassname + question.id}`,
        );

        if (chatElement) {
          chatElement.scrollTop = chatElement.scrollHeight;
          setScrollTopHeight(chatElement.scrollTop);
          setScrollHeight(chatElement.scrollHeight);
        }
      } else {
        if (!qAClassname) {
          return;
        }
        setNewScrollHeight(
          document.querySelector(`#${qAClassname + question.id}`).scrollHeight,
        );
      }
    }
  }, [newMessageClicked]);

  const scrollBotton = id => {
    setNewMessageClicked(true);
    const data = scrollArray.filter(e => e.toString() !== id.toString());
    setSecureSessionData('newMessage', JSON.stringify(data));
    scrollArray = data;
    setMessageKey(messageKey + 1);
  };

  useEffect(() => {
    getDynamicStyle();
  }, []);

  useEffect(() => {
    if (answers && type === 3) {
      if (meetingGroupChatId.length > 0) {0
        const filterData = answers.filter(el => {
          if (
            el &&
            el.meetingGroupIds &&
            el.meetingGroupIds.length > 0 &&
            el.meetingGroupIds.some(e => meetingGroupChatId.includes(e))
          ) {
            return el;
          }
        });
        setChatArray(filterData);
      } else {
        setChatArray(answers);
      }
    }
  }, [answers, meetingGroupChatId]);

  const handleScroll = ({ scrollTop, scrollHeight, clientHeight }) => {
    const isAtBottom = scrollHeight - clientHeight <= scrollTop + 16;
    if (isAtBottom) {
      setIsScrollBottom(true);
      setIsScrollVisible(false);
    } else if (isScrollBottom) {
      setIsScrollBottom(false);
      setIsScrollVisible(true);
    }
  };

  useEffect(() => {
    if (type === 3) {
      if (meetingGroupChatId.length !== messageIdArray.length) {
        scrollBotton(question.id);
        getDynamicStyle();
        setMessageIdArray(meetingGroupChatId);
        setInBottom(false);
      }
    }
  }, [meetingGroupChatId, chatArray]);

  const getDynamicStyle = () => {
    var qheightELE = document.getElementById(
      `question-card-title-${question.id}`,
    );

    if (qheightELE !== null) {
      var qheight = qheightELE.clientHeight;
      var qheightof = qheightELE.clientHeight;
      qheightof += parseInt(
        window.getComputedStyle(qheightELE).getPropertyValue('padding-top'),
      );
      qheightof += parseInt(
        window.getComputedStyle(qheightELE).getPropertyValue('padding-bottom'),
      );

      document.getElementById(
        `question-card-quickAns-${question.id}`,
      ).style.maxHeight = `calc(100% - ${qheight + 25}px)`;
    }
  };

  const handleRowsRendered = ({ startIndex, stopIndex }) => {
    // Get the List component
    const list = listRef.current;

    // Calculate the new scroll properties
    const scrollTop = list.getOffsetForRow({ index: startIndex });
    const clientHeight = list.props.height;
    const scrollHeight = list.Grid.getTotalRowsHeight();

    if (clientHeight > scrollHeight) {
      const data = scrollArray.filter(
        e => e.toString() !== question.id.toString(),
      );
      setSecureSessionData('newMessage', JSON.stringify(data));
      scrollArray = data;
      setMessageKey(messageKey + 1);
      setIsScrollVisible(false);
    } else {
      if (!isScrollVisible) {
        setIsScrollVisible(true);
      }
    }
  };

  const rowRenderer = ({ index, key, style }) => {
    const { message, user_id, question_id, meetingGroupIndex } = chatArray[
      index
    ];
    if (message === undefined) return;
    const groupMessage =
      meetingGroupIndex &&
      meetingGroupIndex !== undefined &&
      meetingGroupIndex.length
        ? ` (Group - ${meetingGroupIndex})`
        : '';
    const newMessage = message.trim() + groupMessage;
    return (
      <div key={key} style={style}>
        <div className="fw-bold d-flex w-100">
          <div
            className="d-flex"
            style={{ minWidth: 'max-content', marginRight: '6px' }}
          >
            {user_id ? `${user_id}:` : ''}{' '}
          </div>
          <div
            style={{ whiteSpace: 'pre-wrap', paddingRight: '8px' }}
            className={`text-bismark chat_div_${question_id} content break-word w-100`}
          >
            {newMessage && newMessage.includes('\n') ? (
              <>
                {newMessage
                  .trim()
                  .split(/\r\n|\r|\n/)
                  .map(e => (
                    <div key={e} className="break-word">
                      {e}
                      <br />
                    </div>
                  ))}
              </>
            ) : (
              <>{newMessage}</>
            )}
          </div>
        </div>
      </div>
      // </div>
    );
  };

  const getRowHeight = index => {
    const { message, user_id, meetingGroupIndex } = chatArray[index];
    if (message === undefined) return 0;
    const groupMessage =
      meetingGroupIndex &&
      meetingGroupIndex !== undefined &&
      meetingGroupIndex.length
        ? ` (Group - ${meetingGroupIndex})`
        : '';
    let formattedMessage = '';
    if (message.includes('\n')) {
      formattedMessage = message.trim().replace(/\n/g, '<br>') + groupMessage;
    } else {
      formattedMessage = message.trim() + groupMessage;
    }
    let rHieght = 0;

    if (!textMeasurementRef.current) return 0;

    const usrDv = textMeasurementUserRef.current;
    usrDv.textContent = user_id ? `${user_id}:` : '';
    const hiddenDiv = textMeasurementRef.current;
    hiddenDiv.innerHTML = formattedMessage;

    rHieght = hiddenDiv.offsetHeight;

    hiddenDiv.innerHTML = '';
    return rHieght + 10; // Use a fixed height for each line
  };

  const scrollToRow = rowIndex => {
    scrollBotton(question.id);
    setScrollToIndex(rowIndex);
    if (listRef.current && listRef.current.scrollToRow) {
      listRef.current.scrollToRow(rowIndex);
    }
  };

  useEffect(() => {
    if (type === 3) {
      if (chatArray && chatArray.length > 0 && isScrollBottom) {
        scrollToRow(chatArray.length);
      }
      if (chatArray && chatArray.length > 0 && inBottom) {
        setIsScrollBottom(true);
        setInBottom(false);
        scrollToRow(chatArray.length);
      }
    }
  }, [chatArray, isScrollBottom, inBottom]);

  if (type == 4) {
    return (
      <>
        <ListGroup>
          {answers.map((answer, index) => (
            <ListGroupItem key={index}>
              <div className="d-flex flex-grow-1 w-100">
                <span className="text-gray-middle">{index + 1}.</span>
                <span
                  className="break-word w-80"
                  style={{ marginLeft: '.75rem' }}
                  aria-label="Host-Option"
                >
                  {/* {answer.name} */}
                  <div
                    dangerouslySetInnerHTML={{ __html: answer.name.trim() }}
                  />
                </span>
              </div>
              <div className="text-right text-nowrap">
                {answer.ratio}% ({answer.userCount})
              </div>
              <div>{answer.value}</div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </>
    );
  } else if (type == 2) {
    return (
      <>
        <ListGroup className="quick-answer-list">
          {answers.map((answer, index) => (
            <ListGroupItem key={index}>
              <div
                id={`q-title-${question.id}`}
                className="d-flex break-word flex-grow-1 w-75"
                style={{ marginRight: '1rem' }}
              >
                {/* {answer.name} */}
                <div dangerouslySetInnerHTML={{ __html: answer.name.trim() }} />
              </div>
              <div className="text-nowrap text-right w-25">
                <span id={`op-height-${question.id}`} className="text-right">
                  {answer.ratio}% ({answer.userCount})
                </span>
              </div>
              <div
                className="text-gray-middle text-right"
                style={{ marginLeft: '.375rem' }}
              >
                {answer.value}
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </>
    );
  } else if (type == 1) {
    return (
      <>
        <ListGroup className="quick-answer-list">
          {answers.map((answer, index) => (
            <ListGroupItem key={index}>
              <div
                className="d-flex break-word  flex-grow-1 w-75"
                style={{ marginRight: '1rem' }}
              >
                {/* {answer.name}{' '} */}
                <div dangerouslySetInnerHTML={{ __html: answer.name.trim() }} />
              </div>
              <div className="text-nowrap text-right">
                {answer.ratio}% ({answer.userCount})
              </div>
              <div>{answer.value}</div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </>
    );
  } else {
    return (
      <>
        <AutoSizer>
          {({ width, height }) => (
            <>
              <div
                style={{
                  position: 'absolute',
                  visibility: 'hidden',
                  bottom: '0px',
                  right: '20px',
                  left: '12px',
                  width: `calc(100% - 29px)`,
                }}
              >
                <div className="fw-bold d-flex w-100">
                  <div
                    ref={textMeasurementUserRef}
                    className="d-flex"
                    style={{ minWidth: 'max-content', marginRight: '6px' }}
                  ></div>
                  <div
                    ref={textMeasurementRef}
                    style={{
                      whiteSpace: 'pre-wrap',
                      paddingRight: '8px',
                    }}
                    className="break-word"
                  ></div>
                </div>
              </div>
              <List
                ref={listRef}
                height={height}
                rowCount={chatArray.length}
                rowHeight={({ index }) => getRowHeight(index, width)}
                rowRenderer={rowRenderer}
                width={width + 10}
                onScroll={handleScroll}
                onRowsRendered={handleRowsRendered} // Attach the callback
              />
            </>
          )}
        </AutoSizer>
        <div key={messageKey}>
          {isScrollVisible &&
          chatArray &&
          chatArray.length > 1 &&
          scrollArray.includes(question && question.id) ? (
            <span
              className="chat__new__message"
              onClick={() => scrollToRow(chatArray.length)}
            >
              <img src={downIcon} alt="down" />
              <strong className="m-3">New Message</strong>
            </span>
          ) : (
            ''
          )}
        </div>
      </>
    );
  }
});

HostQuestions.propTypes = {
  type: PropTypes.number,
  answers: PropTypes.array,
  qAClassname: PropTypes.string,
  inBottom: PropTypes.bool,
  setInBottom: PropTypes.func,
  setScrollTopHeight: PropTypes.func,
  setScrollHeight: PropTypes.func,
  scrollArray: PropTypes.array,
  setNewScrollHeight: PropTypes.func,
  question: PropTypes.object,
  attendeesData: PropTypes.array,
  meetingGroupChatId: PropTypes.array,
};

export default HostQuestions;
