import { LightningElement,track,api,wire } from 'lwc';
import getProductDetails from '@salesforce/apex/ProductConfigController.getProductDetails';
import assignPricebookAndMapProducts from '@salesforce/apex/ProductConfigController.assignPricebookAndMapProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getExistingOliList from '@salesforce/apex/ProductConfigController.getOpportunityProducts';
import { CloseActionScreenEvent } from 'lightning/actions';
import getOpportunityById from '@salesforce/apex/OpportunityController.getOpportunityById';
import getData from '@salesforce/apex/ProductConfigController.getFamilyCampaigns';
import getProductsByFamilyAndCampaign from '@salesforce/apex/ProductConfigController.getProductsByFamilyAndCampaign';
import { getRecord, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';


export default class OpportunityProductFlowLwc extends LightningElement {
  @api recordId;
  @api secondscreen = false;
  @track initialSelection = true;
  @track isFreeDisabled = false;
  @track OLIData = {};
  @track isPaidCheckboxSelected=true;
  @track isPaidCkecked = false;
  @track StageName;
  @track OpportunityName;
  @track FinalAmount = 0;
  @track status = 'Draft';
  @track products = [];
  @track existingOLIData = [];
  @track keyOptions = []; 
   @track selectedKey = null;
    @track selectedValue = null;
    @track valueOptions = []; // All available products
    @track visibleOptions = []; // Subset of products shown in the dropdown
    @track products = []; // Full product list fetched from server
    @track allExistingOlis=[];
    @track dataMap = {};
    @track isLoading = false; // Controls spinner visibility
    //@track isNextScreenVisible = false; // Controls next screen visibility
    @track totalLicenses = 0;

    get statusClass() {
        let statusClass = '';
        let statusLabel = '';

        switch (this.status) {
            case 'Draft':
                statusClass = 'status-box grey';
                statusLabel = 'Draft';
                break;
            case 'In Progress':
                statusClass = 'status-box green';
                statusLabel = 'In Progress';
                break;
            case 'Approved':
                statusClass = 'status-box green';
                statusLabel = 'Approved';
                break;
            case 'Rejected':
                statusClass = 'status-box red';
                statusLabel = 'Rejected';
                break;
            case 'Quote Created':
                statusClass = 'status-box yellow';
                statusLabel = 'Quote Created';
                break;
            default:
                statusClass = 'status-box grey';
                statusLabel = 'Unknown';
        }
        return statusClass;
    }

    get statusLabel() {
        return this.statusClass === '' ? 'Unknown' : this.status;
    }

    wiredOliResult;
    wiredProductResult;



   @wire(getProductDetails)
    wiredProducts(result) {
        this.wiredProductResult = result; // Store the wired result for refreshing
        if (result.data) {
            console.log('Wire listening...');
            this.processProductDetails(result.data);
        } else if (result.error) {
            console.error('Error fetching product details:', result.error);
        }
    }

    @wire(getExistingOliList, { opportunityId: '$recordId' })
    wiredExistingOli(result) {
        this.wiredOliResult = result; // Store wired result for refresh
        if (result.data) {
            console.log('Wire listening existing...');
            this.processExistingOliData(result.data);
        } else if (result.error) {
            console.error('Error fetching existing OLI data:', result.error);
        }
    }

  @wire(getOpportunityById,{ opportunityId : '$recordId' })
  wiredOpportunities({ error, data}){
        if(data){
           console.log('Opp data::'+JSON.stringify(data));
              this.OpportunityName = data.Name;
              this.StageName = data.StageName;
        }else if(error){
            console.error('Error fetching opportunity:', error);
        }
    }

  handleFreeCheckboxChange(event){
    this.isFreeDisabled= (event.target.checked) == true ? false : true;
  }


@api
openModal() {
  console.log('Oppppeeennn Modal !!');// Fetch records again when modal opens
}

 connectedCallback() {
    this.recordId = this.getRecordIdFromUrl();
    console.log('Inside connected callback ');
    console.log('@@@@@@@@@@ 1',this.FinalAmount);
  
}

   handleFinalAmount(){
         console.log('mytest inn');
         this.FinalAmount = 0;
         console.log('FinalAmount::----------> start', this.FinalAmount);
         this.existingOLIData.forEach(oli => {
                        console.log('mytest oli::---------->', JSON.stringify(oli));
                        if(oli.ProductCode !== 'FPU1' && oli.ProductCode !== 'FPU2' && oli.ProductCode !== 'FPU3' && oli.ProductCode !== 'FPU4'){
                           this.FinalAmount += oli.TotalAmount;
                           //console.log('oli::----------> amtount', JSON.stringify(oli.TotalAmount));
                           //console.log('oli::----------> ListPrice', JSON.stringify(oli.ListPrice));
                        }
                    });

        console.log('FinalAmount::----------> end', this.FinalAmount);            
   }


    getRecordIdFromUrl() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get('recordId');
    }

    getDropVals(){
        return getData().then((data) => {
        if (data) {
                    this.dataMap = data;
                    console.log('this.dataMap::'+JSON.stringify(this.dataMap));
                    this.keyOptions = Object.keys(data).map((key) => ({ label: key, value: key }));
                    console.log('this.keyOptions::'+JSON.stringify(this.keyOptions));
        
        
                    // Set default Product Family and dependent Product Campaign
                    this.selectedKey = 'Messaging'; // Default Product Family
                    this.selectedValue = 'Federation'; // Default Product Family
                    this.valueOptions = this.dataMap[this.selectedKey]?.map((val) => ({ label: val, value: val })) || [];
                this.selectedValue = this.valueOptions.find(option => option.value == 'Federation')
                    ? 'Federation'
                    : this.valueOptions.length > 0
                    ? this.valueOptions[0].value
                    : null;
                    //console.log('MJMJ>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>,',this.selectedValue)
        
                } else if (error) {
                    console.error(error);
                }
        }
        )
    }

    
    processExistingOliData(data){

        // console.log('Opp ID:: '+ recordId);


                this.products = []; // Clear existing products list
                this.FinalAmount = 0; // Reset FinalAmount
       
                console.log('@@@@@: initial', this.totalLicenses);
                if (data && data.length > 0) {
                    data.forEach(oli => {

                        console.log('OLI:: data', oli);
                        this.existingOLIData.push({
                            ProductId: oli.ProductId,
                            ProductCode: oli.ProductCode,
                            ProductName: oli.ProductName,
                            ListPrice: oli.UnitPrice,
                            Quantity: oli.Quantity,
                            TotalAmount:oli.TotalPrice,
                            Id: oli.Id,
                            FedProdName: oli.FedProdName,
                            SalesPrice: oli.ListPrice
                        });
            
                    });
    
                    this.status = 'In Progress';
    
                    console.log('Existing OLI data ++++++++++:', JSON.stringify(this.existingOLIData));
                    this.handleFinalAmount();
                    this.existingOLIData.forEach(oli => {
    
                    // console.log('OLI::=======> ', oli);
                        if(oli.ProductCode === 'SYM-001'){

                              if(Number(oli.ListPrice) === 0){
                                    console.log('Inside unitPrice :: --+++++++++++++++--> ', oli.ListPrice);
                                    this.products = this.products.map(product => {
                                        
                                        if (product.type === 'Free') { 
                                            console.log('Paid Product', product);
                                            this.TotalFreeProductsQuantity += oli.Quantity;
                                            return { ...product, Quantity: oli.Quantity, oliId: oli.Id }; // Update Quantity
                                        }
                                        return product; // Leave other products unchanged
                                    });
        
                                }else{
                                    // Update the quantity for the free license in the products array
                                    this.products = this.products.map(product => {
                                        
                                        if (product.type === 'Paid') {
                                            this.isPaidCheckboxSelected = false;
                                            this.TotalPaidProductsQuantity += oli.Quantity;
                                            console.log(' sachin Paid Product', JSON.stringify(oli.Quantity));
                                            console.log(' sachin Paid Product', JSON.stringify(oli.ListPrice));
                                            console.log(' sachin Paid Product', JSON.stringify(oli.UnitPrice));
                                            const total_Amount = oli.ListPrice * oli.Quantity;
                                            console.log(' sachin Paid Product : totalamount: ',total_Amount);
                                            return { ...product, Quantity: oli.Quantity, oliId: oli.Id ,isChecked: true, TotalAmount: total_Amount ,disabled : false}; // Update Quantity
                                            //return { ...product, Quantity: oli.Quantity, oliId: oli.Id ,isChecked: true, disabled : false}; // Update Quantity

                                        }
                                        return product; // Leave other products unchanged
                                    });
                                }
                        }
    
                        if(oli.ProductCode === 'SYM-002' ){
         
                       
                                this.products = this.products.map(product => {
                                
                                    if (product.type === 'Entry') {
                                        console.log('Entry Product', product);
                                        return { ...product, Quantity: oli.Quantity, oliId: oli.Id }; // Update Quantity
                                    }
                                    return product; // Leave other products unchanged
                                });
                            
                        }
                    });
                    this.products.forEach(product => {
                        console.log('Product::---------->', JSON.stringify(product));
                       // this.FinalAmount += product.TotalAmount;
                    });
        
                    this.allExistingOlis = data;
                   
                }else{
                    this.status = 'Draft';
                }
                 console.log('@@@@@: totallicenses', this.totalLicenses);
           
        }

        @track TotalFreeProductsQuantity = 0;
        @track TotalPaidProductsQuantity =0;

    processProductDetails(data) {
                this.products = []; // Clear existing products list
                this.FinalAmount = 0; // Reset FinalAmount
                data.forEach(prod => {
                    let product = {
                        ProductId: prod.ProductId,
                        ProductCode: prod.ProductCode,
                        Name: prod.ProductName,
                        ListPrice: prod.ListPrice,
                        isChecked: false,

                        TotalAmount: 0,
                    };

                    // Set additional attributes based on ProductCode
                    if (prod.ProductCode === 'SYM-001') {
                        this.PaidProduct = { ...product };
                        this.PaidProduct.isPaid = true;
                        this.PaidProduct.type = 'Paid'; 
                        this.PaidProduct.Quantity = 0;

                        this.FreeProduct = { ...product };
                        this.FreeProduct.type = 'Free'; 
                        this.FreeProduct.isFree = true;
                        this.FreeProduct.ListPrice = 0;
                        this.FreeProduct.Quantity = 20;
                        //this.paidProduct.isChecked = false;
                    } else if (prod.ProductCode === 'SYM-002') {
                        //product.isEntry = true;
                        //product.type = 'Entry';
                        this.EntryProduct = { ...product }; 
                        this.EntryProduct.isEntry = true;
                        this.EntryProduct.type = 'Entry';
                        this.EntryProduct.Quantity = 1;

                        

                    // this.FreeProduct.isChecked = false;
                    } 
                    
                    // Push the product to the unified products array
                    //this.products.push(product);
                    if(product.ProductCode === 'SYM-001'){
                        this.products.push(this.PaidProduct);
                        this.products.push(this.FreeProduct);
                    }
                
                    if(product.ProductCode === 'SYM-002'){ 
                        this.products.push(this.EntryProduct);
                    }

                });

                // Sort products based on their Type
                this.products.sort((a, b) => {
                    const order = { Entry: 1, Free: 2, Paid: 3 };
                    return order[a.type] - order[b.type];
                });

                //Iterate over the products ans log
                this.products.forEach(product => {
                    console.log('Product:==============>', product.ProductCode);
                });


                this.FinalAmount += this.EntryProduct.ListPrice;

                console.log('@@@@@@@@@@ 2', this.FinalAmount);
            
            
    }


  dollersigntext = 'Unit Price: ';

  handlePaidLicenseCount(event){
    // Capture the updated quantity from the input field
   const newQuantity = parseInt(event.target.value, 10) || 0;
       // Update the quantity for the free license in the products array
       this.TotalPaidProductsQuantity = 0;
       this.products = this.products.map(product => {
           //console.log('Paid ====== Product', product.type);
           if (product.type === 'Paid') { 
               console.log('Paid ==== Product', product);
               console.log('Paid ==== newQuantity', newQuantity);
               console.log('Paid ==== product.ListPrice', product.ListPrice);
               this.FinalAmount += (newQuantity * product.ListPrice);
               this.totalLicenses += newQuantity;
               return { ...product, Quantity: newQuantity, TotalAmount: newQuantity * product.ListPrice }; // Update Quantity
           }
           return product; // Leave other products unchanged
       });

 }

 handleConfigureProducts() {
    this.OLIData = this.products;

    this.OLIData.forEach(product => {
        console.log('Product for each :', product);
    }); 


    console.log('Opp ID22:: '+JSON.stringify(this.recordId));
   assignPricebookAndMapProducts({ opportunityId: this.recordId, productDetails: this.OLIData })
        .then((result) => {
            console.log('Result:', JSON.stringify(result));
            this.showToast('Success', result.message, 'success');
            this.initialSelection = false;
            this.status = 'In Progress';
            this.isLoading = true; // Show spinner

            // Simulate a delay or asynchronous operation
            setTimeout(() => {
                this.isLoading = false; // Hide spinner
                this.initialSelection = false; // Show the next screen
            }, 2000);
          
        })
        .catch((error) => {
            console.error('Error:', error);
            this.showToast('Error creating opportunity Products', error.message, 'error');
            this.initialSelection = true;
        });

         
}


  handlePaidChange(event){
     
     var isChecked = event.target.checked;
     if(isChecked){
         this.isPaidCheckboxSelected = false;
     }
     else{
         this.isPaidCheckboxSelected = true;
     }
  }


   @track disableConfigureCTA = false;

  handleFreeLicenseCount(event) {
    // Capture the updated quantity from the input field
    const newQuantity = parseInt(event.target.value, 10) || 0;
    this.TotalFreeProductsQuantity = 0;

    //////////////////////////////////////////
        

            if (newQuantity > 20) {
                // Inline error: Restrict input and notify the user
                event.target.setCustomValidity('Total free licenses cannot exceed 20.');
                this.disableConfigureCTA = true;
                event.target.reportValidity();
                return;
            } else {
                // Clear any existing error
                this.disableConfigureCTA = false;
                event.target.setCustomValidity('');
                event.target.reportValidity();
            }
    //////////////////////////////////////
    // Update the quantity for the free license in the products array
    this.products = this.products.map(product => {
        
        if (product.type === 'Free') { // Assuming 'SYM-002' is the Free License Product Code
            console.log('Free Product', product);
            this.totalLicenses += newQuantity;
            return { ...product, Quantity: newQuantity }; // Update Quantity
        }
        return product; // Leave other products unchanged
    });
    console.log('Updated Free License Quantity:', newQuantity);
    console.log('Updated Free License Quantity:', this.totalLicenses);
  }

 /* handleNext() {
    const product1 = {
            productId: this.EntryProductId,
            ProductName: this.EntryProductName,
            ProductCode: this.EntryProductCode,
            unitPrice: this.EntryProductListPrice,
            quantity: this.EntryProductQuantity
        };

        const product2 = {
            productId: this.PaidProductId,
            ProductName: this.PaidProductName,
            ProductCode: this.PaidProductCode,
            unitPrice: 0,
            quantity: this.FreeProductQuantity
        };

        const product3 = {
            productId: this.PaidProductId,
            ProductName: this.PaidProductName,
            ProductCode: this.PaidProductCode,
            unitPrice: this.PaidProductListPrice,
            quantity: this.PaidProductQuantity
        };


    this.OLIData = [product1];

    if (product2.Quantity != 0) {
        this.OLIData.push(product2);
    }
    if (product3.Quantity != 0) {
        this.OLIData.push(product3);
    }
    console.log('Opp ID22::'+JSON.stringify(this.recordId));
    assignPricebookAndMapProducts({ opportunityId: this.recordId, productDetails: this.OLIData })
        .then((result) => {
            console.log('Result:', JSON.stringify(result));
            this.showToast('Success', JSON.stringify(result), 'success');
            this.initialSelection = false;
        })
        .catch((error) => {
            console.error('Error:', error);
            this.showToast('Error creating opportunity Products', error.body.message, 'error');
        });
}*/

@track isCalledPreviewFlow = false;
handleNextFederationAndOther(){
    //this.handleDataCreation();
    this.isCalledPreviewFlow = true;
}

@track filteredProducts = [];
@track productsToBeAdded = [];
@track ptest;
@track firstList=[];
handleDataCreation(){
   /*
    if(this.isFederationData){
                // Filter the products list to include only those with quantity > 0
            console.log('my Products:', JSON.stringify(this.fedProducts));

            const size = this.fedProducts.length;
                    console.log('Size of fedProducts:', size);
                    const productsname = this.fedProducts.map(product=>{
                        console.log('size: ',product.ProductName);
                        console.log('size: ',product.Quantity);
                        console.log('size: ',product.ProductId);
                        console.log('size: ',product.ProductCode);
                        console.log('size: ',product.ListPrice);
                    })

            console.log('before');
            this.filteredProducts = this.fedProducts.filter(product => product.Quantity > 0);
            console.log('After :'+JSON.stringify(this.filteredProducts));

            const len = this.filteredProducts.length;
                    console.log('size lenghth of filteredProducts:', len);
                    const testData = this.filteredProducts.map(product=>{
                        console.log('size: ',product.ProductName);
                        console.log('size: ',product.Quantity);
                        console.log('size: ',product.ProductId);
                        console.log('size: ',product.ProductCode);
                        console.log('size: ',product.ListPrice);
                        console.log('size: ',product.FedProd);
                    })

            this.filteredProducts.forEach(product => {

                if(product.Quantity > 0){
                    this.productsToBeAdded.push( product );
                    console.log('product.FedProd', product.FedProd);

                    if(product.FedProd == 'First'){
                        
                        this.ptest = this.firstList.find(product => product.ProductName == '1 Federation Product Users');
                        console.log('this.ptest', this.ptest);
                        this.ptest.Quantity = product.Quantity;
                        this.productsToBeAdded.push( this.ptest );

                    }
                    if(product.FedProd == 'Second'){
                        this.ptest = this.firstList.find(product => product.ProductName == '2 Federation Product Users');
                        this.ptest.Quantity = product.Quantity;
                        this.productsToBeAdded.push( this.ptest );

                    }
                    if(product.FedProd == 'Third'){
                        this.ptest = this.firstList.find(product => product.ProductName == '3 Federation Product Users');
                        this.ptest.Quantity = product.Quantity;
                        this.productsToBeAdded.push(  this.ptest );

                    }
                    if(product.FedProd == 'Fourth'){
                        this.ptest = this.firstList.find(product => product.ProductName == '4 Federation Product Users');
                        this.ptest.Quantity = product.Quantity;
                        this.productsToBeAdded.push(  this.ptest );
                    }
                }

            });

            this.filteredProducts = this.productsToBeAdded;



            const firstListUpdated = this.firstList.filter(product => product.ProductName != '1 Federation Product Users' && product.ProductName != '2 Federation Product Users' && product.ProductName != '3 Federation Product Users' && product.ProductName != '4 Federation Product Users') 
            .map(product => {
                    return {
                        label: product.ProductName,
                        value: product.ProductId
                    };
            });



            
            // Log the filtered products
            console.log('Filtered Products:', JSON.stringify(this.filteredProducts));
            
            if (this.filteredProducts.length === 0) {
                // If no products have quantity > 0, show a warning toast and exit
                this.showToast('Warning', 'No products with quantity greater than 0.', 'warning');
                return;
            }
            
            console.log('Opp ID22::'+JSON.stringify(this.recordId));
            assignPricebookAndMapProducts({ opportunityId: this.recordId, productDetails: this.filteredProducts })
                .then((result) => {
                    console.log('sachin federation data:', JSON.stringify(result));
                    this.showToast('Success', JSON.stringify(result), 'success');
                    this.isPreviewScreen = true;
                })
                .catch((error) => {
                    console.error('Error:', error);
                    this.showToast('Error creating opportunity Products', error.body.message, 'error');
                });
    }
    else{
                    // Filter the products list to include only those with quantity > 0
                console.log('my Products:', JSON.stringify(this.fedProducts));

                const size = this.fedProducts.length;
                        console.log('Size of fedProducts:', size);
                        const productsname = this.fedProducts.map(product=>{
                            console.log('size: ',product.ProductName);
                            console.log('size: ',product.Quantity);
                            console.log('size: ',product.ProductId);
                            console.log('size: ',product.ProductCode);
                            console.log('size: ',product.ListPrice);
                        })

                console.log('before');
                this.filteredProducts = this.fedProducts.filter(product => product.Quantity > 0);
                console.log('After :'+JSON.stringify(this.filteredProducts));

                const len = this.filteredProducts.length;
                        console.log('size lenghth of filteredProducts:', len);
                        const testData = this.filteredProducts.map(product=>{
                            console.log('size: ',product.ProductName);
                            console.log('size: ',product.Quantity);
                            console.log('size: ',product.ProductId);
                            console.log('size: ',product.ProductCode);
                            console.log('size: ',product.ListPrice);
                            console.log('size: ',product.FedProd);
                        })

                this.filteredProducts.forEach(product => {

                    if(product.Quantity > 0){
                        this.productsToBeAdded.push( product );
                        console.log('product.FedProd', product.FedProd);

                        if(product.FedProd == 'First'){
                            
                            this.ptest = this.firstList.find(product => product.ProductName == '1 Federation Product Users');
                            console.log('this.ptest', this.ptest);
                            this.ptest.Quantity = product.Quantity;
                            this.productsToBeAdded.push( this.ptest );

                        }
                        if(product.FedProd == 'Second'){
                            this.ptest = this.firstList.find(product => product.ProductName == '2 Federation Product Users');
                            this.ptest.Quantity = product.Quantity;
                            this.productsToBeAdded.push( this.ptest );

                        }
                        if(product.FedProd == 'Third'){
                            this.ptest = this.firstList.find(product => product.ProductName == '3 Federation Product Users');
                            this.ptest.Quantity = product.Quantity;
                            this.productsToBeAdded.push(  this.ptest );

                        }
                        if(product.FedProd == 'Fourth'){
                            this.ptest = this.firstList.find(product => product.ProductName == '4 Federation Product Users');
                            this.ptest.Quantity = product.Quantity;
                            this.productsToBeAdded.push(  this.ptest );
                        }
                    }

                });

                this.filteredProducts = this.productsToBeAdded;



                const firstListUpdated = this.firstList.filter(product => product.ProductName != '1 Federation Product Users' && product.ProductName != '2 Federation Product Users' && product.ProductName != '3 Federation Product Users' && product.ProductName != '4 Federation Product Users') 
                .map(product => {
                        return {
                            label: product.ProductName,
                            value: product.ProductId
                        };
                });



                
                // Log the filtered products
                console.log('Filtered Products:', JSON.stringify(this.filteredProducts));
                
                if (this.filteredProducts.length === 0) {
                    // If no products have quantity > 0, show a warning toast and exit
                    this.showToast('Warning', 'No products with quantity greater than 0.', 'warning');
                    return;
                }
                
                console.log('Opp ID22::'+JSON.stringify(this.recordId));
                assignPricebookAndMapProducts({ opportunityId: this.recordId, productDetails: this.filteredProducts })
                    .then((result) => {
                        console.log('sachin federation data:', JSON.stringify(result));
                        this.showToast('Success', JSON.stringify(result), 'success');
                        this.isPreviewScreen = true;
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        this.showToast('Error creating opportunity Products', error.body.message, 'error');
                    });
    }
    */

    ////////////////////////////////////////////////////////////////////

    // Filter the products list to include only those with quantity > 0
    console.log('my Products:', JSON.stringify(this.fedProducts));

    const size = this.fedProducts.length;
            console.log('Size of fedProducts:', size);
            const productsname = this.fedProducts.map(product=>{
                console.log('size: ',product.ProductName);
                console.log('size: ',product.Quantity);
                console.log('size: ',product.ProductId);
                console.log('size: ',product.ProductCode);
                console.log('size: ',product.ListPrice);
            })

    console.log('before');
    this.filteredProducts = this.fedProducts.filter(product => product.Quantity > 0);
    console.log('After :'+JSON.stringify(this.filteredProducts));

    const len = this.filteredProducts.length;
            console.log('size lenghth of filteredProducts:', len);
            const testData = this.filteredProducts.map(product=>{
                console.log('size: ',product.ProductName);
                console.log('size: ',product.Quantity);
                console.log('size: ',product.ProductId);
                console.log('size: ',product.ProductCode);
                console.log('size: ',product.ListPrice);
                console.log('size: ',product.FedProd);
            })

    this.filteredProducts.forEach(product => {

        if(product.Quantity > 0){
            this.productsToBeAdded.push( product );
            console.log('product.FedProd', product.FedProd);

            if(product.FedProd == 'First'){
                
                this.ptest = this.firstList.find(product => product.ProductName == '1 Federation Product Users');
                console.log('this.ptest', this.ptest);
                this.ptest.Quantity = product.Quantity;
                this.productsToBeAdded.push( this.ptest );

            }
            if(product.FedProd == 'Second'){
                this.ptest = this.firstList.find(product => product.ProductName == '2 Federation Product Users');
                this.ptest.Quantity = product.Quantity;
                this.productsToBeAdded.push( this.ptest );

            }
            if(product.FedProd == 'Third'){
                this.ptest = this.firstList.find(product => product.ProductName == '3 Federation Product Users');
                this.ptest.Quantity = product.Quantity;
                this.productsToBeAdded.push(  this.ptest );

            }
            if(product.FedProd == 'Fourth'){
                this.ptest = this.firstList.find(product => product.ProductName == '4 Federation Product Users');
                this.ptest.Quantity = product.Quantity;
                this.productsToBeAdded.push(  this.ptest );
            }
        }

    });

    this.filteredProducts = this.productsToBeAdded;



    const firstListUpdated = this.firstList.filter(product => product.ProductName != '1 Federation Product Users' && product.ProductName != '2 Federation Product Users' && product.ProductName != '3 Federation Product Users' && product.ProductName != '4 Federation Product Users') 
    .map(product => {
            return {
                label: product.ProductName,
                value: product.ProductId
            };
    });



    
    // Log the filtered products
    console.log('Filtered Products:', JSON.stringify(this.filteredProducts));
    
    if (this.filteredProducts.length === 0) {
        // If no products have quantity > 0, show a warning toast and exit
        this.showToast('Warning', 'No products with quantity greater than 0.', 'warning');
        return;
    }
    
    console.log('Opp ID22::'+JSON.stringify(this.recordId));
    assignPricebookAndMapProducts({ opportunityId: this.recordId, productDetails: this.filteredProducts })
        .then((result) => {
            console.log('sachin federation data:', JSON.stringify(result));
            this.showToast('Success', result.message, 'success');
            this.isPreviewScreen = true;
        })
        .catch((error) => {
            console.error('Error:', error);
            this.showToast('Error creating opportunity Products', error.message, 'error');
        });
}

  showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }));
    }

    // Close the modal
    closeModal() {

        this.dispatchEvent(new CloseActionScreenEvent());
        window.location.reload();
    }


    @wire(getData)
    wiredData({ error, data }) {
        if (data) {
            this.dataMap = data;
            console.log('this.dataMap::'+JSON.stringify(this.dataMap));
            this.keyOptions = Object.keys(data).map((key) => ({ label: key, value: key }));
            console.log('this.keyOptions::'+JSON.stringify(this.keyOptions));


            // Set default Product Family and dependent Product Campaign
            this.selectedKey = 'Messaging'; // Default Product Family
            this.selectedValue = 'Federation'; // Default Product Family
            this.valueOptions = this.dataMap[this.selectedKey]?.map((val) => ({ label: val, value: val })) || [];
        this.selectedValue = this.valueOptions.find(option => option.value == 'Federation')
            ? 'Federation'
            : this.valueOptions.length > 0
            ? this.valueOptions[0].value
            : null;

        } else if (error) {
            console.error(error);
        }
    }

    handleKeyChange(event) {
        this.selectedKey = event.detail.value;
        this.valueOptions = this.dataMap[this.selectedKey]?.map((val) => ({ label: val, value: val })) || [];
        console.log('this.valueOptions::'+JSON.stringify(this.valueOptions));
        this.selectedValue = this.valueOptions.length > 0 ? this.valueOptions[0].value : null; // Reset to first option or null
    }

    @track isFederationData = false;
    @track isFederation =false;
    handleValueChange(event){
        this.selectedvalue = event.detail.value;
        
        if(this.selectedvalue == 'Federation'){
            this.isFederationData = true;
            this.isOtherData = false;
         }
         else{
             this.isFederationData = false;
         }
    }
    

    callConfirmationModal(){
       this.showModal = true;
    }

    confirmAction() {
        this.showModal = false;
        this.fedProducts = this.fedProducts.map(product => {
                        console.log('============ iterate id', JSON.stringify(product.ProductId));
                        console.log('============ assigned id', JSON.stringify(this.uncheckedProductId));
                        if(product.ProductId === this.uncheckedProductId){
                           console.log('============ 0', JSON.stringify(product));
                           return {
                                ...product,
                                Quantity: 0,
                                checked: false,
                                disabled: true,
                                overridedListPrice: 0,
                                selectedValue: '',
                                selectedProd : '',
                                ListPrice: 0,
                            };
                        }
                        console.log('============ 0.1', JSON.stringify(product));
                        return product;
                    });

                    this.fedProducts.forEach(prod => {
                        //console.log('mytest prod sachin::---------->', JSON.stringify(prod));
                        if(prod.ProductId == this.uncheckedProductId){
                           console.log('============ 1', JSON.stringify(prod));
                          
                        }
                    });

                    this.products = this.products.map(product => {
                        //console.log('mytest prod sachin::---------->', JSON.stringify(prod));
                        if(product.ProductId == this.uncheckedProductId){
                           console.log('============> 2', JSON.stringify(product));
                           return {
                                ...product,
                                Quantity: 0,
                                ListPrice: 0,
                                TotalPrice:0
                            };
                        }
                        return product;
                    });

                    this.products.forEach(prod => {
                        //console.log('mytest prod sachin::---------->', JSON.stringify(prod));
                        if(prod.ProductId == this.uncheckedProductId){
                           console.log('============> 2', JSON.stringify(prod));
                        }
                    });
        
    }
    
    @track showModal = false;
    closeModal() {
        this.showModal = false;
    }



     handleCheckboxChange(event) {
        const productId = event.target.dataset.id;
        var isChecked = event.target.checked;
        this.handleDisableFunction(productId,isChecked);

        if(!isChecked){
           this.callConfirmationModal();
           this.uncheckedProductId = productId;
        }
    }

    handleDisableFunction(productId,isChecked){
        this.products = this.products.map(product => {
            if (product.ProductId === productId) {
                return {
                    ...product,
                    checked: isChecked,
                    disabled: isChecked == true ? false : true
                };
            }
            return product;
        });
    }

    handleQuantityChange(event) {
        // Retrieve the product ID and new quantity
        const productId = event.target.dataset.id;
        const value = parseInt(event.target.value, 10) || 0;
        
        // Update the quantity in the `products` array
        var totalPrice=0;
        this.products = this.products.map(product => {
            
            totalPrice = value * product.ListPrice; // Calculate total price
            
            return product.ProductId === productId
                ? { ...product, Quantity: value, TotalPrice: totalPrice } // Allow real-time typing
                : product;
        });
       
        const fetchedProduct = this.products.find(product => product.ProductId === productId);
        this.FinalAmount = this.FinalAmount + fetchedProduct.TotalPrice;
        
        // Create a map to ensure unique products in `filteredProducts`
        const uniqueProductsMap = new Map();

        // Add all products from `filteredProducts` to the map
        this.filteredProducts.forEach(product => {
            uniqueProductsMap.set(product.ProductId, product);
        });

        // Add updated products to the map
        this.products.forEach(product => {
            uniqueProductsMap.set(product.ProductId, product);
        });

        // Convert map back to an array to update `filteredProducts`
        this.filteredProducts = Array.from(uniqueProductsMap.values());

        //console.log('Updated products:', JSON.stringify(this.products));
        console.log('Filtered products:', JSON.stringify(this.filteredProducts));
    }

    goToInitialPage(){
        this.products = [];
        this.existingOLIData = [];
        this.initialSelection = true;
            if (this.recordId) {
                this.fetchProductDetails().then(() => {
                    // Check if existingOLIData is empty
                    console.log('Fetching product details...');
                    if (this.products.length > 0) {
                        console.log('Products Mapped...');
                        this.fetchTheExistingOliData(this.recordId);
                        console.log('$%$%$%$:'+JSON.stringify(this.products));
                    } else {
                        console.log('Existing OLI data found. Skipping fetchProductDetails.');
                    }
                    }).catch((error) => {
                        console.error('Error while fetching OLI data:', error);
                        // Optionally, handle errors by still fetching product details
                        this.fetchTheExistingOliData(this.recordId);
                    });
                    
            
        }else {
            console.log('Existing OLI data found. Skipping fetchProductDetails.');
        }
    }



    //new code for loop::
    //===============================================
 
        @track searchedProducts = [];
        @track fedProducts = [];
        @track filteredProducts = [];
        @track comboBoxOptionsAll = [];
        @track selectedProducts = [];
        @track isOtherData =false;

        handleSearchData(){
            if(this.isFederationData){
                getProductsByFamilyAndCampaign({ productFamilyLabel: this.selectedKey, productCampaign: this.selectedvalue })
                    .then((data) => {

                    if (data && data.length > 0) {
                        
                        this.products = data.map(product => ({
                                ListPrice: product.unitPrice,  // Mapping unitPrice to ListPrice
                                fedListPrice: product.unitPrice,
                                ProductId: product.productId, // Mapping productId to ProductId
                                ProductCode: product.productCode, // Keeping productCode
                                ProductName: product.productName, // Keeping productName
                                Quantity: 0,
                                overridedListPrice: 0,                 // Adding Quantity property
                                checked: false,                // Adding checked property
                                disabled: true,
                                SalesPrice: 0
                            }));
                            console.log('Mapped Products:', JSON.stringify(this.products));
                        


                        this.filteredProducts = this.products
                            .filter(product => product.ProductName != '1 Federation Product Users' && product.ProductName != '2 Federation Product Users' && product.ProductName != '3 Federation Product Users' && product.ProductName != '4 Federation Product Users')
                            .map(product => {
                                    return product;
                            });
                        //  console.log('list filteredProducts=====>', JSON.stringify(this.filteredProducts));
                        

                        
                        this.comboBoxOptionsAll = this.filteredProducts.map(product => {
                            return {
                                label: product.ProductName,
                                value: product.ProductId
                            };
                        });
                        //this.handleComboboxOptions(this.comboBoxOptionsAll);
                    // console.log('list comboBoxOptionsAll=====>', JSON.stringify(this.comboBoxOptionsAll));


                        this.fedProducts = this.products
                            .filter(product => [
                                '1 Federation Product Users',
                                '2 Federation Product Users',
                                '3 Federation Product Users',
                                '4 Federation Product Users'
                            ].includes(product.ProductName))
                            .map((product) => ({
                                ...product,
                                comboboxoptions: this.comboBoxOptionsAll,
                                selectedValue: null, // Initially set all options
                                selectedProd: null,
                                ListPrice: 0,
                                overridedListPrice: 0,
                                
                            }));

                            
                             

             
                        
                            
                        //sorting logic:
                        this.fedProducts = this.fedProducts.sort((a, b) => a.ProductName.localeCompare(b.ProductName));

                        this.fedProducts = this.fedProducts.map((product,index)=>{
                                console.log('&&&&&->'+JSON.stringify(index));
                                if(index === 0){
                                    console.log('&&&&& 0->'+JSON.stringify(index));
                                    return {
                                        ...product,
                                        disabled: false
                                    };
                                }
                                else if(index !== 0){
                                    console.log('&&&&& 1->'+JSON.stringify(index));
                                    return {
                                        ...product,
                                        disabled: true
                                    };
                                }
                                
                            });

                        this.handlePopulatefedProductsFromExistingOlis();
                        console.log('$$$$$$',JSON.stringify(this.fedProducts));


                 }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    //this.showToast('Error creating opportunity Products', error.body.message, 'error');
                });

                if(this.selectedvalue == 'Federation'){
                    this.isFederation = true;
                }
                else{
                    this.isFederation = false;
                }
                console.log('#####: total before',this.totalLicenses);
                this.totalLicenses += this.TotalFreeProductsQuantity + this.TotalPaidProductsQuantity;
                console.log('#####: paid',this.TotalPaidProductsQuantity);
                console.log('#####: free',this.TotalFreeProductsQuantity);
                console.log('#####: total',this.totalLicenses);
            }else{
                this.isOtherData = true;
                this.isFederation = false;


                getProductsByFamilyAndCampaign({ productFamilyLabel: this.selectedKey, productCampaign: this.selectedvalue })
                .then((result) => {
                    // Add quantity property to each product for tracking user input
                    
                        // Add new properties to each product
                        this.products = result.map(product => ({
                            ListPrice: product.unitPrice,  // Mapping unitPrice to ListPrice
                            ProductId: product.productId, // Mapping productId to ProductId
                            ProductCode: product.productCode, // Keeping productCode
                            ProductName: product.productName, // Keeping productName
                            Quantity: 0,                     // Adding Quantity property
                            TotalPrice: 0,
                            checked: false,                // Adding checked property
                            disabled: true                 // Adding disabled property
                        }));
                        console.log('Mapped Products:', JSON.stringify(this.products));

                        this.handlePopulateOtherProductsFromExistingOlis();
                
                })
            .catch((error) => {
                console.error('Error:', error);
                //this.showToast('Error creating opportunity Products', error.body.message, 'error');
                });   
            
            }
            
        }


    handlePopulatefedProductsFromExistingOlis(){

        this.existingOLIData.forEach( oli => {
            if(oli.ProductName === '1 Federation Product Users' || oli.ProductName === '2 Federation Product Users' 
                || oli.ProductName === '3 Federation Product Users' || oli.ProductName === '4 Federation Product Users'){

                const selectedProduct = this.products.find(option => option.ProductName === oli.FedProdName);

                const comboBoxOli = this.existingOLIData.find(innerOli => innerOli.ProductName === oli.FedProdName);
                selectedProduct.oliId = comboBoxOli.Id;

                console.log('comboBoxOli------->', comboBoxOli);

                    this.fedProducts.map(fedProduct => {
                        if(fedProduct.ProductId === oli.ProductId){
                            fedProduct.selectedValue = selectedProduct.ProductId;
                            fedProduct.selectedProd = selectedProduct;
                            fedProduct.ListPrice = selectedProduct.ListPrice;
                            fedProduct.overridedListPrice = selectedProduct.ListPrice * comboBoxOli.Quantity;
                            fedProduct.Quantity = comboBoxOli.Quantity;
                            fedProduct.disabled = false;
                            fedProduct.checked = true;
                            fedProduct.oliId = oli.Id;

                            return fedProduct;
                        }else{
                            return fedProduct;
                        }
                    });

                   console.log('fedProducts +++--->', this.fedProducts);
            }
        });
    }

    handlePopulateOtherProductsFromExistingOlis(){

        this.existingOLIData.forEach( oli => {
            //console.log('mytestoli22------->', JSON.stringify(oli));
            if(oli.ProductName != '1 Federation Product Users' || oli.ProductName != '2 Federation Product Users' 
                || oli.ProductName != '3 Federation Product Users' || oli.ProductName != '4 Federation Product Users'){
                
                //console.log('comboBoxOli-------> existingOLIData1', JSON.stringify(this.existingOLIData));
                //console.log('comboBoxOli-------> products2', JSON.stringify(this.products));
                    this.products.map(prod => {
                        if(prod.ProductId === oli.ProductId){
                            console.log('comboBoxOli-------> Quantity 1', JSON.stringify(oli.Quantity));

                            prod.Quantity = oli.Quantity;
                            console.log('comboBoxOli-------> Quantity 2', JSON.stringify(prod.Quantity));
                            prod.ListPrice = oli.ListPrice;
                            prod.TotalPrice = oli.Quantity * oli.ListPrice;
                            prod.disabled = false;
                            prod.checked = true;
                            prod.oliId = oli.Id;
                            
                            console.log('comboBoxOli-------> prod 3', JSON.stringify(prod));
                            return prod;
                                
                        }else{
                            return prod;
                        }
                    });

            }
        });
    }

      ////////////////////
    
    handleComboboxChange(event) {

            const productId = event.target.dataset.id; // Identify the current fedProduct
            const selectedValue = event.target.value; // Get the selected value
            console.log('Parent ProductId:', productId, 'Child productId or Value:', selectedValue);
            // Find the selected product in comboBoxOptionsAll
            const selectedProduct = this.products.find(option => option.ProductId === selectedValue);
               console.log('$@$ : selectedProduct', JSON.stringify(selectedProduct));
            const selectedFedProduct = this.fedProducts.find(option => option.ProductId === productId);
               console.log('$@$ : selectedFedProduct', JSON.stringify(selectedProduct));
            // Update the selected value and quantity for the current product
            this.fedProducts = this.fedProducts.map(product => {
                if (product.ProductId === productId) {
                    return {
                        ...product,
                        selectedValue: selectedValue,
                        selectedProd : selectedProduct,
                        Quantity: selectedProduct ? product.Quantity : 0 ,
                        ListPrice: selectedProduct ? selectedProduct.ListPrice : 0,
                        SalesPrice: selectedProduct ? selectedProduct.ListPrice : 0
                    };
                }
                return product;
            });


            // Dynamically update comboBoxOptionsAll for the next product
            if (selectedProduct) {
                // Store the previous selected value
                const previousValue = selectedFedProduct.selectedValue;
        
                // Update the current product's selected value
                selectedProduct.selectedValue = selectedValue;
                console.log(`Product ID: ${productId}, Previous Value: ${previousValue}, New Value: ${selectedValue}`);
        
                // If there was a previous selection, re-add it to other products' options
                if (previousValue) {
                    this.fedProducts.forEach(prod => {
                        if (prod.ProductId !== productId) {
                            // Check if the previous value is not already in options before adding
                            //  const optionToAddBack = { label: previousValue, value: previousValue };
                            const optionToAddBack = this.comboBoxOptionsAll.find(option => option.value === previousValue);

                            if (!prod.comboboxoptions.some(option => option.value === previousValue)) {
                                prod.comboboxoptions.push(optionToAddBack);
                            }
                        }
                    });
                }
        
                // Remove the newly selected value from other products' options
                this.fedProducts.forEach(prod => {
                    if (prod.ProductId !== productId) {
                        // Filter out the newly selected value from other products' options
                        prod.comboboxoptions = prod.comboboxoptions.filter(option => option.value !== selectedValue);
                    }
                });
        
                console.log(`Product ID: ${productId}, Selected Value: ${selectedValue}`);
            }

            // Collect all selected product IDs
            const selectedProductIds = this.fedProducts
                .filter(product => product.selectedProd)
                .map(product => product.selectedProd.ProductId);

            console.log('Selected Product IDs:', selectedProductIds);
            console.log('Updated comboBoxOptionsAll:', JSON.stringify(this.comboBoxOptionsAll));
    
    }
    
    @track disableSaveButton = false;
    handleQuantityChangeFed(event){
        const Quantity = parseFloat(event.target.value) || 0;
        const productId = event.target.dataset.id; // Retrieve the ProductId from the data-id attribute

        // Use map to iterate through the entire array and update only the matching product
        this.fedProducts = this.fedProducts.map(product => {
            console.log('mytest Fed :'+JSON.stringify(this.fedProducts));
            if (product.ProductId === productId) {
                    let errorMessage = '';
                    //const calculatedOverriddenListPrice = Quantity * product.SalesPrice;

                    console.log('%%%%% --> old ',product.overridedListPrice);
                    //console.log('%%%%% --> new ',calculatedOverriddenListPrice);
                    if (Quantity > this.totalLicenses) {
                        errorMessage = `Total quantity cannot exceed ${this.totalLicenses}.`;
                        this.disableSaveButton = true;
                    }
                    else if(errorMessage == ''){
                        this.disableSaveButton = false;
                    }
                  /*
                    // Calculate new overridden list price
                    const newOverriddenListPrice = Quantity * product.ListPrice;
                    console.log('%%%%% --> newOverriddenListPrice',newOverriddenListPrice);
                    // Update FinalAmount: subtract old overriddenListPrice and add new one
                    console.log('%%%%% --> this.FinalAmount before',this.FinalAmount);
                    this.FinalAmount = this.FinalAmount - product.overridedListPrice + newOverriddenListPrice;
                    console.log('%%%%% --> this.FinalAmount after',this.FinalAmount);
                  */
                return {
                    ...product,
                    Quantity: Quantity,
                    checked: true,
                    errorMessage
                };
            }
            return product; // Return the product unchanged if it doesn't match
        });
        console.log('^^^^^ fedProducts:', JSON.stringify(this.fedProducts));
        const fetchedProduct = this.fedProducts.find(product => product.ProductId === productId);
        
        //this.FinalAmount = this.FinalAmount + fetchedProduct.overridedListPrice;

       

        ///////////////////////////////////////////////
        
            this.fedProducts = this.fedProducts.map((product, index) => {

                    // Enable the next product if the current product is checked and has a Quantity > 0
                    if (index > 0) {
                        const prevProduct = this.fedProducts[index - 1];
                        console.log('*****--> prev',JSON.stringify(prevProduct));
                        console.log('*****--> checked? ',JSON.stringify(prevProduct.checked));
                        console.log('*****--> Quantity? ',JSON.stringify(prevProduct.Quantity));
                        if (prevProduct.checked && prevProduct.Quantity > 0) {
                            console.log('*****--> inside if');
                            return {
                                ...product,
                                disabled: false 
                            };
                        }
                        else{
                            console.log('*****--> inside else');
                            return {
                                ...product,
                                disabled: true 
                            };
                        }
                    }

                    return product;
            });

            console.log('Updated fedProducts:', JSON.stringify(this.fedProducts));
            
        /////////////////////////////////////////////
    
    }
   
   /////////////////////////////////////////////////
    handleQuantityChangeFedBlur(event){
        const Quantity = parseFloat(event.target.value) || 0;
        const productId = event.target.dataset.id; // Retrieve the ProductId from the data-id attribute

        // Use map to iterate through the entire array and update only the matching product
        this.fedProducts = this.fedProducts.map(product => {
            //console.log('mytest Fed :'+JSON.stringify(this.fedProducts));
            if (product.ProductId === productId) {

                    // Calculate new overridden list price
                    const newOverriddenListPrice = Quantity * product.ListPrice;
                    console.log('%%%%% --> newOverriddenListPrice',newOverriddenListPrice);
                    console.log('%%%%% --> overridedListPrice',product.overridedListPrice);
                    // Update FinalAmount: subtract old overriddenListPrice and add new one
                    console.log('%%%%% --> this.FinalAmount before',this.FinalAmount);
                    this.FinalAmount = this.FinalAmount - product.overridedListPrice + newOverriddenListPrice;
                    console.log('%%%%% --> this.FinalAmount after',this.FinalAmount);

                return {
                    ...product,
                    Quantity: Quantity,
                    overridedListPrice: Quantity * product.ListPrice,
                    
                };
            }
            return product; // Return the product unchanged if it doesn't match
        });
    }
        /////////////////////////////////////////////////
    
    /////////////////////////////////////////////////
    handleCustomUnitPriceBlur(event){
        const CustomPrice = parseFloat(event.target.value) || 0;
        const productId = event.target.dataset.id; // Retrieve the ProductId from the data-id attribute

        // Use map to iterate through the entire array and update only the matching product
        this.fedProducts = this.fedProducts.map(product => {
            //console.log('mytest Fed :'+JSON.stringify(this.fedProducts));
            if (product.ProductId === productId) {

                    // Calculate new overridden list price
                    const newOverriddenListPrice = product.Quantity * CustomPrice;
                    console.log('%%%%% --> newOverriddenListPrice',newOverriddenListPrice);
                    console.log('%%%%% --> overridedListPrice',product.overridedListPrice);
                    // Update FinalAmount: subtract old overriddenListPrice and add new one
                    console.log('%%%%% --> this.FinalAmount before',this.FinalAmount);
                    this.FinalAmount = this.FinalAmount - product.overridedListPrice + newOverriddenListPrice;
                    console.log('%%%%% --> this.FinalAmount after',this.FinalAmount);

                return {
                    ...product,
                    overridedListPrice: product.Quantity * CustomPrice,
                    SalesPrice : CustomPrice
                };
            }
            return product; // Return the product unchanged if it doesn't match
        });
    }
        /////////////////////////////////////////////////
    

    @track uncheckedProductId = '';
    handleCheckboxChangeFedProd(event){
    
        const productId = event.target.dataset.id; // Retrieve the ProductId from the data-id attribute
        const isChecked = event.target.checked;   // Retrieve the checkbox state
        
        console.log('productId:', productId);
        console.log('isChecked:', isChecked);
       // console.log('this.fedProducts 1:', JSON.stringify(this.fedProducts));
    
        // Use map to iterate through the entire array and update only the matching product
        this.fedProducts = this.fedProducts.map(product => {
            if (product.ProductId === productId) {
                console.log('TTTTTTTTTTTTT -------> ' , product);
                return {
                    ...product,
                    disabled: isChecked ? false : true // Update the 'disabled' property
                };
            }
            return product; // Return the product unchanged if it doesn't match
        });

        

         
        if(!isChecked){
           this.callConfirmationModal();
           this.uncheckedProductId = productId;
        }
        
        console.log('this.isChecked'+JSON.stringify(isChecked));

        
       // console.log('this.fedProducts 2:', JSON.stringify(this.fedProducts));
    }

    handleSaveProducts() {

        if(this.isFederationData){
                        let olisToInsert = [];  
                    // Filter products where Quantity is greater than 0
                    let filteredprods = this.fedProducts.filter(prod => prod.Quantity > 0);
                    console.log('filteredprods:', filteredprods);
                
                    // Ensure filteredprods is not empty before proceeding
                    if (filteredprods.length === 0) {
                        console.log('No products to save.');
                        return; // Exit if there are no products to save
                    }
                
                    filteredprods.forEach(prod => {
                        const fedProdToInsert = {
                            ProductId: prod.ProductId,
                            ProductName: prod.ProductName,
                            ProductCode: prod.ProductCode,
                            ListPrice: prod.fedListPrice,
                            Quantity: prod.Quantity,
                            FedProductLookupId: prod.selectedProd.ProductId,
                            oliId: prod.oliId
                        };
                        
                        
                        const ProdToInsert = {
                            ProductId: prod.selectedProd.ProductId,
                            ProductName: prod.selectedProd.ProductName,
                            ProductCode: prod.selectedProd.ProductCode,
                            ListPrice: prod.ListPrice,
                            Quantity: prod.Quantity,
                            oliId: prod.selectedProd.oliId
                        };
                        
                        olisToInsert.push(fedProdToInsert);
                        olisToInsert.push(ProdToInsert);
                    });
                
                    console.log('olisToInsert:', olisToInsert);
                
                    // Check if olisToInsert has items before logging
                    if (olisToInsert.length === 0) {
                        console.log('No OLIs to insert.');
                    } else {
                        olisToInsert.forEach(oli => {
                            console.log('oli:', oli);
                        });
                    }


                    //Save the OLIs in backend
                    console.log('Opp ID22::'+JSON.stringify(this.recordId));
                    assignPricebookAndMapProducts({ opportunityId: this.recordId, productDetails: olisToInsert })
                        .then((response) => {
                            console.log('response',response);
                            if(response && response.success){
                                this.showToast('Success', response.message, 'success');
                            }else{
                                this.showToast('Error', response.message, 'error');
                            }
                        
                        })
                        .catch((error) => {
                            console.error('Error fed:', error);
                            this.showToast('Error creating opportunity Products', error.message, 'error');
                    });
        }else{
                    let olisToInsert = [];
                    // Filter products where Quantity is greater than 0
                    let filteredprods = this.products.filter(prod => prod.Quantity > 0);
                    console.log('filteredprods:', filteredprods);
                
                    // Ensure filteredprods is not empty before proceeding
                    if (filteredprods.length === 0) {
                        console.log('No products to save.');
                        return; // Exit if there are no products to save
                    }
                
                    filteredprods.forEach(prod => {
                        
                        const ProdToInsert = {
                            ProductId: prod.ProductId,
                            ProductName: prod.ProductName,
                            ProductCode: prod.ProductCode,
                            ListPrice: prod.ListPrice,
                            Quantity: prod.Quantity,
                            oliId: prod.oliId
                        };
                
                        //olisToInsert.push(fedProdToInsert);
                        olisToInsert.push(ProdToInsert);
                    });
                
                    console.log('olisToInsert:', olisToInsert);
                
                    // Check if olisToInsert has items before logging
                    if (olisToInsert.length === 0) {
                        console.log('No OLIs to insert.');
                    } else {
                        olisToInsert.forEach(oli => {
                            console.log('oli:', oli);
                        });
                    }


                    //Save the OLIs in backend
                    console.log('Opp ID22::'+JSON.stringify(this.recordId));
                    assignPricebookAndMapProducts({ opportunityId: this.recordId, productDetails: olisToInsert })
                        .then((response) => {
                        
                            if(response && response.success){
                                this.showToast('Success', response.message, 'success');
                            }else{
                                this.showToast('Error', response.message, 'error');
                            }
                        
                        })
                        .catch((error) => {
                            console.error('Error others:', error);
                            this.showToast('Error creating opportunity Products ', error.message, 'error');
                    });
        }
        
    }
    
    


}