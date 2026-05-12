import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import NAME_FIELD from '@salesforce/schema/Contact.Name';


export default class GetListUiDemo extends LightningElement {

    contacts=[]
    pageToken = null;
    nextPageToken = null;
    previousPageToken = null;
    @wire(getListUi, {
        objectApiName:CONTACT_OBJECT, 
        listViewApiName:'AllContacts',
        pageSize:10,
        sortBy: NAME_FIELD,
        pageToken:'$pageToken'
    })
    listViewHandler({data, error}){
       if(data){
            this.contacts=data.records.records;
            this.nextPageToken=data.records.nextPageToken;
            this.previousPageToken=data.records.previousPageToken;
            console.log(' Data test ----=+=----> ',data);
        }
        if(error){
            console.log(' Error test ----=+=---->',error);
        }
    }

    handlePreviousPage(){
        this.pageToken=this.previousPageToken;

    }

    handleNextPage(){
       this.pageToken=this.nextPageToken;
    }

}