/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
const Participant = ({
  participant,
  deviceId,
  inputDeviceId,
  outputDeviceId,
}) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const videoRef = useRef();
  const audioRef = useRef();
  console.log('audioRef', audioRef);
  console.log('participant into the test', participant);

  const trackpubsToTracks = trackMap =>
    Array.from(trackMap.values())
      .map(publication => publication.track)
      .filter(track => track !== null);
  useEffect(() => {
    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));
    const trackSubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => [...videoTracks, track]);
      } else if (track.kind === 'audio') {
        setAudioTracks(audioTracks => [...audioTracks, track]);
      }
    };
    const trackUnsubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => videoTracks.filter(v => v !== track));
      } else if (track.kind === 'audio') {
        setAudioTracks(audioTracks => audioTracks.filter(a => a !== track));
      }
    };
    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);
    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);
  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);
  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);
  return (
    <>
      <video ref={videoRef} autoPlay={true} />
      <audio
        deviceId={deviceId}
        id="localAudio"
        ref={audioRef}
        autoPlay={true}
        muted={false}
      />
    </>
  );
};
Participant.propTypes = {
  participant: PropTypes.object,
  deviceId: PropTypes.string,
  inputDeviceId: PropTypes.string,
  outputDeviceId: PropTypes.string,
};
export default Participant;
