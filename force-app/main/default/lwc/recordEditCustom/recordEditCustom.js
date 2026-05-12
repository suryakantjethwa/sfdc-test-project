import { LightningElement } from 'lwc';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';


export default class RecordEditCustom extends LightningElement {

    objectName = ACCOUNT_OBJECT;
    inputValue;

    handleChange(event){
      this.inputValue = event.detail.value;
    }
    handleSubmit(event){
        event.preventDefault();
        const inputCmp = this.template.querySelector('lightning-input');
        const val = inputCmp.value;
        if(!val.includes('Australia')){
            inputCmp.setCustomValidity("The Account Name must include Australia !");
        }else{
            inputCmp.setCustomValidity("");
            const fields = event.detail.fields;
            fields.Name = val;
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        }

        inputCmp.reportValidity();

    }

    successHandler(event){

        const successEvent = new ShowToastEvent({
            title: "Account created",
            message: "Record Id : "+ event.detail.id ,
            variant: "success"
        });

        this.dispatchEvent(successEvent);
        
    }

    setCustomValidity(str){
        custom
    }

}