import {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {Service} from 'react-native-ble-plx';
import {ServiceCard} from '../components/ServiceCard';
import {RootStackParamList} from '../navigation';
import {Button} from '../components/Button';

const DeviceScreen = ({
  route,
  navigation,
}: StackScreenProps<RootStackParamList, 'Device'>) => {
  const {device} = route.params;

  const [isConnected, setIsConnected] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  const disconnectDevice = useCallback(async () => {
    navigation.goBack();
    const isDeviceConnected = await device.isConnected();
    if (isDeviceConnected) {
      await device.cancelConnection();
    }
  }, [device, navigation]);

  useEffect(() => {
    const getInfoDevice = async () => {
      const connectedDevice = await device.connect();
      setIsConnected(true);

      const allServicesAndCharacteristics =
        await connectedDevice.discoverAllServicesAndCharacteristics();
      const discoveredServices = await allServicesAndCharacteristics.services();
      setServices(discoveredServices);
    };

    getInfoDevice();

    device.onDisconnected(() => {
      navigation.navigate('Home');
    });

    return () => {
      disconnectDevice();
    };
  }, [device, disconnectDevice, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Button
          label="Disconnect"
          onPress={disconnectDevice}
          style={styles.disconnectButton}
        />
        <View>
          <View style={styles.header}>
            <Text>{`Id : ${device.id}`}</Text>
            <Text>{`Name : ${device.name}`}</Text>
            <Text>{`Is connected : ${isConnected}`}</Text>
            <Text>{`RSSI : ${device.rssi}`}</Text>
            <Text>{`Manufacturer : ${device.manufacturerData}`}</Text>
            <Text>{`ServiceData : ${device.serviceData}`}</Text>
            <Text>{`UUIDS : ${device.serviceUUIDs}`}</Text>
          </View>
          {services &&
            services.map(service => (
              <ServiceCard service={service} key={service.id} />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20,
  },
  header: {
    backgroundColor: 'teal',
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
    padding: 12,
  },
  disconnectButton: {
    backgroundColor: 'red',
    marginBottom: 16,
  },
});

export {DeviceScreen};
