import { LightningElement } from 'lwc';
import findAccList from '@salesforce/apex/AccountController.findAccList'

export default class ParentCompWithChildNestingIteration extends LightningElement {

    myData;
    error;

    handleOnChange(event){
        const keyword = event.target.value;
        console.log('$$ Event -=>' , keyword);
        if(keyword != null && keyword.length > 0){
            
            findAccList({keyword}).then((result)=>{
                this.myData = result;
                this.error = undefined;
            }).catch((error)=>{
                this.error = error;
                this.myData = undefined;
            });
        }else{
            this.myData = undefined;
        }

    }



}