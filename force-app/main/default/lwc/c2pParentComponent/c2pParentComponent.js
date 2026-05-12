import { LightningElement } from 'lwc';

export default class C2pParentComponent extends LightningElement {
    msg = '';
    showModal = false;
    handleClick(){
        this.showModal = true;
    }

    closeHandler(event){
        console.log(event.detail.message);
        this.msg = event.detail.message;
        this.showModal = false;
    }
}