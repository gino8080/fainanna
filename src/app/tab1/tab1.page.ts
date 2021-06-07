import { Component } from '@angular/core';
import {
  BleClient,
  numberToUUID,
  ScanResult,
  numbersToDataView,
} from '@capacitor-community/bluetooth-le';
import { sortby } from 'lodash';

const UUID_SERVICE = '00001101-0000-1000-8000-00805F9B34FB'.toLowerCase();
const UUID_FLN = '0000ffe0-0000-1000-8000-00805f9b34fb';
const FLN_DEVICE_HMAC = '';

const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_MEASUREMENT_CHARACTERISTIC =
  '00002a37-0000-1000-8000-00805f9b34fb';
const BODY_SENSOR_LOCATION_CHARACTERISTIC =
  '00002a38-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE = numberToUUID(0x180f);
const BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
const POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
const POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';

interface Device extends ScanResult {
  data: any;
}
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  public devices: Device[] = [];

  public logs: string[] = [];

  public device: Device;
  constructor() {}

  get deviceLogs() {
    return this.logs;
  }

  // checkData() {
  //   this.bluetoothSerial.subscribeRawData().subscribe((res) => {
  //     this.bluetoothSerial.read().then((data) => {
  //       console.log('checkData:' + data);
  //     });
  //   });
  // }

  vibration(enable) {
    const data = enable ? 'FLN_CMD {VON}' : 'FLN_CMD {VOFF}';
    console.log('🚀 ~ vibration ~ data', data);
  }

  async requestLEScan(): Promise<void> {
    console.log('requestLEScan');
    try {
      this.devices = [];
      await BleClient.initialize();

      await BleClient.requestLEScan(
        {
          //services: [UUID_SERVICE],
        },
        (result) => {
          console.log('received new scan result', result);
          //alert(JSON.stringify(result, null, 2));
          this.devices.push(result as Device);
        }
      );

      setTimeout(async () => {
        await BleClient.stopLEScan();
        console.log('stopped scanning');
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }

  async requestDevice(): Promise<void> {
    console.log('requestDevice');
    try {
      await BleClient.initialize();
      const device = await BleClient.requestDevice({
        services: [UUID_FLN],
        namePrefix: 'SH-HC',

        //services: [UUID_SERVICE],
        // optionalServices: [BATTERY_SERVICE, POLAR_PMD_SERVICE],

        //name:
      });
      alert(JSON.stringify(device, null, 2));

      await BleClient.connect(device.deviceId).then((connected) => {
        alert('connected to ' + device.name);
      });

      //await BleClient.read(device.deviceId)

      // const result = await BleClient.read(
      //   device.deviceId,
      //   HEART_RATE_SERVICE,
      //   BODY_SENSOR_LOCATION_CHARACTERISTIC
      // );
      // console.log('body sensor location', result.getUint8(0));

      // const battery = await BleClient.read(
      //   device.deviceId,
      //   BATTERY_SERVICE,
      //   BATTERY_CHARACTERISTIC
      // );
      // console.log('battery level', battery.getUint8(0));

      // await BleClient.write(
      //   device.deviceId,
      //   POLAR_PMD_SERVICE,
      //   POLAR_PMD_CONTROL_POINT,
      //   numbersToDataView([1, 0])
      // );
      // console.log('written [1, 0] to control point');

      await BleClient.startNotifications(
        device.deviceId,
        UUID_FLN,
        UUID_FLN,
        (value) => {
          console.log('current heart rate', value);
        }
      );

      // setTimeout(async () => {
      //   await BleClient.stopNotifications(
      //     device.deviceId,
      //     HEART_RATE_SERVICE,
      //     HEART_RATE_MEASUREMENT_CHARACTERISTIC
      //   );
      //   await BleClient.disconnect(device.deviceId);
      //   console.log('disconnected from device', device);
      // }, 10000);
    } catch (error) {
      console.error(error);
    }
  }

  async connect(device: Device): Promise<void> {
    console.log('connect DEVICE', device);
    debugger;
    const deviceId = device.device.deviceId;
    try {
      await BleClient.disconnect(deviceId);
      await BleClient.connect(deviceId);
      console.log('connected to device', device);
      this.device = device;
      // const result = await BleClient.read(
      //   device.deviceId,
      //   HEART_RATE_SERVICE,
      //   BODY_SENSOR_LOCATION_CHARACTERISTIC,
      // );
      // console.log('body sensor location', result.getUint8(0));
    } catch (error) {
      console.error(error);
    }
  }

  async disconnect(): Promise<void> {
    console.log('connect', this.device);

    try {
      await BleClient.disconnect(this.device.device.deviceId);

      console.log('disconnected to device', this.device);
    } catch (error) {
      console.error(error);
    }
  }
  get deviceList() {
    const devices = this.devices.map((device) => {
      device.data = JSON.stringify(device.manufacturerData);
      return device;
    });
    //console.log('🚀 ~ devices ~ devices', devices);
    return devices;
    //return sortby(devices, ['rssi']);
  }
}
