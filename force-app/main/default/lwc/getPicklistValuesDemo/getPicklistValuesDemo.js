import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class GetPicklistValuesDemo extends LightningElement {



    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo;
    
    @wire(getPicklistValues , {recordTypeId : '$objectInfo.data.defaultRecordTypeId', fieldApiName:INDUSTRY_FIELD})
    industryPickListVal({data, error}){
      if(data){
        console.log('Pick list value data : ========> ', data);
        this.industryOptions = [...this.generatePicklist(data)];
      }
      if(error){
        console.log('Error fetching picklist values:', error);
      }
    }


    selectedIndustry = '';

    industryOptions = [];

    generatePicklist(data){
      return data.values.map( item => ({label: item.label, value: item.value}));
      console.log('Generating picklist options');
    }

    
    handleChange(event) {
        this.selectedIndustry = event.detail.value;
    }

}