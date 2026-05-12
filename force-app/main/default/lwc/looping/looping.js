import { LightningElement } from 'lwc';

export default class Looping extends LightningElement {


    carList = ["Ford", "Chevy", "Honda", "BMW"];
    
    ceoList = [
        {
            id : 1,
            name : "Steve",
            company : "Apple"
        },{
            id : 2,
            name : "Bill",
            company : "Microsoft"
        },{ 
            id : 3,
            name : "Mark",
            company : "Google"
        }
    ];




}