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
  setZoomLevel,
  zoomLevel,
}) => {
  const [snapToGridAfterDrop] = useState(false);
  const [snapToGridWhileDragging] = useState(false);
  return (
    <>
      <Container
        snapToGrid={snapToGridAfterDrop}
        list={list}
        layouts={layouts}
        onUpdateLayout={onUpdateLayout}
        setUpdate={setUpdate}
        isHost={isHost}
        setZoomLevel={setZoomLevel}
        zoomLevel={zoomLevel}
      />
      <CustomDragLayer
        snapToGrid={snapToGridWhileDragging}
        list={list}
        layouts={layouts}
        isHost={isHost}
      />
    </>
  );
};

Example.propTypes = {
  list: PropTypes.array,
  layouts: PropTypes.object,
  onUpdateLayout: PropTypes.func,
  setUpdate: PropTypes.func,
  isHost: PropTypes.bool,
  zoomLevel: PropTypes.number,
  setZoomLevel: PropTypes.func,
};

export default Example;
