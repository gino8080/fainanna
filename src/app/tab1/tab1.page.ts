import { Component } from '@angular/core';
import {
  BleClient,
  numberToUUID,
  ScanResult,
} from '@capacitor-community/bluetooth-le';
import { sortby } from 'lodash';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

const UUID_SERVICE = '00001101-0000-1000-8000-00805F9B34FB'.toLowerCase();
const FLN_DEVICE_HMAC = '';
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

  constructor(private bluetoothSerial: BluetoothSerial) { }

  get deviceLogs() {
    return this.logs;
  }
  async connect() {
    this.logs = [];
    this.bluetoothSerial.connect(FLN_DEVICE_HMAC).subscribe(
      (connected) => {
        console.log('🚀 ~ this.bluetoothSerial.connect ~ connected', connected);
        this.logs.push('connected to ' + connected);
        //this.checkData();
        this.bluetoothSerial.subscribe('\n').subscribe(
          (data) => {
            console.log('🚀 ~ data', data);
            this.logs.push(data);
          },
          (err) => {
            console.error(err);
          }
        );
      },
      (err) => {
        console.error(err);
      }
    );
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
    this.bluetoothSerial
      .write(data)
      .then((success) => {
        console.log('🚀 ~ this.bluetoothSerial.write ~ ', data);
        this.logs.push(data);
      })
      .catch((err) => console.error(err));
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
        //services: [UUID_SERVICE],
        namePrefix: 'HC',
      });
      alert(JSON.stringify(device, null, 2));
      await BleClient.connect(device.deviceId).then((connected) => {
        alert('connected to ' + device.name);
      });

      //await BleClient.read(device.deviceId)
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
    return sortby(devices, ['rssi']);
  }
}
