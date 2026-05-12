import { LightningElement, wire } from 'lwc';
import getAccList from '@salesforce/apex/AccountController.getAccList';

export default class BindImperativeMethod extends LightningElement {

    accounts;
    error;


    buttonClicked(){
        getAccList().then((result) => {
            this.accounts = result;
            this.error = undefined;

        }).catch((error)=> {
            this.error = error;
            this.accounts = undefined;
        })
      
    }
}