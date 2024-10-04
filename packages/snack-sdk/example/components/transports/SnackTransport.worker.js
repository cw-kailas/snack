// Web-worker postMessage has a different signature
function postMessage(message, transfer){
    self.postMessage(message, transfer);
}

// @ts-ignore
self.window = self; // Needed for pubnub to work

const { createTransport } = require('snack-sdk');

let transport = undefined;
const transportCallback = (event) => postMessage(event);

onmessage = (event) => {
  if (event.data.type === 'init') {
    transport = createTransport(event.data.data);
    transport.addEventListener('message', transportCallback);
  } else if (transport) {
    const message = event.data;
    transport.postMessage(message);
    if (message.type === 'stop') {
      transport.removeEventListener('message', transportCallback);
      transport = undefined;
      close();
    }
  }
};
