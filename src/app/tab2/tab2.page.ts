import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  pairedList: PairedList;
  listToggle = false;
  pairedDeviceID = 0;
  dataSend = '';

  constructor(private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController) {
    this.checkBluetoothEnabled();
  }

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled().then(success => {
      this.handleData('isEnabled');
      this.listPairedDevices();
    }, error => {
      this.showError('Please Enable Bluetooth');
    });
  }

  listPairedDevices() {
    this.handleData('listPairedDevices');
    this.bluetoothSerial.list().then(success => {
      this.pairedList = success;
      this.handleData(JSON.stringify(success));
      this.listToggle = true;
    }, error => {
      this.showError('Please Enable Bluetooth');
      this.listToggle = false;
    });
  }

  selectDevice() {
    const connectedDevice = this.pairedList[this.pairedDeviceID];
    if (!connectedDevice.address) {
      this.showError('Select Paired Device to connect');
      return;
    }
    const address = connectedDevice.address;
    const name = connectedDevice.name;
    this.connection(address);
  }

  connection(address: string) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bluetoothSerial.connect(address).subscribe(success => {
      this.deviceConnected();
      this.showToast('Successfully Connected');
    }, error => {
      console.log('Connection Error' + error);
      this.showError('Error:Connecting to Device');
    });
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe('\n').subscribe(success => {
      this.handleData(success);
      this.showToast('Connected Successfullly');
    }, error => {
      this.showError(error);
    });
  }

  deviceDisconnected() {
    // Unsubscribe from data receiving
    this.bluetoothSerial.disconnect();
    this.showToast('Device Disconnected');
  }

  handleData(data) {
    console.log(data);
    this.showToast(data);
  }

  sendData() {
    this.dataSend += '\n';
    this.showToast(this.dataSend);
    this.bluetoothSerial.write(this.dataSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error);
    });
  }

  async showError(error) {
    const alert = await this.alertCtrl.create({
      message: 'Error',
      subHeader: error,
      buttons: ['Dismiss']
    });
    await alert.present();
  }

  async showToast(msj: string) {
    const toast = await this.toastCtrl.create({
      message: msj,
      duration: 1000
    });
    toast.present();
  }
}
interface PairedList {
  'class': number;
  'id': string;
  'address': string;
  'name': string;
}


