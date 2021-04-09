/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React, {useState, useEffect} from 'react';
 import {
   SafeAreaView,
   StatusBar,
   StyleSheet,
   useColorScheme,
   View,
   TextInput,
   Dimensions,
   TouchableHighlight,
   Linking,
   ToastAndroid,
   Platform,
   PermissionsAndroid,
   Alert,
 } from 'react-native';
 
 import {Colors} from 'react-native/Libraries/NewAppScreen';
 import Polyline from '@mapbox/polyline';
 import MapboxGL from '@react-native-mapbox-gl/maps';
 import Geolocation from 'react-native-geolocation-service';
 import Icon from 'react-native-vector-icons/FontAwesome';
 import Geocoder from 'react-native-geocoding';
 import appConfig from './app.json';
 import Spinner from 'react-native-loading-spinner-overlay';
 import {GOOGLE_API_KEY} from "@env";
 
 const accessToken =
   'pk.eyJ1IjoicGFxdWlubyIsImEiOiJja24xczMwZWswcHpmMm9xcGRkMGd2djd6In0.GIkgXgbG3qHd6Vwxfb_elw';
 
 MapboxGL.setAccessToken(accessToken);
 
 const App = () => {
   const isDarkMode = useColorScheme() === 'dark';
 
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };
 
   const [watchId, setWatchId] = useState(null);
   const [loading, setLoading] = useState(null);
   const [address, setAddress] = useState();
   const [route, setRoute] = useState(null);
   const [start, setStart] = useState(null);
   const [destination, setDestination] = useState(null);
 
   Geocoder.init(GOOGLE_API_KEY);
 
   useEffect(() => {
     getLocationUpdates();
 
     return () => {
       removeLocationUpdates();
     };
   }, []);
 
   const hasLocationPermissionIOS = async () => {
     const openSetting = () => {
       Linking.openSettings().catch(() => {
         Alert.alert('Unable to open settings');
       });
     };
     const status = await Geolocation.requestAuthorization('whenInUse');
 
     if (status === 'granted') {
       return true;
     }
 
     if (status === 'denied') {
       Alert.alert('Location permission denied');
     }
 
     if (status === 'disabled') {
       Alert.alert(
         `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
         '',
         [
           {text: 'Go to Settings', onPress: openSetting},
           {text: "Don't Use Location", onPress: () => {}},
         ],
       );
     }
     return false;
   };
 
   const hasLocationPermission = async () => {
     if (Platform.OS === 'ios') {
       const hasPermission = await hasLocationPermissionIOS();
       return hasPermission;
     }
 
     if (Platform.OS === 'android' && Platform.Version < 23) {
       return true;
     }
 
     const hasPermission = await PermissionsAndroid.check(
       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
     );
 
     if (hasPermission) {
       return true;
     }
 
     const status = await PermissionsAndroid.request(
       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
     );
 
     if (status === PermissionsAndroid.RESULTS.GRANTED) {
       return true;
     }
 
     if (status === PermissionsAndroid.RESULTS.DENIED) {
       ToastAndroid.show(
         'Location permission denied by user.',
         ToastAndroid.LONG,
       );
     } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
       ToastAndroid.show(
         'Location permission revoked by user.',
         ToastAndroid.LONG,
       );
     }
 
     return false;
   };
 
   const getLocationUpdates = async () => {
     try {
       const hasPermission = await hasLocationPermission();
 
       if (!hasPermission) {
         return;
       }
 
       const geoId = Geolocation.watchPosition(
         position => {
           setStart([position.coords.latitude, position.coords.longitude]);
         },
         error => {
           console.log(error);
           Alert.alert("Failed to get current location")
         },
         {
           accuracy: {
             android: 'high',
             ios: 'best',
           },
           enableHighAccuracy: true,
           distanceFilter: 10,
           interval: 5000,
           fastestInterval: 2000,
           forceRequestLocation: true,
           showLocationDialog: true,
           useSignificantChanges: true,
         },
       );
       setWatchId(geoId);
     } catch (e) {
       Alert.alert(`Couldn't obtain the current location`);
     }
   };
 
   const removeLocationUpdates = () => {
     if (watchId !== null) {
       Geolocation.clearWatch(watchId);
       setWatchId(null);
     }
   };
 
   const onSubmit = async address => {
     setLoading(true);
     try {
       const json = await Geocoder.from(address);
       const location = json.results[0].geometry.location;
       setDestination([location.lat, location.lng]);
 
       await getDirections(start, [location.lat, location.lng]);
     } catch (error) {
       console.log(error);
       Alert.alert(`The address is invalid or a route cannot be obtained.`);
     }
     setLoading(false);
   };
 
   const getDirections = async (start, destination) => {
     try {
       let resp = await fetch(
         `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${destination}&key=${GOOGLE_API_KEY}`,
       );
       let respJson = await resp.json();
       let geoJson = Polyline.toGeoJSON(
         respJson.routes[0].overview_polyline.points,
       );
       setRoute(geoJson);
     } catch (error) {
       console.log(error);
       Alert.alert(`Route cannot be obtained.`);
     }
   };
 
   const renderAnnotations = () => {
     return (
       <>
         {start && (
           <MapboxGL.PointAnnotation
             key="pointAnnotation"
             id="pointAnnotation"
             coordinate={[start[1], start[0]]}>
             <View
               style={{
                 height: 30,
                 width: 30,
                 backgroundColor: '#0490E1',
                 borderRadius: 50,
                 borderColor: '#fff',
                 borderWidth: 3,
               }}
             />
           </MapboxGL.PointAnnotation>
         )}
         {destination && (
           <MapboxGL.PointAnnotation
             key="destinationPointAnnotation"
             id="destinationPointAnnotation"
             coordinate={[destination[1], destination[0]]}>
             <View
               style={{
                 height: 30,
                 width: 30,
                 backgroundColor: '#33eee4',
                 borderRadius: 50,
                 borderColor: '#fff',
                 borderWidth: 3,
               }}
             />
           </MapboxGL.PointAnnotation>
         )}
       </>
     );
   };
 
   return (
     <SafeAreaView style={backgroundStyle}>
       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
       <View
         style={{
           backgroundColor: isDarkMode ? Colors.black : Colors.white,
         }}>
         <View style={styles.container}>
           <View style={{flexDirection: 'row'}}>
             <TextInput
               style={styles.input}
               value={address}
               onChangeText={setAddress}
               placeholder="Search"
               autoCompleteType="street-address"
               dataDetectorTypes="address"
             />
             <TouchableHighlight
               style={{alignItems: 'center', justifyContent: 'center'}}
               onPress={() => onSubmit(address)}
               disabled={loading}>
               <View>
                 <Icon name="search" size={20} color="#4285F4" />
               </View>
             </TouchableHighlight>
           </View>
           <View style={styles.mapContainer}>
             <Spinner
               visible={loading}
               textContent={'Loading...'}
               textStyle={styles.spinnerTextStyle}
             />
             {start && (
               <MapboxGL.MapView
                 style={styles.map}
                 zoomLevel={15}
                 centerCoordinate={[start[1], start[0]]}
                 showUserLocation={true}
                 zoomEnabled>
                 <MapboxGL.Camera
                   zoomLevel={15}
                   centerCoordinate={[start[1], start[0]]}
                   animationMode={'flyTo'}
                   animationDuration={0}></MapboxGL.Camera>
                 {renderAnnotations()}
                 {route && (
                   <MapboxGL.ShapeSource id="shapeSource" shape={route}>
                     <MapboxGL.LineLayer
                       id="lineLayer"
                       style={{
                         lineWidth: 5,
                         lineJoin: 'bevel',
                         lineColor: '#000000',
                       }}
                     />
                   </MapboxGL.ShapeSource>
                 )}
               </MapboxGL.MapView>
             )}
           </View>
         </View>
       </View>
     </SafeAreaView>
   );
 };
 
 const styles = StyleSheet.create({
   container: {
     margin: 10,
     alignItems: 'stretch',
     flexDirection: 'column',
   },
   mapContainer: {
     height: Dimensions.get('window').height,
   },
   loading: {
     flex: 1,
   },
   map: {
     flex: 1,
   },
   input: {
     height: 40,
     margin: 8,
     borderWidth: 1,
     borderRadius: 35,
     borderColor: '#EEEEEE',
     flex: 1,
     paddingLeft: 10,
   },
   spinnerTextStyle: {
     color: '#FFF',
   },
 });
 
 export default App; 