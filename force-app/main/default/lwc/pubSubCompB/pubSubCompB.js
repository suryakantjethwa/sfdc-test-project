import { LightningElement } from 'lwc';
import pubSub from 'c/pubSub';

export default class PubSubCompB extends LightningElement {
    message = '';

    connectedCallback(){
        pubSub.subscribe('PubSubCompA', (message) => {
               this.message = message.message;
        });
    }
}