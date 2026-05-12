import { LightningElement, wire } from 'lwc';
import findAccList from '@salesforce/apex/AccountController.findAccList';

export default class BindWireMethodWithParam extends LightningElement {


    searchKey = '';

    @wire(findAccList,{keyword:'$searchKey'})
    accounts;

    handleOnChange(event){
       this.searchKey = event.target.value;
    }
  

}