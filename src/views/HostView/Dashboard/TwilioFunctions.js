import { Device } from '@twilio/voice-sdk';
import {
  getSecureSessionData,
  setSecureSessionData,
} from '../../../graphqlOperations/encryprWrapper';

var device;
var token;
var call;
var calledAPI = false;

export const intitializeDevice = value => {
  console.log('Initializing device');
  token = getSecureSessionData('twilioToken');
  device = new Device(token, {
    logLevel: 1,
    disableAudioContextSounds: true,
    // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
    // providing better audio quality in restrained network conditions.
    codecPreferences: ['opus', 'pcmu'],
  });
  addDeviceListeners(device);

  // Device must be registered in order to receive incoming calls
  device.register();
};

export const addDeviceListeners = () => {
  makeOutgoingCall();
  device.on('registered', function() {
    console.log('Twilio.Device Ready to make and receive calls!');
  });

  device.on('error', function(error) {
    console.log('Twilio.Device Error: ' + error.message);
  });

  device.on('incoming', handleIncomingCall);

  device.audio.on('deviceChange', updateAllAudioDevices.bind(device));
};

export const makeOutgoingCall = async () => {
  if (!calledAPI) {
    calledAPI = true;
    const userData = JSON.parse(getSecureSessionData('UserData'));
    const userRole = getSecureSessionData('role');
    var params = {
      // get the phone number to call from the DOM
      To: `${userData.meetingData.id}-${userRole}`,
    };

    if (device) {
      console.log(`Attempting to call ${params.To} ...`);

      // Twilio.Device.connect() returns a Call object
      call = await device.connect({
        params,
        disableAudioContextSounds: true,
      });

      // add listeners to the Call
      // "accepted" means the call has finished connecting and the state is now "open"
      setSecureSessionData('isTwilioCallStarted', 'true');
      if ([false, 'false'].includes(getSecureSessionData('isMute'))) {
        call.on('accept', unMuteUser);
      } else {
        call.on('accept', muteUser);
      }
    } else {
      console.log('Unable to make call.');
    }
  }
};

export const muteUser = () => {
  call.mute();
};

export const unMuteUser = () => {
  call.mute(false);
};

function handleIncomingCall(call) {
  log(`Incoming call from ${call.parameters.From}`);
  //add event listeners for Accept, Reject, and Hangup buttons
  acceptIncomingCall(call);
  call.on('cancel', handleDisconnectedIncomingCall);
  call.on('disconnect', handleDisconnectedIncomingCall);
  call.on('reject', handleDisconnectedIncomingCall);
}

// ACCEPT INCOMING CALL

function acceptIncomingCall(call) {
  call.accept();
}
// HANDLE CANCELLED INCOMING CALL

function handleDisconnectedIncomingCall() {
  log('Incoming call ended.');
  resetIncomingCallUI();
}

// MISC USER INTERFACE

// Activity log
function log(message) {
  console.log(message);
}

function resetIncomingCallUI() {}

// AUDIO CONTROLS

export const getAudioDevices = async () => {
  await navigator.mediaDevices.getUserMedia({ audio: true });
  updateAllAudioDevices.bind(device);
};

export const updateAllAudioDevices = async () => {
  if (device) {
    // updateDevices(speakerDevices, device.audio.speakerDevices.get());
    // updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
  }
};

export const updateInputDevice = async id => {
  await device.audio.setInputDevice(id);

  addDeviceListeners(device);
};

export const updateOutputDevice = async id => {
  await device.audio.speakerDevices.set([id]);
  addDeviceListeners(device);
};

export const hangUpCall = async () => {
  console.log('Hanging up ...');
  await call.disconnect();
  calledAPI = false;
};

export const updateRingtoneDevice = () => {
  // const selectedDevices = Array.from(ringtoneDevices.children)
  //   .filter(node => node.selected)
  //   .map(node => node.getAttribute('data-id'));
  // device.audio.ringtoneDevices.set(selectedDevices);
};
