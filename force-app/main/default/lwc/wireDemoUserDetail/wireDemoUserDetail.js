import { LightningElement, wire } from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/User.Name';
import EMAIL_FIELD from '@salesforce/schema/User.Email';

const fields = [NAME_FIELD, EMAIL_FIELD];


export default class WireDemoUserDetail extends LightningElement {
    userId = Id
    userDetails

    @wire(getRecord, {recordId: '$userId', fields: fields})
    userDetailHandler({data, error}){
        if(data){
          this.userDetails = data.fields;
        }
        if(error){
          console.log('This is an error: ', error);
        }
    }

    @wire(getRecord, {recordId: '$userId', fields: fields})
    userDetailsProperty



}