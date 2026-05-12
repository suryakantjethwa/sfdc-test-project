import { LightningElement } from 'lwc';

export default class C2pModalComponent extends LightningElement {

    closeModal(){
        const myEvent = new CustomEvent('close', {
            detail: {
                message: 'Modal closed successfully!!'
            }
        });
        this.dispatchEvent(myEvent);
    }
}