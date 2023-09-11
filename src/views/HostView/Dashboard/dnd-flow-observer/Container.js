import update from 'immutability-helper';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import DraggableBox from './DraggableBox.js';
import { snapToGrid as doSnapToGrid } from './snapToGrid.js';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button, Image } from 'react-bootstrap';
import zoomInIcon from '../../../../assets/images/zoom-in.svg';
import zoomOutIcon from '../../../../assets/images/zoom-out.svg';
import maximizeIcon from '../../../../assets/images/maximize.svg';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
const Container = ({
  snapToGrid,
  list,
  layouts,
  onUpdateLayout,
  setUpdate,
  isHost,
  setZoomLevel,
  zoomLevel,
}) => {
  const [boxes, setBoxes] = useState({});
  const [isMount, setIsMount] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);
  const ref = useRef(null);

  const moveBox = useCallback(
    (id, left, top) => {
      setBoxes(
        update(boxes, {
          [id]: {
            $merge: { left, top },
          },
        }),
      );
    },
    [boxes],
  );

  useEffect(() => {
    const updatedList = list.reduce(
      (obj, item) => Object.assign(obj, { [item.id]: item }),
      {},
    );
    Object.keys(updatedList).map((l, i) => {
      if (layouts && layouts.lg && layouts.lg[i]) {
        updatedList[l].left = layouts.lg[i].x;
        updatedList[l].top = layouts.lg[i].y;
      } else {
        updatedList[l].left = 10;
        updatedList[l].top = 0;
      }
    });
    setBoxes(updatedList);
  }, [list, layouts]);

  const [, drop] = useDrop(
    () => ({
      accept: 'box',
      drop(item, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset();
        let left = Math.round(item.left + delta.x);
        let top = Math.round(item.top + delta.y);
        if (snapToGrid) {
          [left, top] = doSnapToGrid(left, top);
        }

        moveBox(item.id, left, top);
        onUpdateLayout(item.id, left, top);
        // setIsMount(true);
        return undefined;
      },
    }),
    [moveBox],
  );

  const getWidth = () => {
    const boxElm = document.querySelector('.question');
    if (!boxElm) {
      return '100%';
    }
    return boxElm.offsetWidth + 'px';
  };
  const getHeight = () => {
    const boxElm = document.querySelector('.question');
    if (!boxElm) {
      return '100%';
    }
    return boxElm.offsetHeight + 'px';
  };

  const handleIncrease = () => {
    setZoomImage(true);
    setUpdate(false);
  };

  const handleDecrease = () => {
    setZoomImage(false);
    setUpdate(true);
  };

  const handleResize = () => {
    const dashEle = document.querySelector('.dashboard-wrapper');
    let dashEleWidth = '100%';
    if (dashEle !== null) {
      const dashwidth = dashEle.clientWidth;
      const dashHeight = dashEle.clientHeight;
      dashEleWidth = dashwidth;
      const main_width = document.querySelector('.main-box');
      if (main_width !== null) {
        main_width.style.width = dashEleWidth + 'px';
        main_width.style.height = dashHeight + 'px';
      }
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    const dashEle = document.querySelector('.react-transform-element');
    if (dashEle !== null) {
      setTimeout(() => {
        dashEle.style.transform = `translate(0px, 0px) scale(${zoomLevel})`;
      }, 800);
    }
  }, []);

  return (
    <div
      ref={drop}
      className="main-box"
      //   onMouseDown={handleMouseDown}
      style={{
        width: getWidth(),
        height: getHeight(),
        // border: '1px solid black',
        position: 'relative',
      }}
    >
      <TransformWrapper
        scale={zoomLevel}
        initialScale={zoomLevel}
        defaultPositionX={0}
        defaultPositionY={0}
        positionX={0}
        positionY={0}
        initialPositionX={200}
        initialPositionY={100}
        doubleClick={{ disabled: true }}
        centerOnInit={{ disabled: true }}
        wheel={{ wheelEnabled: false }}
        pan={{ disabled: true }}
      >
        {({
          zoomIn,
          zoomOut,
          resetTransform,
          setScale,
          previousScale,

          ...rest
        }) => (
          <>
            <div
              className={classNames({
                'transform-class': update,
                'cursor-grab update-zoomin': zoomImage,
              })}
              style={{ width: '100%' }}
            >
              <TransformComponent style={{ width: '100%' }}>
                {Object.keys(boxes).length > 0 &&
                  Object.keys(boxes).map((key, index) => (
                    <DraggableBox
                      key={key}
                      id={key}
                      {...boxes[key]}
                      // setIsDraggingYes={setIsDraggingYes}
                      ref={ref}
                      onUpdateLayout={onUpdateLayout}
                      setIsMount={setIsMount}
                      isMount={isMount}
                      isHost={isHost}
                      index={index}
                    />
                  ))}
              </TransformComponent>
            </div>
            <div className="dashboard-footer__right">
              <Button
                variant="white"
                className="btn-icon ms-auto"
                aria-label="maxiMize-observer"
                onClick={e => {
                  handleDecrease();
                  setTimeout(() => {
                    resetTransform(e);
                    setZoomLevel(1);
                  }, 100);
                }}
              >
                <Image src={maximizeIcon} alt="Add" width={24} />
              </Button>
              <Button
                variant="white"
                className="btn-icon ms-3"
                aria-label="Zoom-Out-observer"
                onClick={e => {
                  handleIncrease();
                  setTimeout(() => {
                    setScale(zoomLevel - 0.2);
                    setZoomLevel(zoomLevel - 0.2);
                  }, 100);
                }}
              >
                <Image src={zoomOutIcon} alt="Add" width={24} />
              </Button>
              <Button
                variant="white"
                className="btn-icon ms-3"
                aria-label="Zoom-In-observer"
                onClick={() => {
                  handleIncrease();
                  setTimeout(() => {
                    setScale(zoomLevel + 0.2);
                    setZoomLevel(zoomLevel + 0.2);
                  }, 100);
                }}
              >
                <Image src={zoomInIcon} alt="Add" width={24} />
              </Button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
Container.propTypes = {
  snapToGrid: PropTypes.bool,
  list: PropTypes.array,
  layouts: PropTypes.object,
  onUpdateLayout: PropTypes.func,
  setUpdate: PropTypes.func,
  isHost: PropTypes.bool,
  zoomLevel: PropTypes.number,
  setZoomLevel: PropTypes.func,
};
export default Container;
