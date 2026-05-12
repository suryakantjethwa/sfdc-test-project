import { LightningElement } from 'lwc';

export default class ParentComponentCommunication extends LightningElement {

    count = 1;
    handleEventChange(event){
      this.count = this.count + 1;
    }

}