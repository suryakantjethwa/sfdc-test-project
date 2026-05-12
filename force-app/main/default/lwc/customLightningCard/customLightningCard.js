import { LightningElement } from 'lwc';

export default class CustomLightningCard extends LightningElement {
    handleSlotFooterChange(){
        const footerEle = this.template.querySelector('footer');
        if(footerEle){
            footerEle.classList.remove('slds-hide');
        }
    }
}