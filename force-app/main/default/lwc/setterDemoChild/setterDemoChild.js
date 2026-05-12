import { LightningElement, api } from 'lwc';

export default class SetterDemoChild extends LightningElement {
   
    userDetails;

    @api get details(){
       return this.userDetails;
    };

    set details(data){
       let newAge = data.age * 2;

       this.userDetails = {...data, age: newAge, "Location": "San Francisco"};
    }
}