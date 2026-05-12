import { LightningElement, wire } from 'lwc';
import getAccList from '@salesforce/apex/AccountController.getAccList';

export default class ApexWireDemo extends LightningElement {

    accountList;

    @wire(getAccList)
    wiredAccounts;

    @wire(getAccList)
    accountsHandler({data, error}){
        if(data){
            console.log('data', data);
            this.accountList = data.map( item => {
                return{ ...item}
            });
        }
        if(error){
            console.log('error', error);
        }
    }

}