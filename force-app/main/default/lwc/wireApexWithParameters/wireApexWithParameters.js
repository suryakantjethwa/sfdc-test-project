import { LightningElement, wire } from 'lwc';
import filterAccountType from '@salesforce/apex/AccountController.filterAccountType';
export default class WireApexWithParameters extends LightningElement {
    
    selectedType='';
    @wire(filterAccountType, { type: '$selectedType' })
    filteredAccounts


    get getTypeOptions(){
        return [
            { label: 'Customer - Channel', value: 'Customer - Channel' },
            { label: 'Customer - Direct', value: 'Customer - Direct' }
        ];
    }

    typeHandler(event){
        this.selectedType = event.detail.value;

    }

}