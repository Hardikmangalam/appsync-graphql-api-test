import React, { useState } from 'react';
import { Button, Image, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ButtonWithHoverEffect = ({
  defaultImage,
  hoverImage,
  hoverColor,
  text,
  btnClassNames,
  imageWidth,
  altText,
  imageClassNames,
  onClick,
  addFetchKey,
  isHandleCloseSpinner,
}) => {
  const [buttonImage, setButtonImage] = useState(defaultImage);
  const [hoverClr, setHoverClr] = useState(null);
  return (
    <>
      <Button
        onMouseOver={() => {
          setButtonImage(hoverImage);
          setHoverClr(hoverColor);
        }}
        onFocus={() => {
          setButtonImage(hoverImage);
          setHoverClr(hoverColor);
        }}
        onMouseLeave={() => {
          setButtonImage(defaultImage);
          setHoverClr(null);
        }}
        onBlur={() => {
          setButtonImage(hoverImage);
          setHoverClr(null);
        }}
        className={btnClassNames}
        onClick={onClick}
        aria-label={altText || text}
        disabled={addFetchKey || isHandleCloseSpinner}
      >
        {defaultImage && (
          <Image
            src={buttonImage}
            alt={altText || text}
            width={imageWidth}
            className={imageClassNames}
          />
        )}
        {text && (
          <span
            className={classNames({
              [`text-${hoverColor}`]: hoverClr,
            })}
          >
            {text}
          </span>
        )}
        {addFetchKey && (
          <Spinner
            className="ms-2"
            animation="border"
            role="status"
            size="sm"
          />
        )}
      </Button>
    </>
  );
};

ButtonWithHoverEffect.propTypes = {
  defaultImage: PropTypes.string,
  hoverImage: PropTypes.string,
  hoverColor: PropTypes.string,
  text: PropTypes.string,
  btnClassNames: PropTypes.string,
  imageWidth: PropTypes.number,
  altText: PropTypes.string,
  imageClassNames: PropTypes.string,
  onClick: PropTypes.func,
  addFetchKey: PropTypes.bool,
  isHandleCloseSpinner: PropTypes.bool,
};

export default ButtonWithHoverEffect;
