import React, { useState } from 'react';
import Container from './Container.js';
import CustomDragLayer from './CustomDragLayer.js';
import PropTypes from 'prop-types';

const Example = ({
  list,
  layouts,
  onUpdateLayout,
  setUpdate,
  isHost,
  handleChange,
  setModalState,
  setEditQuestionModal,
  duplicateQuestion,
  deleteQuestionHandler,
  setEditQuestionNumber,
  setEditQueId,
  getOnlyQuetionNumbers,
  setEditNumber,
  setIsLoading,
  setQuestionError,
  onUpdateResize,
  setZoomLevel,
  zoomLevel,
}) => {
  const [snapToGridAfterDrop] = useState(false);
  const [snapToGridWhileDragging] = useState(false);
  const [transformScale, setTransformScale] = useState(1);
  const [dragCoords, setDragCoords] = useState({ left: 0, top: 0 });
  return (
    <>
      <Container
        snapToGrid={snapToGridAfterDrop}
        list={list}
        layouts={layouts}
        onUpdateLayout={onUpdateLayout}
        duplicateQuestion={duplicateQuestion}
        deleteQuestionHandler={deleteQuestionHandler}
        setUpdate={setUpdate}
        isHost={isHost}
        handleChange={handleChange}
        setModalState={setModalState}
        setEditQuestionModal={setEditQuestionModal}
        setEditQuestionNumber={setEditQuestionNumber}
        setEditQueId={setEditQueId}
        setTransformScale={setTransformScale}
        setDragCoords={setDragCoords}
        getOnlyQuetionNumbers={getOnlyQuetionNumbers}
        setEditNumber={setEditNumber}
        setIsLoading={setIsLoading}
        setQuestionError={setQuestionError}
        onUpdateResize={onUpdateResize}
        setZoomLevel={setZoomLevel}
        zoomLevel={zoomLevel}
      />
      <CustomDragLayer
        snapToGrid={snapToGridWhileDragging}
        list={list}
        layouts={layouts}
        isHost={isHost}
        transformScale={transformScale}
        dragCoords={dragCoords}
      />
    </>
  );
};

Example.propTypes = {
  list: PropTypes.array,
  layouts: PropTypes.object,
  onUpdateLayout: PropTypes.func,
  setUpdate: PropTypes.func,
  duplicateQuestion: PropTypes.func,
  deleteQuestionHandler: PropTypes.func,
  isHost: PropTypes.bool,
  handleChange: PropTypes.func,
  setModalState: PropTypes.func,
  setEditQuestionModal: PropTypes.func,
  setQuestionError: PropTypes.func,
  setEditQuestionNumber: PropTypes.func,
  setEditQueId: PropTypes.func,
  setEditNumber: PropTypes.func,
  setIsLoading: PropTypes.func,
  getOnlyQuetionNumbers: PropTypes.func,
  onUpdateResize: PropTypes.func,
  zoomLevel: PropTypes.number,
  setZoomLevel: PropTypes.func,
};

export default Example;
