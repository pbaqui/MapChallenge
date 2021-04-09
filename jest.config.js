module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect','@react-native-mapbox-gl/maps/setup-jest','react-native-geolocation-service'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native"
      + "|@react-native"
      + "|@mapbox/mapbox-sdk"
      + "|@react-native-community/geolocation"
      + "|@mapbox/polyline"
      + "|@react-native-mapbox-gl/maps"
      + "|react-native-dotenv"
      + "|react-native-geocoding"
      + "|react-native-geolocation-service"
      + "|react-native-loading-spinner-overlay"
      + "|react-native-vector-icons"
    + ")/)",
  ],
};