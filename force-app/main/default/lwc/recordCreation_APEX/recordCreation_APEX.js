import { LightningElement, track } from 'lwc';
import insertAccountMethod from '@salesforce/apex/accountInsert.insertAccountMethod';
import accName from '@salesforce/schema/Account.Name';
import accNumberOfEmployees from '@salesforce/schema/Account.NumberOfEmployees';
import accIndustry from '@salesforce/schema/Account.Industry';
import accAnnualRevenue from '@salesforce/schema/Account.AnnualRevenue';
import accWebsite from '@salesforce/schema/Account.Website';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class RecordCreation_APEX extends LightningElement {

@track accountid;
@track error;
    @track  formFields = {
        Name:'',
        NumberOfEmployees:'',
        Industry:'',
        AnnualRevenue:'',
        Website:''
    };

    nameHandler(event){
        this.formFields.Name = event.target.value;
    }
    numberOfEmployeesHandler(event){
        this.formFields.NumberOfEmployees = event.target.value;
    }
    industryHandler(event){
        this.formFields.Industry = event.target.value;
    }
    annualRevenueHandler(event){
        this.formFields.AnnualRevenue = event.target.value;
    }
    websiteHandler(event){
        this.formFields.Website = event.target.value;
    }

    handleSaveAccount(event){
        //console.log('inside handleSaveAccount');
        //console.log('formFields =>'+JSON.stringify(this.formFields));
        insertAccountMethod({accountObj:this.formFields})
        .then(result =>{
          //  console.log('inside success..');
            this.formFields={};
            this.accountid = result.Id;
           // console.log('this.accountid =>'+this.accountid);
            const toastEvent = new ShowToastEvent({
                title:'Success!',
                message:'Account Created Successfully',
                variant: 'Success'
            });
            this.dispatchEvent(toastEvent);
        })
        .catch(error=>{
            this.error = error.message;
        });
    }
}

   /* @track error;
    @track  conFields = {
        FirstName:'',
        LastName:'',
        AccountId:'',
        Phone:'',
        Email:''
    };
    accountidHandler(event){
        this.conFields.AccountId = event.target.value;
    }
    firstnameHandler(event){
        this.conFields.FirstName = event.target.value;
    }
    lastnameHandler(event){
        this.conFields.LastName = event.target.value;
    }
    phoneHandler(event){
        this.conFields.Phone = event.target.value;
    }
    emailHandler(event){
        this.conFields.Email = event.target.value;
    }

    handleSaveAccount(event){
        //console.log('inside handleSaveAccount');
        //console.log('formFields =>'+JSON.stringify(this.formFields));
        insertContactMethod({contactObj:this.conFields})
        .then(contact =>{
          //  console.log('inside success..');
            this.conFields={};
            //this.accountid = result.Id;
           // console.log('this.accountid =>'+this.accountid);
            const toastEvent2 = new ShowToastEvent({
                title:'Success!',
                message:'Contact Created Successfully',
                variant: 'Success'
            });
            this.dispatchEvent(toastEvent2);
        })
        .catch(error=>{
            this.error = error.message;
        });
    }
}*/