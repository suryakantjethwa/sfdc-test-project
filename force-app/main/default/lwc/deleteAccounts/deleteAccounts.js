import { LightningElement, wire } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex'; 
import {deleteRecord } from 'lightning/uiRecordApi';
import getAccList from '@salesforce/apex/AccountController.getAccList';



export default class DeleteAccounts extends LightningElement {

    accounts;

    error;

    wiredAccountResults;


    @wire(getAccList)
    wiredAccounts(result){
        this.wiredAccountResults =  result;
        if(result.data ){
            this.accounts = result.data;  
            this.error = undefined;
        }else if(result.error){
            this.error = result.error;
            this.accounts = undefined;
        }
    }


    deleteAccount(event){
        console.log('this dot record data set ---- > ');
       const recordId = event.target.dataset.recordid;

       console.log('this dot record data set ---- > ' , recordId);
       deleteRecord(recordId).then(()=>{
           this.dispatchEvent(
             new ShowToastEvent({
                title : 'Success',
                message : 'Account deleted',
                variant : 'Success'
             })

           );
        return refreshApex(this.wiredAccountResults);
       }).catch((error)=>{
           this.dispatchEvent(
               new ShowToastEvent({
                   title : 'Error occured',
                   message : 'Error Has occured',
                   variant : 'Deletion Fail ed'
               })
           );

       })
       
    }

                                      


}