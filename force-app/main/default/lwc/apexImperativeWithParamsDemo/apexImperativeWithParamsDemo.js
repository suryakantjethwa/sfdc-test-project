import { LightningElement } from 'lwc';
import findAccList from '@salesforce/apex/AccountController.findAccList';

export default class ApexImperativeWithParamsDemo extends LightningElement {

    searchKey = '';
    accounts;
    timer;
    searchHandler(event){
        window.clearTimeout(this.timer);
        this.searchKey = event.target.value;
        this.timer = setTimeout( () => {
            this.callApex();
        }, 1000)

    }

    callApex(){
        findAccList({keyword:this.searchKey}).then(result => {
            this.accounts = result;
        }).catch( error => {
            console.log(error);
        })
    }

}