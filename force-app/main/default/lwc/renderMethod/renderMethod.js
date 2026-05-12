import { LightningElement } from 'lwc';
import signinTemplate from './signinTemplate.html';
import signupTempalte from './signupTemplate.html';
import renderTemplate from './renderMethod.html';

export default class RenderMethod extends LightningElement {

    selectedButton = '';
    render(){
        return this.selectedButton === 'signup'? signupTempalte :
              this.selectedButton ==='signin' ? signinTemplate : renderTemplate;
    }

    handleClick(event){
       this.selectedButton = event.target.label;
    }

    submitHandler(event){
        console.log(` ${event.target.label} successfully !!`);
    }
}