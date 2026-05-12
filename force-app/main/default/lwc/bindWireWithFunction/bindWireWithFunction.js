import { LightningElement, wire } from 'lwc';
import getAccList from '@salesforce/apex/AccountController.getAccList';

export default class BindWireWithFunction extends LightningElement {

    accounts;
    error;

    @wire(getAccList)
    wiredAccounts({error, data}){
        if(data){
            console.log('data ===> ' , data);
            this.accounts = data;
            this.error = undefined;
        }else if(error){
            console.log('error ===> ' , error);
            this.error = error;
            this.accounts = undefined;
        }
    }
}