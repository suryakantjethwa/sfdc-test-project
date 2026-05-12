import { LightningElement } from 'lwc';

export default class ConditionalRenderingEx extends LightningElement {

    myValue = 'TestValue';
    isAvailable = false;

    handleChange(event){
      this.isAvailable = event.target.checked;
    }
}