public with sharing class dashboardController {

    @AuraEnabled(cacheable=true)
    public static List<User__c> getUserList(){
        return [select Id,Name, First_Name__c,Last_Name__c,Profile_Image__c,Revenue__c,Deals__c from User__c order by CreatedDate desc limit 5];
    }

}