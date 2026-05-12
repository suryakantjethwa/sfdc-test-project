import { LightningElement } from 'lwc';
import getAccList from '@salesforce/apex/AccountController.getAccList';

export default class ApexImperativeDemo extends LightningElement {

    accounts;
    handleClick(){
        getAccList().then( result => {
            console.log('result', result);
            this.accounts = result;
        }).catch(error => {
            console.log('error', error);
        })   
     }
}