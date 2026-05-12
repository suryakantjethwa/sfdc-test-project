import { LightningElement } from 'lwc';

export default class BindHtml extends LightningElement {

    myValue = 'World !';

    handleChange(event){
        this.myValue = event.target.value;
    }
    


}