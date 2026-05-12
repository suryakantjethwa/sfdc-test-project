import { LightningElement } from 'lwc';
import pubSub from 'c/pubSub';

export default class PubSubCompA extends LightningElement {
    message = '';

    changeHandler(event){
      this.message = event.target.value;
    }

    publishData(){
        pubSub.publish('PubSubCompA', {message: this.message});
    }
}