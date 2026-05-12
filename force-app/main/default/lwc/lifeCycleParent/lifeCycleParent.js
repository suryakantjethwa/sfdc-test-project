import { LightningElement } from 'lwc';

export default class LifeCycleParent extends LightningElement {

    isChildVisible = false;

    constructor(){
        super();
        console.log("Parent LifeCycleParent constructor");
    }

    connectedCallback(){
        console.log("Parent LifeCycleParent connectedCallback");
    }

    renderedCallback(){
        console.log("Parent LifeCycleParent renderedCallback");
    }

    name = "Bob";
    changeHandler(event){
      this.name = event.target.value;
    }
    handleClick(){
        this.isChildVisible = true;
    }

    handleClick2(){
        this.isChildVisible = false;
    }

    errorCallback(error, stack){
        console.log("Parent errorCallback");
        console.log(error.message);
        console.log(stack);
    }
}