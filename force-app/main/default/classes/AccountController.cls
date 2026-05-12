public with sharing class AccountController{


    @AuraEnabled(cacheable=true)
    public static List<Account> getAccList(){
        return [select Id,Name, Type, Industry from Account order by CreatedDate desc limit 5];
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> findAccList(String keyword){
        try {
            String key = '%'+keyword+'%';
            return [SELECT Id,Name,Type,Industry,Phone FROM Account WHERE Name LIKE:key ORDER BY CreatedDate desc LIMIT 10];
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
@AuraEnabled(cacheable=true)
public static Account getSingleAccount(){
    try {
        // Validate CRUD permission before SOQL operation
        if (!Schema.sObjectType.Account.isAccessible()) {
            throw new AuraHandledException('You do not have permission to access Account records.');
        }
        return [SELECT Id, Name, Phone FROM ACCOUNT ORDER BY CreatedDate desc Limit 1];
    } catch (AuraHandledException ahe) {
        throw ahe;
    } catch (Exception e) {
        throw new AuraHandledException('Error retrieving Account: ' + e.getMessage());
    }
}
    // Audit below method for null check and exception handling
    @AuraEnabled(cacheable=true)
    public static List<Account> c(String type){
        return [SELECT Id, Name, Type, Industry FROM ACCOUNT WHERE Type =:type ORDER BY CreatedDate desc Limit 5];

    }

}