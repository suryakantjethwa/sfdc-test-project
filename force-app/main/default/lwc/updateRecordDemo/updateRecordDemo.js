import { LightningElement, wire } from 'lwc';
import { getListUi } from 'lightning/uiListApi';
import { updateRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';

const COLS = [
    {label : 'Id' , fieldName : 'Id' },
    {label : 'Name' , fieldName : 'Name'},
    {label : 'Title' , fieldName : 'Title'},
    {label : 'Phone' , fieldName : 'Phone' , type:'tel' , editable:true},
    {label : 'Email' , fieldName : 'Email', type:'email' , editable:true},
]

export default class UpdateRecordDemo extends LightningElement {

    contacts = []
    columns = COLS
    draftValues = []
    @wire(getListUi , {
        objectApiName:CONTACT_OBJECT,
        listViewApiName:'AllContacts',
    })listViewHandler({data, error}){
        if(data){
            console.log('list view data : ', data);
            this.contacts = data.records.records.map(item => {
                return{
                     "Id" : this.getValues(item, 'Id'),
                     "Name" : this.getValues(item, 'Name'),
                     "Title" : this.getValues(item, 'Title'),
                     "Phone" : this.getValues(item, 'Phone'),
                     "Email" : this.getValues(item, 'Email')
                }
            })
        }
        if(error){
            console.log('list view error : ', error);
        }
    }

    getValues(data, field){
       return data.fields[field].value
    }

    handleSave(event){
       console.log( JSON.stringify(event.detail.draftValues));
       const recordInputs = event.detail.draftValues.map( draft =>{
        const fields = {...draft}
        return {fields:fields}
       })

      const promises = recordInputs.map( recordInput => updateRecord(recordInput))

       Promise.all(promises).then( results => {
           // this.showToast('Success !!', `Contacts updated`);
            console.log('results - Contacts updated successfully : ', results);
            this.draftValues = [];
       }).catch(error => {
        console.log('error : ', error);
       })
       
    }   
}