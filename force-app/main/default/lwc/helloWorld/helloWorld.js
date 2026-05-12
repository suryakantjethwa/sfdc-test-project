import { LightningElement, track } from 'lwc';

export default class HelloWorld extends LightningElement {


    fullname = "Salesforce india";

    handleNameChange(event){
       this.fullname = event.target.value;
    }
    
    @track address = {city : "Pune", state : "Maharashtra", country : "India"};


    trackHandler(event){
        this.address.city = event.target.value;
        //User the below code in case you want to update the address object without using the track decorator
       // this.address = {...this.address, "city" : event.target.value};
    }



    //Getter example

    users = ["John", "Smith", "Jones"];
    num1 = 10;
    num2 = 20;


    /**
     * The reason for using getters intead of directly storing the first user in variable 
    and using it in the template is that the users array can be updated and the template will automatically get updated. 
    **/
    get firstUser(){
        return this.users[0];
    }

    get sum(){
        return this.num1 + this.num2;
    }




}