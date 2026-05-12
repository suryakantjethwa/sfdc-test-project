import { LightningElement } from 'lwc';

export default class ParentCompCustomP2cUsingApi extends LightningElement {

    percentage = 20;

    handleOnChange(event){
      this.percentage = event.target.value;
    }
}