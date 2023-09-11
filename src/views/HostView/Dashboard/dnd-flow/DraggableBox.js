import React, { memo, useEffect, forwardRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import Box from './Box.js';
import PropTypes from 'prop-types';
import { getSecureSessionData } from '../../../../graphqlOperations/encryprWrapper.js';

function getStyles(left, top, isDragging) {
  const transform = `translate3d(${left > 0 ? left : 0}px, ${
    top > 0 ? top : 0
  }px, 0)`;

  return {
    position: 'absolute',
    transform,
    WebkitTransform: transform,
    width: '335px',
    height: '450px',
    // IE fallback: hide the real node using CSS when dragging
    // because IE will ignore our custom "empty image" drag preview.
    opacity: isDragging ? 0 : 1,
    // height: isDragging ? 0 : '',
  };
}
const DraggableBox = memo(
  forwardRef((props, resf) => {
    const {
      boxData,
      id,
      left,
      top,
      isHost,
      duplicateQuestion,
      deleteQuestionHandler,
      handleChange,
      setModalState,
      setEditQuestionModal,
      setEditQuestionNumber,
      setDragCoords,
      setEditQueId,
      getOnlyQuetionNumbers,
      setEditNumber,
      setIsLoading,
      setQuestionError,
      onUpdateResize,
    } = props;
    const [{ isDragging }, drag, preview] = useDrag(
      () => ({
        type: 'box',
        item: { ...props },
        canDrag:
          ![true, 'true'].includes(getSecureSessionData('allowEditTemplate')) &&
          ![true, 'true'].includes(getSecureSessionData('isNewTemplate'))
            ? false
            : isHost,
        collect: monitor => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [id, left, top, isHost],
    );
    useEffect(() => {
      preview(getEmptyImage(), { captureDraggingState: true });
    }, []);

    useEffect(() => {
      setDragCoords({ left, top });
    }, [left, top]);

    return (
      <div
        // ref={drag}
        role="group"
        aria-label={boxData.title}
        style={getStyles(left, top, isDragging)}
        className={`drag-${props.id}`}
      >
        <Box
          refs={drag}
          duplicateQuestion={duplicateQuestion}
          deleteQuestionHandler={deleteQuestionHandler}
          question={boxData}
          handleChange={handleChange}
          setModalState={setModalState}
          setEditQuestionModal={setEditQuestionModal}
          setEditQuestionNumber={setEditQuestionNumber}
          setEditQueId={setEditQueId}
          getOnlyQuetionNumbers={getOnlyQuetionNumbers}
          setEditNumber={setEditNumber}
          setIsLoading={setIsLoading}
          setQuestionError={setQuestionError}
          onUpdateResize={onUpdateResize}
        />
      </div>
    );
  }),
);

DraggableBox.displayName = 'DraggableBox';

DraggableBox.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  top: PropTypes.number,
  left: PropTypes.number,
  question: PropTypes.array,
  setIsDraggingYes: PropTypes.func,
  onUpdateLayout: PropTypes.func,
  setIsMount: PropTypes.func,
  duplicateQuestion: PropTypes.func,
  deleteQuestionHandler: PropTypes.func,
  isMount: PropTypes.bool,
  isHost: PropTypes.bool,
  handleChange: PropTypes.func,
  setModalState: PropTypes.func,
  setEditQuestionModal: PropTypes.func,
  setDragCoords: PropTypes.func,
  setQuestionError: PropTypes.func,
  setEditQuestionNumber: PropTypes.func,
  setEditQueId: PropTypes.func,
  setEditNumber: PropTypes.func,
  setIsLoading: PropTypes.func,
  getOnlyQuetionNumbers: PropTypes.func,
  onUpdateResize: PropTypes.func,
  boxData: PropTypes.object,
};

export default DraggableBox;
