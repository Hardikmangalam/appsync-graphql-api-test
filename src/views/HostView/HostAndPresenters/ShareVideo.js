import classNames from 'classnames';
import React, { useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import chatbg from '../../../assets/images/chat-bg.svg';
import addIcon from '../../../assets/images/plus.svg';
import flipIcon from '../../../assets/images/flip.svg';

const ShareVideo = () => {
  const [startWebcam, setStartWebcam] = useState(false);
  const [toggleTransformImage, setToggleTransformImage] = useState(false);
  return (
    <>
      {' '}
      <div className="host-sidebar__heading text-uppercase">
        Video
        {startWebcam && (
          <Button
            className="ms-auto p-0"
            aria-label="Flip"
            onClick={() => setToggleTransformImage(!toggleTransformImage)}
          >
            <Image src={flipIcon} alt="Flip" />
          </Button>
        )}
      </div>
      <div className="video-chat">
        {startWebcam && (
          <>
            <Image
              src={chatbg}
              alt="Video"
              width="100%"
              height={162}
              className={classNames(
                { 'scale-x-n': toggleTransformImage },
                'video-image',
              )}
            />
            <Button
              variant="white"
              size="sm"
              aria-label="Stop-Sharing"
              className="text-red stop-sharing-btn"
              onClick={() => setStartWebcam(false)}
            >
              Stop Sharing
            </Button>
          </>
        )}

        {!startWebcam && (
          <Button
            aria-label="Start My Webcam"
            variant="blue"
            size="sm"
            onClick={() => setStartWebcam(true)}
          >
            <Image
              src={addIcon}
              alt="Start My Webcam"
              width={20}
              className="invert-white me-2"
            />
            Start My Webcam
          </Button>
        )}
      </div>
    </>
  );
};

export default ShareVideo;
