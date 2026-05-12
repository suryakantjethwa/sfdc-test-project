trigger AccountTrigger on Account (after Insert) {



}
/**
 * Trigger Scenario 1. 
 * Write a trigger on Account, when an account is inserted, automatically account billing address should populate into the account shipping address.
 * 
 * 
 *     if(Trigger.isInsert && Trigger.isBefore){

        try{
            for(Account acc : Trigger.New){
                if(acc.BillingStreet != null){
                    acc.ShippingStreet = acc.BillingStreet;
                }
                if(acc.BillingState != null){
                    acc.ShippingState = acc.BillingState;
                }
                if(acc.BillingCity != null){
                    acc.ShippingCity= acc.BillingCity;
                }
                if(acc.BillingPostalCode != null){
                    acc.ShippingPostalCode = acc.BillingPostalCode;
                }
                if(acc.BillingCountry != null){
                    acc.ShippingCountry = acc.BillingCountry;
                }
            }

        }catch(Exception e){
        system.debug('Error Occured : ' + e.getMessage() + 'Line number : ' + e.getLineNumber());
        }
    }
 */


 /**
  * Trigger Scenario 2.
  Write a trigger on the Account when the Account is updated check all opportunities related to the account. Update all Opportunities Stage to close lost if an opportunity created date is greater than 30 days from today and stage not equal to close won.
      if(Trigger.isAfter && Trigger.isUpdate){
         try{

            List<Opportunity> oppListToBeUpdated = new List<Opportunity>();
            Set<Id> accountIds = new Set<Id>();
            for(Account acc : Trigger.New){
                 //populate the accountIds 
                accountIds.add(acc.Id);
            }


            Datetime day30 = system.now() - 30;

        
            // Fetch the opportunity linked to the account
            List<Opportunity> oppList = [Select Id, StageName, CreatedDate ,Name from Opportunity where AccountId IN :accountIds];
            for(Opportunity o : oppList){
                    if(o.StageName != 'Closed Won' && o.CreatedDate < day30){

                     o.StageName = 'Closed Lost';
                                   
                }
                oppListToBeUpdated.add(o);
            }
 
            //Update the opportunity if not updated
            if(oppListToBeUpdated != null && oppListToBeUpdated.size() > 0){
                update oppListToBeUpdated;
            }

          
         }catch(Exception e){
           system.debug('Exception occured : ' + e.getMessage() + 'Line Number : '+ e.getLineNumber());
         }
    }
  */



  /**
   *Trigger Scenario 3. 
   Once an Account is inserted an email should go to the System Admin user with specified text below.
An account has been created and the name is “Account Name”.


    if(Trigger.isAfter && Trigger.isInsert){
    try{
    Set<String> accNames = new set<String>();
    for(Account acc : Trigger.New){
        accNames.add(acc.Name);
    }

    List<User> systemAdminUser = [SELECT Id,Profile.Name,Email from User where Profile.Name = 'System Administrator'];
    List<String> emailList  = new List<String>();
    for(User u : systemAdminUser){
        emailList.add(u.Email);
    }

    sendEmailToSystemAdmin(emailList, accNames);


    }catch(Exception e){
    System.debug('Exception occurred  :' + e.getMessage() + ' Line number :' + e.getLineNumber());
    }

    }

    public void sendEmailToSystemAdmin(List<String>  emailList, Set<String> accNames){
        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
        for(String accountName : accNames){
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setSenderDisplayName('Salesforce');
            mail.setUseSignature(False);
            mail.setBccSender(False);
            mail.setSaveAsActivity(False);
            //List<String> v1 = new String[]{emailList};
            mail.toaddresses = emailList;
            mail.setSubject('A new Account was created !!');
            String Body = 'An account has been created and the name of the Account is ' + accountName + ' .';
            mail.setHtmlBody(Body);
            mails.add(mail);
        }

        if(mails.size() > 0){
            Messaging.SendEmailResult[] results = Messaging.sendEmail(mails);
            if(results[0].success){
            system.debug('Email Sent successfully.');
            } else {
                system.debug('The error has occurred : ' + results[0].errors[0].message);
            }
        }
    }
   */


   /**
    * Trigger scenario 3. 
    Once an Account will update then that Account will update with the total
    amount from All its Opportunities on the Account Level. The account field 
    name would be ” Total Opportunity Amount “.


    Solution 1
    if(Trigger.isBefore && Trigger.isUpdate){
      try{ 
         set<Id> accIds = new Set<Id>();
         for(Account acc : Trigger.new){
            accIds.add(acc.Id);
         }

         List<Opportunity> oppList = [SELECT Id, Name, Amount ,AccountId FROM Opportunity where AccountId IN :accIds];
         for(Account a : Trigger.New){
            Double amt = 0;
             for( Opportunity opp : oppList){
                if(opp.AccountId == a.Id){
                     amt += opp.Amount;
                }
             }
             a.Total_Opportunity_Amount__c = amt;
             amt = 0;
         }
        
      }catch(Exception e){
           system.debug('Exception has occurrend : ' + e.getMessage() + ' Line number : ' + e.getLineNumber());
      }
    }


    Solution 2 
     if(Trigger.isBefore && Trigger.isUpdate){

        set<Id> accIds = new set<Id>();
        for(Account acc : Trigger.New){
             accIds.add(acc.Id);
        }
        
        Map<Id, Double> amountMap = new Map<Id, Double>();
        List<AggregateResult> results = [Select AccountId, SUM(Amount)TotalAmount FROM Opportunity where AccountId IN :accIds group by AccountId];
        if(results.size() > 0){
           for(AggregateResult ar : results){
                Id accountId = (Id)ar.get('AccountId');
                double totalAmount = (double)ar.get('TotalAmount');
                amountMap.put(accountId, totalAmount);
           }
        }
        for(Account acc : Trigger.New){
            acc.Total_Opportunity_Amount__c = amountMap.get(acc.Id);
        }
      }


    https://salesforcegeek.in/trigger-scenarios-in-salesforce-part-1/
    */



    /**
     * Trigger Scenario 3. 
     * Create a field on Account Named (Client Contact lookup to Contact). 
     * Once an Account is inserted a Contact will create with the name of 
     * the Account and that Contact will be the Client Contact on the Account.
     * 
     *     if(Trigger.isAfter && Trigger.isInsert){

        Set<Id> accIds = new set<Id>();
        Map<Id,Account> accMap = new Map<Id,Account>();
        List<Contact> conListToBeCreated = new List<Contact>();
        for(Account acc : Trigger.New){
           accMap.put(acc.Id, acc);
           accIds.add(acc.Id);
           Contact con = new Contact();
           con.LastName = acc.Name;
           con.AccountId = acc.Id;
           conListToBeCreated.add(con);
        }

        if(conListToBeCreated.size() > 0){
          insert conListToBeCreated;
        }

        List <Account> accListToBeUpdated = new List<Account>();
 
        for(Account acc : accListToBeUpdated){
          for(Contact con : conListToBeCreated){
            acc.Client_Contact__c = accMap.get(con.AccountId);
          }
        }

        if(accListToBeUpdated.size() > 0){
           update accListToBeUpdated;
        }

      
    }
     * 
     * 
     * 
     */

    /**
     * BuildKit.ai Seminar
     * Landing page 
     * 
     * Forms Tally / Google Forms / Airtable
     * 
     * Apps
     * 
     * https://dashboard.audionotes.app/dashboard
     * https://bubble.io/
     * https://www.podnotes.app/
     * https://www.reminderbot.xyz/
     * https://www.summarify.me/
     * 
     * 
     * 
     * 
     * 
     * 
     */