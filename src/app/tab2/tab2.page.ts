import { Component } from '@angular/core';

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

  constructor(private alertCtrl: AlertController, private toastCtrl: ToastController) {
    //this.checkBluetoothEnabled();
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


