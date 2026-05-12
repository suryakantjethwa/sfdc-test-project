import { LightningElement } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class Notifications extends LightningElement {
    toastHandler(){
      const evt =  new ShowToastEvent({
            title: 'Account created !',
            message: 'This is a toast message from LWC',
            variant:'success'
        });

        this.dispatchEvent(evt);
    }

    toastHandler2(){
        const evt =  new ShowToastEvent({
              title: 'Error Occured',
              message: 'This is a toast message from LWC',
              variant:'Error'
          });
  
          this.dispatchEvent(evt);
      }
}