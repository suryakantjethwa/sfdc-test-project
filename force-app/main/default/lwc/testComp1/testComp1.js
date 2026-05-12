import { LightningElement, api } from 'lwc';

import {ShowToastEvent} from 'lightning/platformShowToastEvent'

export default class TestComp1 extends LightningElement {

    
    @api
    recordId;

    get acceptedFormats(){
        return ['.pdf', '.jpeg'];
    }

    handleUploadFinished(event){
        // Collecting files which are being uploaded
        const uploadedFiles = event.detail.files;

        let uploadedFileNames = '';

        for(let i = 0; i<uploadedFiles.length; i++){
            uploadedFileNames += uploadedFiles[i].name + ', ';
        }

        //to show uploaded file names to User
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: uploadedFiles.length+' Files Uploaded Successfully: '+ uploadedFileNames,
                variant: 'success',
            }),
        );
    }
}