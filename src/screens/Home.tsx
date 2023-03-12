import React, {useEffect, useReducer, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {DeviceCard} from '../components/DeviceCard';
import {BleManager, Device} from 'react-native-ble-plx';
import {theme} from '../theme';
import {Button} from '../components/Button';

const manager = new BleManager();

// Reducer to add only the devices which have not been added yet
// When the bleManager search for devices, each time it detect a ble device, it returns the ble device even if this one has already been returned
const reducer = (
  state: Device[],
  action: {type: 'ADD_DEVICE'; payload: Device} | {type: 'CLEAR'},
): Device[] => {
  switch (action.type) {
    case 'ADD_DEVICE':
      const {payload: device} = action;

      // check if the detected device is not already added to the list
      if (device && !state.find(dev => dev.id === device.id)) {
        return [...state, device];
      }
      return state;
    case 'CLEAR':
      return [];
    default:
      return state;
  }
};

const HomeScreen = () => {
  // reducer to store and display detected ble devices
  const [scannedDevices, dispatch] = useReducer(reducer, []);

  // state to give the user a feedback about the manager scanning devices
  const [isLoading, setIsLoading] = useState(false);

  const scanDevices = () => {
    // display the Activityindicator
    setIsLoading(true);

    // scan devices
    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.warn(error);
      }

      // if a device is detected add the device to the list by dispatching the action into the reducer
      if (scannedDevice) {
        dispatch({type: 'ADD_DEVICE', payload: scannedDevice});
      }
    });

    // stop scanning devices after 5 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsLoading(false);
    }, 5000);
  };

  const ListHeaderComponent = () => (
    <View style={styles.body}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Bluetooth Low Energy</Text>
      </View>
      <View style={styles.sectionContainer}>
        <Button
          label="Clear devices"
          onPress={() => dispatch({type: 'CLEAR'})}
          style={styles.clearButton}
        />
        {isLoading ? (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator color={'teal'} size={25} />
          </View>
        ) : (
          <Button
            label="Scan devices"
            onPress={scanDevices}
            style={styles.scanButton}
          />
        )}
      </View>
    </View>
  );

  useEffect(() => {
    return () => {
      manager.destroy();
    };
  }, []);
  return (
    <SafeAreaView style={styles.body}>
      <FlatList
        keyExtractor={item => item.id}
        data={scannedDevices}
        renderItem={({item}) => <DeviceCard device={item} />}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.red,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  content: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing * 2,
  },
  activityIndicatorContainer: {marginVertical: 6},
  clearButton: {
    backgroundColor: 'red',
    marginBottom: 8,
  },
  scanButton: {
    marginBottom: 16,
  },
});

export {HomeScreen};
