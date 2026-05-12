global class batchClassForUserData implements Database.Batchable<User__c>{


     global Iterable<User__c> start( Database.BatchableContext BC){
        List<User__c> userList = new List<User__c>();
        return userList;
     }

     global void execute(Database.BatchableContext BC, List<User__c> users ){
        List<User__c> usersToInsert = new List<User__c>();
        for(Integer i = 0; i < 1000 ; i++){
            User__c u = new User__c();
            u.Name = 'Test User ' + i;
            u.Last_Name__c = 'TestLastName-' + i;
            u.First_Name__c = 'TestFirstName-' + i;
            u.Revenue__c = 6000;
            u.Deals__c = 55;
            usersToInsert.add(u);
        }
        Database.insert(usersToInsert);
     }

     global void finish(Database.BatchableContext BC){
          system.debug('Job id ');
     }



}