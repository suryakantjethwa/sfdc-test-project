public class AuraDemoWrapper {
    
    public class WrapperTest{
        @auraEnabled
        public String mystr1{ get; set; }
        
        @auraEnabled
        public String mystr2{ get; set;}
    }
    
    @AuraEnabled
    public static List<Account> getAccounts(){
        List<Account> accList = [Select Id , Name from Account limit 100];
        return accList;
    }
    
    @AuraEnabled
    public static List<Contact> getContacts(Id recId){
        return [SELECT Id , FirstName, LastName , Email, Phone
                FROM Contact where AccountId =: recId];
    }

}