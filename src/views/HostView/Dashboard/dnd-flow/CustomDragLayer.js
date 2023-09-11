import React from 'react';
import { useDragLayer } from 'react-dnd';
import BoxDragPreview from './BoxDragPreview.js';
import PropTypes from 'prop-types';

const layerStyles = {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 10,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};
function getItemStyles(
  initialOffset,
  currentOffset,
  transformScale,
  dragCoords,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  let { x, y } = currentOffset;
  const dWrapper = document.querySelector('.dashboard-wrapper');
  const dWrapperBound = dWrapper.getBoundingClientRect();
  const dWrapperLeft = x - dWrapperBound.left;
  const dWrapperTop = y - dWrapperBound.top;

  const transform = `translate(${dWrapperLeft}px, ${dWrapperTop}px) `;
  return {
    transform,
    WebkitTransform: transform,
    boxShadow: 'none',
  };
}
const CustomDragLayer = ({
  layouts,
  isHost,
  transformScale,
  dragCoords,
  ...props
}) => {
  const { itemType, item, initialOffset, currentOffset } = useDragLayer(
    monitor => {
      return {
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
      };
    },
  );
  function renderItem() {
    switch (itemType) {
      case 'box':
        return <BoxDragPreview question={item} isHost={isHost} />;
      default:
        return null;
    }
  }
  // if (!isDragging) {
  //   return null;
  // }
  return (
    <div
      style={{
        ...layerStyles,
      }}
      className="drag-layer"
    >
      <div
        style={{
          transform: `scale(${transformScale}) translate(0,0)`,
          transformOrigin: '0% 0%',
          height: '100%',
        }}
      >
        <div
          style={getItemStyles(
            initialOffset,
            currentOffset,
            transformScale,
            dragCoords,
          )}
        >
          {renderItem()}
        </div>
      </div>
    </div>
  );
};

CustomDragLayer.propTypes = {
  snapToGrid: PropTypes.bool,
  layouts: PropTypes.object,
  isHost: PropTypes.bool,
  transformScale: PropTypes.number,
  dragCoords: PropTypes.object,
};

export default CustomDragLayer;
