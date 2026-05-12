public with sharing class accountInsert {
    public accountInsert() {

    }

    @AuraEnabled
    public static void insertAcc(account acc){
        // return [select id,name,site from account where id=:acc.id];
        try{
            insert ACC;
        }catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }
    @AuraEnabled
    public static Account insertAccountMethod(Account accountObj){
        try {
            insert accountObj;
            return accountObj;
        } 
        catch (Exception exp) {
            throw new AuraHandledException(exp.getMessage());
        }
    }
}