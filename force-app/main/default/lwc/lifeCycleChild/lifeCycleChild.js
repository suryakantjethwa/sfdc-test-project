import { LightningElement } from 'lwc';

export default class LifeCycleChild extends LightningElement {
    constructor(){
        super();
        console.log("Child LifeCycleChild constructor");
    }

    connectedCallback(){
        console.log("Child LifeCycleChild connectedCallback");
        throw new Error("Child comp failed");
    }

    renderedCallback(){
        console.log("Child LifeCycleChild renderedCallback");
    }

    disconnectedCallback(){
        console.log("Child LifeCycleChild disconnectedCallback");
    }
}