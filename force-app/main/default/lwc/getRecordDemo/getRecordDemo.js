import { LightningElement,api,wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import OWNER_NAME_FIELD from '@salesforce/schema/Account.Owner.Name';
import ANNUAL_REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';

export default class GetRecordDemo extends LightningElement {

@api recordId
name
ownerName 
annualRevenue

connectedCallback(){
  console.log('Record Id ==> ', this.recordId);
}

@wire(getRecord , {recordId: '$recordId', fields: [NAME_FIELD,OWNER_NAME_FIELD,ANNUAL_REVENUE_FIELD]})
accountHandler({data}){
  console.log('Rec Id ==> ' , this.recordId);
  console.log('Account data : ========> ', data);
  if(data){

    this.name = getFieldValue(data, NAME_FIELD);
    this.ownerName = getFieldValue(data, OWNER_NAME_FIELD);
    this.annualRevenue = getFieldValue(data, ANNUAL_REVENUE_FIELD);

   /* this.name = data.fields.Name.displayValue ? data.fields.Name.displayValue : data.fields.Name.value;
    this.ownerName = data.fields.Owner.displayValue ? data.fields.Owner.displayValue : data.fields.Owner.value;
    this.annualRevenue = data.fields.AnnualRevenue.displayValue ? data.fields.AnnualRevenue.displayValue : data.fields.AnnualRevenue.value;
    this.accessKey = data.accessKey;
    */
  }
}

 

}