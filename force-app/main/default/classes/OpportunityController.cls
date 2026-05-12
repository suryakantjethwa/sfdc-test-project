/*
	--------------------------------------------------------------------------
	Controller Reference Number : Sym_Opp_01
	Developer Name : Mrityunjaya Vashishtha ,
	Developer Email: mrityunjaya.vashishtha@antino.com ,
	Related Test Class : '',
	Method List:
	1. getOpportunityRecordTypes
	2. getOpportunitiesByAccountId
	3. createOpportunityForSYM
	4. getOpportunityById
	--------------------------------------------------------------------------
*/


public with sharing class OpportunityController {
    /*
    @AuraEnabled(cacheable=true)
    public static List<String> getOpportunityRecordTypes() {
        List<String> recordTypeNames = new List<String>();
		// Fetching all active opportunity record types
        for (RecordType rt : [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Opportunity' AND IsActive = true]) {
            recordTypeNames.add(rt.Name);
		}
        return recordTypeNames;
	}
	*/
    
     @AuraEnabled(cacheable=true)
    public static Map<String,String> getOpportunityRecordTypes() {
        Map<String,String> recordTypeNames = new Map<String,String>();
		// Fetching all active opportunity record types
        for (RecordType rt : [SELECT Id, Name FROM RecordType WHERE SObjectType = 'Opportunity' AND IsActive = true]) {
            recordTypeNames.put(rt.Name,rt.Id);
		}
        return recordTypeNames;
	}
    /*
	@AuraEnabled(cacheable=true)
	public static List<Opportunity> getOpportunitiesByAccountId(Id accountId, Id recordTypeId) {
    if (accountId == null || recordTypeId == null) {
        return new List<Opportunity>();
    }
    
    // Opportunity records related to the Account and with the specified RecordTypeId
    List<Opportunity> opportunities = [
        SELECT Id, Name, StageName, CloseDate 
        FROM Opportunity 
        WHERE AccountId = :accountId AND RecordTypeId = :recordTypeId
    ];
    
    return opportunities;
}
	*/

    @AuraEnabled(cacheable=true)
	public static List<Opportunity> getOpportunitiesByAccountId(Id accountId) {
    if (accountId == null) {
        return new List<Opportunity>();
    }
    
    // Opportunity records related to the Account and with the specified RecordTypeId
    List<Opportunity> opportunities = [
        SELECT Id, Name, StageName, CloseDate ,Owner.Name
        FROM Opportunity 
        WHERE AccountId = :accountId
    ];
    System.debug('opportunities::'+opportunities);
    return opportunities;
    }

	//Creation of opportunity record with record type as SYM
	    @AuraEnabled
    public static Id createOpportunityForSYM(Map<String, String> fieldValues) {
        system.debug('fieldValues-->'+fieldValues);
		// required field defination to create the opportunity record for type SYM
        List<String> requiredFields = new List<String>{
            'OpportunityNameSuffix', 
            'Name', 
            'CloseDate', 
            'StageName', 
            'ClientContact', 
            'NextStep',
            'AccountId',
			'RecordTypeId'
        };

		//Required field validation check
        for (String field : requiredFields) {
            if (!fieldValues.containsKey(field) || String.isBlank(fieldValues.get(field))) {
                throw new AuraHandledException('Error: Missing or empty value for required field: ' + field);
            }
        }

        // Create new Opportunity record with provided values and Account association
        Opportunity newOpportunity = new Opportunity();
      //  newOpportunity.RecordTypeId = fieldValues.get('RecordTypeId');
        newOpportunity.AccountId = fieldValues.get('AccountId');
        newOpportunity.Opportunity_Name_Suffix__c = fieldValues.get('OpportunityNameSuffix');
        newOpportunity.Name = fieldValues.get('Name');
        newOpportunity.CloseDate = Date.valueOf(fieldValues.get('CloseDate'));
        newOpportunity.StageName = fieldValues.get('StageName');
        newOpportunity.Client_Contact__c = fieldValues.get('ClientContact');
        newOpportunity.NextStep = fieldValues.get('NextStep');
        
        system.debug('newOpportunity-->'+newOpportunity);
        // Insert the Opportunity and return its Id
        insert newOpportunity;
        return newOpportunity.Id;
    }
	
	// Fetching Opportunity details by opportunityId
	@AuraEnabled(cacheable=true)
    public static Opportunity getOpportunityById(Id opportunityId) {
        if (opportunityId == null) {
            return null;
		}
		
        // Fetching Opportunity with respect to opportunityId
        Opportunity opportunityRec = [
            SELECT Id, Opportunity_Name_Suffix__c, Name, CloseDate, StageName, Client_Contact__c, NextStep
            FROM Opportunity 
            WHERE Id = :opportunityId
            LIMIT 1
		];
		
        return opportunityRec;
	}
}