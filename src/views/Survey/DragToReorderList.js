import React from 'react';
import PropTypes from 'prop-types';
import Drag from '../../assets/images/drag.svg';

const initialDnDState = {
  draggedFrom: null,
  draggedTo: null,
  isDragging: false,
  originalOrder: [],
  updatedOrder: [],
};

let initialPosition;

export const DragToReorderList = ({ items, index, updateList }) => {
  const list = items;
  const [dragAndDrop, setDragAndDrop] = React.useState({
    ...initialDnDState,
    originalOrder: list,
  });

  // onDragStart fires when an element
  // starts being dragged
  const onDragStart = event => {
    if (initialPosition === undefined) {
      initialPosition = Number(event.currentTarget.dataset.position);
    }
    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: initialPosition,
      isDragging: true,
      originalOrder: list,
    });

    // Note: this is only for Firefox.
    // Without it, the DnD won't work.
    // But we are not using it.
    event.dataTransfer.setData('text/html', '');
  };

  const onDragOver = event => {
    // in order for the onDrop
    // event to fire, we have
    // to cancel out this one
    event.preventDefault();

    let newList = list;
    // index of the item being dragged
    // const { draggedFrom } = dragAndDrop;
    // index of the droppable area being hovered
    const draggedTo = event.currentTarget.dataset.position;
    const itemDragged = newList[initialPosition];
    const remainingItems = newList.filter(
      (item, idx) => idx !== initialPosition,
    );

    newList = [
      ...remainingItems.slice(0, draggedTo),
      itemDragged,
      ...remainingItems.slice(draggedTo),
    ];

    if (draggedTo !== dragAndDrop.draggedTo) {
      setDragAndDrop({
        ...dragAndDrop,
        updatedOrder: newList,
        draggedFrom: initialPosition,
        draggedTo,
      });
    }
  };

  const onDrop = () => {
    updateList(dragAndDrop.updatedOrder);
    initialPosition = undefined;
    setDragAndDrop({ initialDnDState });
  };

  const onDragLeave = async () => {
    await setDragAndDrop({ initialDnDState });
  };

  return (
    <>
      <img
        src={Drag}
        alt="drag"
        key={index}
        data-position={index}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        className={
          dragAndDrop && dragAndDrop.draggedTo === Number(index)
            ? 'dropArea me-3'
            : 'me-3'
        }
        // aria-hidden="true"
      />
    </>
  );
};

DragToReorderList.propTypes = {
  items: PropTypes.object,
  index: PropTypes.number,
  updateList: PropTypes.func,
};
