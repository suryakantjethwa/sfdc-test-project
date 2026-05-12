/*
--------------------------------------------------------------------------
Controller Reference Number : Sym_Prod_02
Developer Name : Mrityunjaya Vashishtha ,
Developer Email: mrityunjaya.vashishtha@antino.com,
Related Test Class : '',
Method List:
1. getProductDetails
2. assignPricebookAndMapProducts
3. getFamilyCampaigns
4. getProductsByFamilyAndCampaign
5. getOpportunityProducts
6. deleteOpportunityLineItems
--------------------------------------------------------------------------
*/

public class ProductConfigController {
    
    // Wrapper class to store product details along with UnitPrice from PricebookEntry
    public class ProductInfo {
        @AuraEnabled public Id productId { get; set; }
        @AuraEnabled public String productName { get; set; }
        @AuraEnabled public String productCode { get; set; }
        @AuraEnabled public Decimal unitPrice { get; set; }
    }
    
    @AuraEnabled
    public static List<Map<String,Object>> getProductDetails() {
        List<Map<String, Object>> productDetails = new List<Map<String, Object>>();
        // Retrieve the Pricebook2 record for 2023 Price Book
        Pricebook2 priceBook = [SELECT Id FROM Pricebook2 WHERE Name = '2023 Price Book' AND IsActive = true LIMIT 1];
        
        if (priceBook != null) {
            // Retrieve Product2 and PricebookEntry details for the products (Symphoney entry fee, Symphony Prod License)
            List<PricebookEntry> pricebookEntries = [
                SELECT Product2.Id, Product2.Name, Product2.ProductCode, UnitPrice
                FROM PricebookEntry
                WHERE Pricebook2Id = :priceBook.Id
                AND Product2.ProductCode IN ('SYM-001', 'SYM-002')
                AND IsActive = true
            ];
            
            for (PricebookEntry entry : pricebookEntries) {
                Map<String, Object> productDetail = new Map<String, Object>();
                productDetail.put('ProductId', entry.Product2.Id);
                productDetail.put('ProductName', entry.Product2.Name);
                productDetail.put('ProductCode', entry.Product2.ProductCode);
                productDetail.put('ListPrice', entry.UnitPrice);
                productDetails.add(productDetail);
            }
        }      
        system.debug('productDetails:'+productDetails);
        return productDetails;
    }
    
    @AuraEnabled
	public static ProductConfigResponse assignPricebookAndMapProducts(Id opportunityId, List<Map<String, Object>> productDetails) {
        try{
            if (opportunityId == null || productDetails == null || productDetails.isEmpty()) {
        system.debug('opportunityId:'+opportunityId);
        system.debug('productDetails:'+productDetails);
        
        throw new AuraHandledException('Opportunity ID and Product details cannot be null or empty.');
    }
      //  system.debug('productDetails outside:'+productDetails);

    // Retrieve the Pricebook with the name '2023 Price Book'
    Pricebook2 priceBook = [SELECT Id FROM Pricebook2 WHERE Name = '2023 Price Book' AND IsActive = true LIMIT 1];
    if (priceBook == null) {
        throw new AuraHandledException('Pricebook "2023 Price Book" not found or is inactive.');
    }

    // Retrieve Opportunity details
    Opportunity opp = [SELECT Id, Pricebook2Id FROM Opportunity WHERE Id = :opportunityId LIMIT 1];

    // Assign the '2023 Price Book' to the Opportunity if not assigned
    if (opp.Pricebook2Id == null || opp.Pricebook2Id != priceBook.Id) {
        opp.Pricebook2Id = priceBook.Id;
        update opp;
    }
            
    // Calling the User License Products to handle the user license exceptions for federated products
       Set<String> userLicenseProductCodes = new Set<String>{'SYM-001'};
    // Query line items with relevant product codes for the Opportunity
            List<OpportunityLineItem> userLicenseProducts = [
                SELECT Id, Quantity, Product2.ProductCode 
                FROM OpportunityLineItem 
                WHERE OpportunityId = :opportunityId
                AND Product2.ProductCode IN :userLicenseProductCodes
            ];
            
    // Calculate the total quantity of all products in the line items
        Decimal maxAllowedQuantity = 0;
        for (OpportunityLineItem lineItem : userLicenseProducts) {
            if (lineItem.Quantity != null) {
                maxAllowedQuantity += lineItem.Quantity;
            }
        }
            
    // Fetch existing OpportunityLineItems for the Opportunity
    Map<String, OpportunityLineItem> existingLineItemsMap = new Map<String, OpportunityLineItem>();
    for (OpportunityLineItem oli : [
        SELECT Id, PricebookEntry.Product2Id, Quantity, PricebookEntry.Product2.Name
        FROM OpportunityLineItem WHERE OpportunityId = :opportunityId
    ]) {
        existingLineItemsMap.put(oli.Id, oli);
    }

    List<OpportunityLineItem> lineItemsToInsert = new List<OpportunityLineItem>();
    List<OpportunityLineItem> lineItemsToUpdate = new List<OpportunityLineItem>();
        
    for (Map<String, Object> productDetail : productDetails) {
        Set<String> federationProductLabels = new Set<String>(System.Label.Federation_Product_User_Labels.split(','));
        String oliId = (String) productDetail.get('oliId');
        String productId = (String) productDetail.get('ProductId');
        String productCode = (String) productDetail.get('ProductCode');
        Decimal listPrice = (Decimal) productDetail.get('ListPrice'); //getting Unit Price from LWC
        Decimal quantity = (Decimal) productDetail.get('Quantity');
        String fedProdLookupId = (String) productDetail.get('FedProductLookupId');
       if (quantity != null && quantity <= 0) {
            throw new AuraHandledException('Quantity for a product must be greater than 0.');
        }
        if( fedProdLookupId != null && federationProductLabels.contains(productCode)){
            if(quantity > maxAllowedQuantity){
                throw new AuraHandledException('Total Federation Channel quantity cannot exceed the specified user license quantity!');
            }
        }
        
        if (productId != null && quantity != null) {
            // Check if the product exists in the current OpportunityLineItems
            if (
              existingLineItemsMap.containsKey(oliId)
               ) {
                OpportunityLineItem existingOli = existingLineItemsMap.get(oliId);
                if (existingOli.Id == oliId && existingOli.Quantity != quantity) {
                    if (federationProductLabels.contains(productCode)) {
                    if(productCode == 'FPU1'){
                       existingOli.Quantity = quantity;
                       existingOli.UnitPrice = 0; 
                    }else{
                    existingOli.Quantity = quantity;
                    existingOli.UnitPrice = 50 * quantity;
                    }    
                } else {
                    existingOli.Quantity = quantity;
                    existingOli.UnitPrice = listPrice * quantity;
                }
                    lineItemsToUpdate.add(existingOli);
                    
                }
            } else {
                // Create a new OpportunityLineItem for the product
                PricebookEntry pbe = [
                    SELECT Id FROM PricebookEntry 
                    WHERE Product2Id = :productId AND Pricebook2Id = :priceBook.Id AND IsActive = true 
                    LIMIT 1
                ];
                OpportunityLineItem newOli = new OpportunityLineItem();
                newOli.OpportunityId = opportunityId;
                newOli.PricebookEntryId = pbe.Id;
                newOli.Fed_Child_Product__c = fedProdLookupId;
              
                if (federationProductLabels.contains(productCode)) {
                    if(productCode == 'FPU1'){
                       newOli.Quantity = quantity;
                       newOli.UnitPrice = 0; 
                    }else{
                    newOli.Quantity = quantity;
                    newOli.UnitPrice = 50 * quantity;
                    }    
                } else {
                    newOli.Quantity = quantity;
                    newOli.UnitPrice = listPrice * quantity;
                }
                lineItemsToInsert.add(newOli);
            }
        }
        }
    
    // Perform DML operations
    if (!lineItemsToInsert.isEmpty()) {
        insert lineItemsToInsert;
    }
    if (!lineItemsToUpdate.isEmpty()) {
        update lineItemsToUpdate;
    }

       ProductConfigResponse response = new ProductConfigResponse();
        if (!lineItemsToInsert.isEmpty() && !lineItemsToUpdate.isEmpty()) {
            response.success = true;
            response.message = 'Products created and updated successfully.';
        } else if (!lineItemsToInsert.isEmpty()) {
            response.success = true;
            response.message = 'Products created successfully.';
        } else if (!lineItemsToUpdate.isEmpty()) {
            response.success = true;
            response.message = 'Products updated successfully.';
        } else {
            response.success = false;
            response.message = 'No changes were made to the products.';
        }
        
        return response;
        }catch(DmlException e) {
            ProductConfigResponse response = new ProductConfigResponse();
            response.success = false;
            response.message = 'The following exception has occurred: ' + e.getMessage();
            return response;
}
}
    
    public class ProductConfigResponse {
    @AuraEnabled
    public Boolean success;
    @AuraEnabled
    public String message;
}
    
    //Returning Product Family and Product Campaign for filters
    @AuraEnabled(cacheable=true)
    public static Map<String, List<String>> getFamilyCampaigns() {
        Map<String, Set<String>> familyToCampaignSetMap = new Map<String, Set<String>>();
        List<String> familyList = new List<String>{'Messaging', 'Streetlinx', 'AA'};
            List<Product2> products = [SELECT toLabel(Family), Product_Campaign__c 
                                       FROM Product2 
                                       WHERE Family != null AND Family IN: familyList];
        system.debug('products::' + products);
        
        // Looping through all the fetched products
        for (Product2 product : products) {
            String family = product.Family;
            String campaign = product.Product_Campaign__c;
            
            // Checking if the map contains the family, if not create a new Set
            if (!familyToCampaignSetMap.containsKey(family)) {
                familyToCampaignSetMap.put(family, new Set<String>());
            }
            
            // Adding campaign to the Set to ensure uniqueness
            familyToCampaignSetMap.get(family).add(campaign);
        }
        
        // Convert the Set to List for the return type
        Map<String, List<String>> familyToCampaignMap = new Map<String, List<String>>();
        for (String family : familyToCampaignSetMap.keySet()) {
            familyToCampaignMap.put(family, new List<String>(familyToCampaignSetMap.get(family)));
        }
        
        system.debug('familyToCampaignMap::' + familyToCampaignMap);
        return familyToCampaignMap;
    }
    
    
    //Returning list of products based on the selected filters (Product Family and Product Campaign)
    @AuraEnabled
    public static List<ProductConfigController.ProductInfo> getProductsByFamilyAndCampaign(String productFamilyLabel, String productCampaign) {
        List<ProductInfo> productsList = new List<ProductInfo>();
        
        if (productFamilyLabel == null) {
            throw new AuraHandledException('Error: product Family cannot be null.');
        }
        system.debug('productFamilyLabel::'+productFamilyLabel);
         system.debug('productCampaign::'+productCampaign);
        // Get the API value for the picklist label
        String productFamilyAPIValue = getProductFamilyAPIValue(productFamilyLabel);
         system.debug('productFamilyAPIValue::'+productFamilyAPIValue);
        if (productFamilyAPIValue == null) {
            throw new AuraHandledException('Error: Invalid product family label.');
        }
        
        // Query products using the API value for Family
        List<PricebookEntry> pricebookEntries = [
            SELECT Product2.Id, Product2.Name, Product2.ProductCode, UnitPrice
            FROM PricebookEntry
            WHERE Pricebook2.Name = '2023 Price Book'
            AND Product2.Family = :productFamilyAPIValue
            AND Product2.Product_Campaign__c = :productCampaign
        ];
         system.debug('pricebookEntries::'+pricebookEntries);
        
        // Process results and store in ProductInfo objects
        for (PricebookEntry pbe : pricebookEntries) {
            ProductInfo product = new ProductInfo();
            product.productId = pbe.Product2.Id;
            product.productName = pbe.Product2.Name;
            product.productCode = pbe.Product2.ProductCode;
            system.debug('product.productCode::'+product.productCode);
            product.unitPrice = pbe.UnitPrice;
            
            productsList.add(product);
        }
         system.debug('productsList::'+productsList);
        return productsList;
    }
    

    private static String getProductFamilyAPIValue(String productFamilyLabel) {
        // Get picklist values for the Product2 Family field
        Schema.DescribeFieldResult fieldResult = Product2.Family.getDescribe();
        List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
        
        // Iterate through picklist values to find the API value corresponding to the label
        for (Schema.PicklistEntry entry : picklistValues) {
            if (entry.getLabel() == productFamilyLabel) {
                return entry.getValue();  // Return the API value corresponding to the label
            }
        }
        
        // If the label is not found, return null
        return null;
    }
    //Fetching all the related product of an opportunity

@AuraEnabled(cacheable=true)
public static List<Map<String, Object>> getOpportunityProducts(Id opportunityId) {
    List<Map<String, Object>> opportunityProducts = new List<Map<String, Object>>();
    
    if (opportunityId == null) {
        throw new AuraHandledException('Opportunity Id cannot be null.');
    }

    // Fetch picklist values for Product2.Family
    Map<String, String> familyValueToLabelMap = new Map<String, String>();
    Schema.DescribeFieldResult familyFieldDescribe = Product2.Family.getDescribe();
    List<Schema.PicklistEntry> familyPicklistValues = familyFieldDescribe.getPicklistValues();
    for (Schema.PicklistEntry entry : familyPicklistValues) {
        familyValueToLabelMap.put(entry.getValue(), entry.getLabel());
    }

    List<OpportunityLineItem> opportunityLineItems = [
        SELECT Id, OpportunityId, Product2.Id, Product2.Name, Product2.ProductCode, UnitPrice,ListPrice, Quantity, TotalPrice, Product2.Family, Product2.Product_Campaign__c, Fed_Child_Product__c, Fed_Child_Product__r.Name
        FROM OpportunityLineItem
        WHERE OpportunityId = :opportunityId
    ];

    for (OpportunityLineItem oli : opportunityLineItems) {
        Map<String, Object> productDetail = new Map<String, Object>();
        productDetail.put('Id', oli.Id);
        productDetail.put('ProductId', oli.Product2.Id);
        productDetail.put('ProductName', oli.Product2.Name);
        productDetail.put('ProductCode', oli.Product2.ProductCode);
        productDetail.put('UnitPrice', oli.UnitPrice);
        productDetail.put('ListPrice', oli.ListPrice);
        productDetail.put('Quantity', oli.Quantity);
        productDetail.put('TotalPrice', oli.TotalPrice);
        productDetail.put('FedProdName', oli.Fed_Child_Product__r.Name);
        productDetail.put('FedChildProductId', oli.Fed_Child_Product__c);
        productDetail.put('ProductFamily', familyValueToLabelMap.get(oli.Product2.Family)); // Assigned the picklist label to show on UI of preview sales screen.
        productDetail.put('ProductCampaign', oli.Product2.Product_Campaign__c);
        opportunityProducts.add(productDetail);
    }
    system.debug('myolis::'+opportunityProducts);
    return opportunityProducts;
}

    
    @AuraEnabled
	public static ProductConfigResponse deleteOpportunityLineItems(Id opportunityId, List<Map<String, Object>> productDetails) {
        System.debug('product details==>'+productDetails);
    if (opportunityId == null || productDetails == null || productDetails.isEmpty()) {
        throw new AuraHandledException('Opportunity ID and Product details cannot be null or empty.');
    }

    // Fetch existing OpportunityLineItems for the Opportunity
    Map<String, OpportunityLineItem> existingLineItemsMap = new Map<String, OpportunityLineItem>();
    for (OpportunityLineItem oli : [
        SELECT Id, PricebookEntry.Product2Id, PricebookEntry.Product2.Name
        FROM OpportunityLineItem WHERE OpportunityId = :opportunityId
    ]) {
        existingLineItemsMap.put(oli.PricebookEntry.Product2Id, oli);
    }

    List<OpportunityLineItem> lineItemsToDelete = new List<OpportunityLineItem>();

    for (Map<String, Object> productDetail : productDetails) {
        String productId = (String) productDetail.get('ProductId');

        if (productId != null && existingLineItemsMap.containsKey(productId)) {
            OpportunityLineItem existingOli = existingLineItemsMap.get(productId);
            lineItemsToDelete.add(existingOli);
        }
    }

    // Perform DML delete operation
       ProductConfigResponse response = new ProductConfigResponse();
         if (!lineItemsToDelete.isEmpty()) {
        delete lineItemsToDelete;
            response.success = true;
            response.message = 'Selected products deleted successfully.';
        } else {
            response.success = false;
            response.message = 'No matching products found to delete.'; 
        }  
        return response;     
}
    
}