/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import WizardSuccess from './vizartSuccess';
import { getSecureSessionData } from '../../graphqlOperations/encryprWrapper';
const beep = 'https://dpryujcmbjcxr.cloudfront.net/notify.mp3';
let isDeviceLoaded = false,
  isNewDeviceChanges = false;
var _ = require('lodash');

var audio = new Audio();
audio.setAttribute('id', 'localAudio');
const DeviceSelect = ({
  isAudioPause,
  volume,
  isPlay,
  testAgain,
  setDynamicDataLength,
  setValueLength,
  setPlaying,
}) => {
  const [compKey, setCompKey] = useState(1);
  let userAgent = navigator.userAgent;

  // Put variables in global scope to make them available to the browser console.

  let meterRefresh = null;

  var videoElement = document.querySelector('audio');

  var audioOutputSelect = document.querySelector('select#audioOutput');

  useEffect(() => {
    audio.src = beep;
    audio.load();
    audio.loop = true;
    audio.play();
  }, []);

  useEffect(() => {
    audio.volume = volume / 100;
    var player = document.getElementById('localAudio');
    player.pause();
  }, [volume]);

  useEffect(() => {
    if (isAudioPause) {
      setPlaying('STOP');
      audio.pause();
      pauseAudio();
      setCompKey(compKey + 1);
    }
  }, [isAudioPause]);

  useEffect(() => {
    if (testAgain) {
      setTimeout(() => {
        isDeviceLoaded = false;
        isNewDeviceChanges = false;
        getMediaDeviceList();
      }, 1000);
    }
  }, [testAgain]);

  useEffect(() => {
    if (isPlay) {
      var player = document.getElementById('localAudio');
      player.src = beep;
      player.loop = true;
      player.load();
      player.play();
    }
  }, [isPlay]);

  const changeAudioDestination = e => {
    const idx = document.getElementById('deviceSelect1').selectedIndex;
    setValueLength(idx);
    audio.src = beep;
    audio.load();
    audio.loop = true;
    audio.play();
    // var player = document.getElementById('localAudio');
    // player.pause();
    // player.src = '';
    // player.load();
    videoElement = document.querySelector('audio');
    const { value } = e.target;
    attachSinkId(audio, value);
  };
  const attachSinkId = (element, sinkId) => {
    var player = document.querySelector('audio');
    player.pause();
    if (typeof element.sinkId !== 'undefined') {
      if (userAgent.match(/firefox|fxios/i)) {
        console.log('player', player);
        element.setAttribute('deviceid', sinkId);
        element.setAttribute('value', sinkId);
        // player.src = beep;
        // player.load();
        // player.play();
        // player.loop = true;
        console.log('log 3');

        audio.src = beep;
        audio.load();
        audio.play();
        audio.loop = true;
      } else {
        element.setAttribute('deviceid', sinkId);
        element.setAttribute('value', sinkId);
        element
          .setSinkId(sinkId)
          .then(() => {
            // player.setSinkId(sinkId);
            // player.src = beep;
            // player.play();
            // player.loop = true;
            audio.setSinkId(sinkId);
            audio.src = beep;
            audio.play();
            audio.loop = true;
            console.log('log 4');

            console.log(`Success, audio output device attached: ${sinkId}`);
          })
          .catch(error => {
            let errorMessage = error;
            if (error.name === 'SecurityError') {
              errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
            }
            console.error(errorMessage);
            // audioOutputSelect.selectedIndex = 0;
          });
      }
    } else {
      console.warn('Browser does not support output device selection.');
    }
  };

  const gotDevices = deviceInfos => {
    const data = deviceInfos.length;
    if (data <= 0 && isDeviceLoaded) {
      isDeviceLoaded = false;
    }
    setDynamicDataLength(data);
    let exitingElement = document.getElementById('deviceSelect1');
    if (exitingElement) {
      let existingDevices = [];
      exitingElement.childNodes.forEach(ele => {
        existingDevices.push(ele.getAttribute('value'));
      });

      let newDevices = deviceInfos.map(ele => ele.deviceId);
      existingDevices = existingDevices.sort((a, b) => a - b);
      newDevices = newDevices.sort((a, b) => a - b);

      if (
        existingDevices &&
        existingDevices.length &&
        newDevices &&
        Array.isArray(newDevices) &&
        newDevices.length &&
        JSON.stringify(existingDevices) !== JSON.stringify(newDevices)
      ) {
        isNewDeviceChanges = true;
      }
    }
    const masterOutputSelector = document.createElement('select');
    masterOutputSelector.setAttribute('id', 'deviceSelect1');
    if (
      deviceInfos &&
      deviceInfos.length &&
      (!isDeviceLoaded || isNewDeviceChanges)
    ) {
      if (deviceInfos.length <= 0) getMediaDeviceList();

      for (let i = 0; i !== deviceInfos.length; ++i) {
        const option = document.createElement('option');
        const deviceInfo = deviceInfos[i];
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audiooutput') {
          console.info('Found audio output device: ', deviceInfo.label);
          option.text = deviceInfo.label || `Default`;
          masterOutputSelector.appendChild(option);
        } else {
          console.log('Found non audio output device: ', deviceInfo.label);
        }
      }

      // Clone the master outputSelector and replace outputSelector placeholders.
      const allOutputSelectors = document.querySelectorAll('select');
      for (let selector = 0; selector < allOutputSelectors.length; selector++) {
        const newOutputSelector = masterOutputSelector.cloneNode(true);
        newOutputSelector.addEventListener('change', changeAudioDestination);
        allOutputSelectors[selector].parentNode.replaceChild(
          newOutputSelector,
          allOutputSelectors[selector],
        );
      }
      isNewDeviceChanges = false;
    } else {
      const option = document.createElement('option');
      option.text = 'Default';
      masterOutputSelector.appendChild(option);
    }
  };

  const handleError = error => {
    // var select = document.getElementById('deviceSelect');
    // // if (select.options.length <= 0) {
    // var option = document.createElement('option');
    // option.text = 'Default';
    // option.value = '';
    // select.appendChild(option);
    // // }

    console.log(
      'navigator.MediaDevices.getUserMedia error: ',
      error.message,
      error.name,
    );
  };

  const pauseAudio = () => {
    // audio.pause();
    const audios = document.getElementsByTagName('audio');
    var player = document.getElementById('localAudio');
    player.pause();
    player.removeAttribute('src');
    // videoElement
    //   .setSinkId('')
    //   .then(() => {
    //     // audio.setSinkId('');
    //     console.log(`Success, audio output device attached:`);
    //   })
    //   .catch(error => {
    //     let errorMessage = error;
    //     if (error.name === 'SecurityError') {
    //       errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
    //     }
    //     console.error(errorMessage);
    //     audioOutputSelect.selectedIndex = 0;
    //   });
    setCompKey(compKey + 1);
  };
  useEffect(() => {
    let interval = null;
    getMediaDeviceList();
    interval = setInterval(() => {
      getMediaDeviceList();
      isDeviceLoaded = true;
    }, 2000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const getMediaDeviceList = () => {
    if (!['PARTICIPANT', 'OBSERVER'].includes(getSecureSessionData('role'))) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(allDevices => {
          console.log('allDevices', allDevices);
          gotDevices(allDevices.filter(ele => ele.kind === 'audiooutput'));
        })
        .catch(handleError);
    }
  };
  return (
    <>
      <audio id="localAudio" />
      <Form.Select id="deviceSelect">
        <option value="">Default</option>
      </Form.Select>
    </>
  );
};
DeviceSelect.propTypes = {
  isAudioPause: PropTypes.bool,
  isPlay: PropTypes.bool,
  testAgain: PropTypes.bool,
  volume: PropTypes.number,
  setDynamicDataLength: PropTypes.func,
  valueLength: PropTypes.func,
  setValueLength: PropTypes.func,
  setPlaying: PropTypes.func,
};
export default DeviceSelect;
