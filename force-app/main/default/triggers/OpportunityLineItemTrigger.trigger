trigger OpportunityLineItemTrigger on OpportunityLineItem (before insert) {

    if(Trigger.isInsert && Trigger.isBefore){
         try{
            set<Id> oppIds = new set<Id>();

            for(OpportunityLineItem oli : Trigger.new){
                oppIds.add(oli.OpportunityId); 
            }

            for(Id oppId : oppIds){
                Integer num = 1;
                for(OpportunityLineItem oli : Trigger.new){
                    if(oppId == oli.OpportunityId){
                         //Mark Olis numbers
                        oli.Serial_No__c = String.valueOf(num);
                        num++;
                    }
                }
            }
         }
         catch(Exception e){
           system.debug('Error has occurred ===> ' + e.getMessage() + 'Line number ====> ' + e.getLineNumber());
         }
    }

}