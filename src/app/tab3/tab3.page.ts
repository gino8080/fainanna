import { Component, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';

const FLN_DEVICE_ID = 'CD8D7F94-2B5C-6F90-0614-6730F4175759';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  providers: [BLE]
})

export class Tab3Page {

  device: any;
  services: string[];
  characteristics: Characteristic[];
  logs: string[] = ['START'];

  constructor(private zone: NgZone, private ble: BLE) { }

  scan = async () => {
    try {
      this.ble.disconnect(this.device.id);
    } catch (e) {
      console.warn(e);
    }
    this.ble.scan([], 5).subscribe((device) => {


      if (device.name === 'SH-HC-08') {
        console.log(JSON.stringify(device, null, 4));
        this.device = device;
        this.ble.connect(device.id).subscribe(
          connected => {
            this.logData('connected');

            console.log('🚀 ~ this.ble.connect ~ connected', connected);


            this.services = connected.services;
            this.characteristics = connected.characteristics;
            console.log('  this.characteristics', this.characteristics);
            const serviceNotify = this.characteristics.find(char => char.properties.includes('Notify'));
            console.log('🚀 ~ this.ble.scan ~ serviceNotify', serviceNotify);
            this.startNotification(serviceNotify);
          },
          err => {
            console.error(err);
          });

      }
    }, (error) => console.log(error));
  };


  startNotification = (char: Characteristic) => {
    console.log('🚀 ~ startNotification', char);
    this.logData('startNotification');
    let newMessage = '';
    this.ble.startNotification(
      this.device.id,
      char.service,
      char.characteristic).subscribe(buffer => {
        const data = this.bytesToString(buffer);
        //console.log('🚀 ~ buffer', { buffer, data: data[0] });
        newMessage += data;
        //console.log('bytesToString', newMessage);
        if (data.includes('}')) {

          this.logData(newMessage);

          console.log('this.logs', newMessage);
          newMessage = '';
        }
      });

  };

  get logList() {
    return this.logs;
  }

  logData(data: string) {
    this.zone.run(() => {
      this.logs.push(data.trim());
    });
  }

  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer[0]));
  }

  /*
int bytesAvailable = inputStream.available();
                                if (bytesAvailable>0) {
                                    bluetooth_timer = 0;
                                    isBtConnected = true;
                                    byte[] packetBytes = new byte[bytesAvailable];
                                    inputStream.read(packetBytes);
                                    for(int i=0;i<bytesAvailable;i++) {
                                        byte b = packetBytes[i];
                                        if (b == delimiter) {
                                            byte[] encodedBytes = new byte[i];
                                            System.arraycopy(packetBytes, 0, encodedBytes, 0, encodedBytes.length);
                                            data = new String(encodedBytes, "US-ASCII");
                                            i = bytesAvailable;
                                            dbDataHelper.insertNewData(name, data, "data", "device");
                                            runOnUiThread(new Runnable() {
          console.log("🚀 ~ newMessage", newMessage)
          console.log("🚀 ~ newMessage", newMessage)
                                                    @Override
                                                    public void run() {
                                                        UpdateUnsentMessages();
                                                        UpdateWeight();
                                                    }
                                                });
                                        }
                                    }
                                }
 */
}




interface Characteristic {
  properties: string[];
  isNotifying: boolean;
  characteristic: string;
  service: string;
}
