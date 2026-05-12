import { LightningElement } from 'lwc';

export default class BindExpressionsFromJs extends LightningElement {

    fullName = '';
    email = '';
    phone = 23123;



    handleChange(event){
        
        const field = event.target.name;
        console.log('field :' , field);
        if(field == 'fullName'){
          this.fullName = event.target.value;
                }
        if(field == "email"){
          this.email = event.target.value;
        }
        if(field == "phone"){
          this.phone = event.target.value;
        }
    }



}