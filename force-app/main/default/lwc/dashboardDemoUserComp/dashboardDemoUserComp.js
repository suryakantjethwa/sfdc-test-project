import { LightningElement, wire } from 'lwc';
import getUserList from '@salesforce/apex/dashboardController.getUserList';
import USER_OBJECT from '@salesforce/schema/User__c';
import FirstName from '@salesforce/schema/Contact.FirstName';


export default class DashboardDemoUserComp extends LightningElement {

    users = []

    @wire(getUserList)
    wiredUsers({error, data}){
        if(data){
            this.users = data.map( user => {
                return {
                    Id: user.Id,
                    FirstName: user.First_Name__c,
                    LastName: user.Last_Name__c,
                    ProfileImage: this.extractImageURL(user.Profile_Image__c),
                    Revenue: user.Revenue__c,
                    Deal: user.Deals__c
                };
            });
        }else if(error){
            console.log('Error : ===> ', error);
        }
    }


    extractImageURL(richTextArea){
        const parser = new DOMParser();
        const doc = parser.parseFromString(richTextArea, 'text/html');
        const imageElement = doc.querySelector('img');
        return imageElement ? imageElement.src : null;
    }

}