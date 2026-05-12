import { LightningElement, wire } from 'lwc';
import getAccList from '@salesforce/apex/AccountController.getAccList';

export default class BindWireWithProperty extends LightningElement {

    accounts
    @wire(getAccList)accounts;

}