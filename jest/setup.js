jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter.js', () => {
  const { EventEmitter } = require('events');
  return EventEmitter;
});

jest.mock('react-native-geolocation-service/js/Geolocation.native.js', () => {
  return {
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
    watchPosition: jest.fn(),
    requestAuthorization: jest.fn(),
  };
});

