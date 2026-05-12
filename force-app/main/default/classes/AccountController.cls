public with sharing class AccountController {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccList() {
        if (!Schema.sObjectType.Account.isAccessible()) {
            throw new AuraHandledException('You do not have permission to access Account records.');
        }
        return [SELECT Id, Name, Type, Industry, Phone FROM Account ORDER BY CreatedDate DESC LIMIT 10];
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> findAccList(String keyword) {
        try {
            if (String.isBlank(keyword)) {
                throw new AuraHandledException('Search keyword cannot be blank.');
            }
            String key = '%' + keyword + '%';
            return [SELECT Id, Name, Type, Industry, Phone FROM Account WHERE Name LIKE :key ORDER BY CreatedDate DESC LIMIT 10];
        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Account getSingleAccount() {
        try {
            if (!Schema.sObjectType.Account.isAccessible()) {
                throw new AuraHandledException('You do not have permission to access Account records.');
            }
            return [SELECT Id, Name, Phone FROM Account ORDER BY CreatedDate DESC LIMIT 1];
        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving Account: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountsByType(String type) {
        try {
            if (String.isBlank(type)) {
                throw new AuraHandledException('Account type cannot be blank.');
            }
            if (!Schema.sObjectType.Account.isAccessible()) {
                throw new AuraHandledException('You do not have permission to access Account records.');
            }
            return [SELECT Id, Name, Type, Industry, Phone FROM Account WHERE Type = :type ORDER BY CreatedDate DESC LIMIT 10];
        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving Accounts by type: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Account createAccount(String name, String type, String industry, String phone) {
        try {
            if (String.isBlank(name)) {
                throw new AuraHandledException('Account name is required.');
            }
            if (!Schema.sObjectType.Account.isCreateable()) {
                throw new AuraHandledException('You do not have permission to create Account records.');
            }
            Account acc = new Account(
                Name = name,
                Type = type,
                Industry = industry,
                Phone = phone
            );
            insert acc;
            return acc;
        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating Account: ' + e.getMessage());
        }
    }
}