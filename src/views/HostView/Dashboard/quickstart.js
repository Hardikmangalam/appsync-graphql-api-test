import $ from 'jquery';
import { Device } from '@twilio/voice-sdk';

$(function() {
  const speakerDevices = document.getElementById('speaker-devices');
  const muteButton = document.getElementById('mute-devices');
  const unmuteButton = document.getElementById('unmute-devices');
  const ringtoneDevices = document.getElementById('ringtone-devices');
  const outputVolumeBar = document.getElementById('output-volume');
  const inputVolumeBar = document.getElementById('input-volume');
  const volumeIndicators = document.getElementById('volume-indicators');
  const callButton = document.getElementById('button-call');
  const outgoingCallHangupButton = document.getElementById(
    'button-hangup-outgoing',
  );
  const getAudioDevicesButton = document.getElementById('get-devices');
  // const startupButton = document.getElementById('startup-button');

  const inputButton = document.getElementById('input-devices');
  const outputButton = document.getElementById('output-devices');

  var device;
  var call;
  var calledAPI = false;
  var token = getSecureSessionData('twilioToken');

  // Event Listeners

  if (inputButton !== null) {
    inputButton.onclick = async e => {
      e.preventDefault();
      const selectDevice = document.getElementById('input-select-devices')
        .value;
      await device.audio.setInputDevice(selectDevice);

      addDeviceListeners(device);
      // });
    };
  }

  if (outputButton !== null) {
    outputButton.onclick = e => {
      e.preventDefault();
      updateOutputDevice();
    };
  }

  callButton.onclick = e => {
    e.preventDefault();
    startupClient();
  };

  muteButton.onclick = e => {
    e.preventDefault();
    call.mute();
  };
  unmuteButton.onclick = e => {
    e.preventDefault();
    call.mute(false);
  };

  outgoingCallHangupButton.onclick = () => {
    log('Hanging up ...');
    call.disconnect();
    calledAPI = false;
  };

  getAudioDevicesButton.onclick = getAudioDevices;
  speakerDevices.addEventListener('change', updateOutputDevice);
  ringtoneDevices.addEventListener('change', updateRingtoneDevice);

  // SETUP STEP 2: Request an Access Token
  async function startupClient() {
    log('Requesting Access Token...');
    intitializeDevice();
  }

  // SETUP STEP 3:
  // Instantiate a new Twilio.Device
  function intitializeDevice() {
    log('Initializing device');
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
  }

  // SETUP STEP 4:
  // Listen for Twilio.Device states
  function addDeviceListeners(device) {
    makeOutgoingCall();
    device.on('registered', function() {
      log('Twilio.Device Ready to make and receive calls!');
    });

    device.on('error', function(error) {
      log('Twilio.Device Error: ' + error.message);
    });

    device.on('incoming', handleIncomingCall);

    device.audio.on('deviceChange', updateAllAudioDevices.bind(device));
  }

  // MAKE AN OUTGOING CALL

  async function makeOutgoingCall() {
    if (!calledAPI) {
      calledAPI = true;
      const userData = JSON.parse(getSecureSessionData('UserData'));
      const userRole = getSecureSessionData('role');
      var params = {
        // get the phone number to call from the DOM
        To: `${userData.meetingData.id}-${userRole}`,
      };

      if (device) {
        log(`Attempting to call ${params.To} ...`);

        // Twilio.Device.connect() returns a Call object
        call = await device.connect({
          params,
          disableAudioContextSounds: true,
        });

        // add listeners to the Call
        // "accepted" means the call has finished connecting and the state is now "open"
        // call.on('accept', alert('accepted'));
        setSecureSessionData('isTwilioCallStarted', 'true');
        call.on('accept', muteUser);
        // call.on('answered', alert('connected......'));
        // call.on('cancel', updateUIDisconnectedOutgoingCall);

        outgoingCallHangupButton.onclick = () => {
          log('Hanging up ...');
          call.disconnect();
          calledAPI = false;
        };
      } else {
        log('Unable to make call.');
      }
    }
  }

  function muteUser() {
    call.mute();
  }

  // HANDLE INCOMING CALL

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

  async function getAudioDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    updateAllAudioDevices.bind(device);
  }

  function updateAllAudioDevices() {
    if (device) {
      // updateDevices(speakerDevices, device.audio.speakerDevices.get());
      // updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
    }
  }

  async function updateOutputDevice() {
    const selectedDevices = document.getElementById('output-select-devices')
      .value;

    await device.audio.speakerDevices.set([selectedDevices]);
  }

  function updateRingtoneDevice() {
    const selectedDevices = Array.from(ringtoneDevices.children)
      .filter(node => node.selected)
      .map(node => node.getAttribute('data-id'));

    device.audio.ringtoneDevices.set(selectedDevices);
  }

  function bindVolumeIndicators(call) {
    call.on('volume', function(inputVolume, outputVolume) {
      var inputColor = 'red';
      if (inputVolume < 0.5) {
        inputColor = 'green';
      } else if (inputVolume < 0.75) {
        inputColor = 'yellow';
      }

      inputVolumeBar.style.width = Math.floor(inputVolume * 300) + 'px';
      inputVolumeBar.style.background = inputColor;

      var outputColor = 'red';
      if (outputVolume < 0.5) {
        outputColor = 'green';
      } else if (outputVolume < 0.75) {
        outputColor = 'yellow';
      }

      outputVolumeBar.style.width = Math.floor(outputVolume * 300) + 'px';
      outputVolumeBar.style.background = outputColor;
    });
  }
});
