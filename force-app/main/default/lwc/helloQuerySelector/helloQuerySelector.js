import { LightningElement } from 'lwc';

export default class HelloQuerySelector extends LightningElement {

    usernames = [
        'John',
        'Mary',
        'Bob'
    ];

    fetchDetailHandler(){
        const ele = this.template.querySelector('h1');
        ele.style.border = "1px solid red";
        console.log(ele.innerText);
        const userEle = this.template.querySelectorAll('.name');
        Array.from(userEle).forEach(element => {
            console.log(element.innerText);
            element.setAttribute("title", element.innerText)
        });
        console.log('All user elements ---->', userEle);
    
        //lwc:manual demo
        const childEle = this.template.querySelector('.child');
        console.log('Child element ----> ',childEle);
        childEle.innerHtML = '<p>Child Element</p>';
    }



}