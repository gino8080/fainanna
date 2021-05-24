import { Component } from '@angular/core';
import {
  BleClient,
  numberToUUID,
  ScanResult,
} from '@capacitor-community/bluetooth-le';
import { sortby } from 'lodash';
const UUID_SERVICE = '00001101-0000-1000-8000-00805F9B34FB'.toLowerCase();

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
  constructor() {}

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
      await BleClient.requestDevice({
        //services: [UUID_SERVICE],
      }).then((device) => {
        // alert(JSON.stringify(device, null, 2));
      });
    } catch (error) {
      console.error(error);
    }
  }

  get deviceList() {
    const devices = this.devices.map((device) => {
      device.data = JSON.stringify(device.manufacturerData);
      return device;
    });

    return sortby(devices, ['rssi']);
  }
}
