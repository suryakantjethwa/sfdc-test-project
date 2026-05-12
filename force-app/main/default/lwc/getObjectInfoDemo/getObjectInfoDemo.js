import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getObjectInfos } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';

export default class GetObjectInfoDemo extends LightningElement {
    defaultRecordTypeId;
    objectsInfos;

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountObjectInfo({ data, error }) {
        if (data) {
            this.defaultRecordTypeId = data.defaultRecordTypeId;
            console.log('Object Info:', data);
        }
        if (error) {
            console.error('Error fetching object info:', error);
        }
    }

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accObjectAsProperty


//For fetching details of multiple objects
    objectApiName = [ACCOUNT_OBJECT, OPPORTUNITY_OBJECT];
    @wire(getObjectInfos, { objectApiNames: '$objectApiName' })
    objectInfoAsFunction({ data, error }) {
        if (data) {
            console.log('Objects Info:', data);
            this.objectsInfos = data;
        }
        if (error) {
            console.error('Error fetching object info:', error);
        }
    }

    @wire(getObjectInfos, { objectApiNames: '$objectApiName' })
    objectInfoAsProperty;


}