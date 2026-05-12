import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOpportunityProducts from '@salesforce/apex/ProductConfigController.getOpportunityProducts';
import getOpportunityById from '@salesforce/apex/OpportunityController.getOpportunityById';
import assignPricebookAndMapProducts from '@salesforce/apex/ProductConfigController.assignPricebookAndMapProducts';
import deleteOpportunityLineItems from '@salesforce/apex/ProductConfigController.deleteOpportunityLineItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Federation_Product_User_Labels from '@salesforce/label/c.Federation_Product_User_Labels';

export default class PreviewOpportunityLineItems extends NavigationMixin(LightningElement) {
    @api recordId;
    @track opportunityObject = { opportunityName: '', opportunityStage: '' };
    @track groupedProducts = []; //List of products to be displayed on UI
    @track relatedProducts = []; //List of all products related to current opportunity
    @track inputValues = {}; // Track the input values for each product
    @track totalAmount = 0; // Track the total amount of selected products
    @track deletedProducts = []; // Array to hold products marked for deletion
    @track showDeleteModal = false;
    @track productToDelete = null;
    @track changedProducts = [];
    @track isButtonDisabled = true;
    @track isLoading = false;
    connectedCallback() {
        this.recordId = this.getRecordIdFromUrl();
        this.loadOpportunityProducts();
    }

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

    getRecordIdFromUrl() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get('recordId');
    }

    loadOpportunityProducts() {
        getOpportunityById({ opportunityId: this.recordId })
            .then((opportunity) => {
                this.opportunityObject = {
                    opportunityName: opportunity.Name,
                    opportunityStage: opportunity.StageName,
                };
            })
            .catch((error) => {
                console.error('Error fetching opportunity details', error);
            });
    
        getOpportunityProducts({ opportunityId: this.recordId })
            .then((products) => {
                if (!Array.isArray(products)) {
                    console.warn('No products found or the response is not an array.');
                    this.groupedProducts = [];
                    this.status = 'Draft';
                    return;
                }
                this.status = 'In Progress';
                const excludedProductCodes = Federation_Product_User_Labels.split(',');
                const productMap = {};
                console.log('product List',products);
                this.relatedProducts = products;
                products.forEach((product) => {
                   // if (product.ProductCode && !excludedProductCodes.includes(product.ProductCode)) {
                    if (!excludedProductCodes.includes(product.ProductCode)) {
                    const key = `${product.ProductFamily}:${product.ProductCampaign}`;
                    if (!productMap[key]) {
                        productMap[key] = {
                            key,
                            productFamily: product.ProductFamily,
                            productCampaign: product.ProductCampaign,
                            products: [],
                        };
                    }
                    
                        productMap[key].products.push({
                            ...product,
                            disabled: true,
                            isQuantityChanged: false,
                            isAmtChanged: false,
                        });
                    }
                });
    
                this.groupedProducts = Object.values(productMap).map((group) => {
                    // Assign serial numbers within each group
                    group.products = group.products.map((product, index) => ({
                        ...product,
                        serialNumber: index + 1, 
                    }));
                    return group;
                });
    
                // Initialize input values for each product
                this.groupedProducts.forEach((group) => {
                    group.products.forEach((product) => {
                        this.inputValues[product.Id] = product.Quantity || ''; 
                        this.inputValues[product.Id] = product.UnitPrice || ''; 
                    });
                });
    
                this.calculateTotalAmount();
            })
            .catch((error) => {
                console.error('Error loading opportunity products', error);
            });
    }

    handleQuantityChange(event) {
        const input = event.target;
        const productId = input.dataset.id;
        let sanitizedValue = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        if (sanitizedValue.startsWith('0') && sanitizedValue.length > 1) {
            sanitizedValue = sanitizedValue.replace(/^0+/, ''); // Remove leading zeroes
        }
        input.value = sanitizedValue;

        if (sanitizedValue !== "") {
            const newQuantity = parseFloat(sanitizedValue); // Convert sanitized value to number
            this.inputValues[productId] = sanitizedValue; // Save sanitized value
            const group = this.groupedProducts.find((grp) =>
                grp.products.some((prod) => prod.Id === productId)
            );
            if (group) {
                const product = group.products.find((prod) => prod.Id === productId);
                if (product) {
                    product.isQuantityChanged = product.Quantity !== newQuantity;
                    if(product.isQuantityChanged){
                        this.isButtonDisabled = false;
                        const productDetails = {
                            oliId: product.Id, // Opportunity Line Item ID
                            ProductId: product.ProductId, // Product2 ID
                            ListPrice: product.UnitPrice, // Unit Price
                            Quantity: newQuantity,// Updated Quantity
                            ProductCode: product.ProductCode, // Product Code
                            FedProductLookupId : product.FedChildProductId
                        };
                        console.log('ProductCode',productDetails)
                        // Check if product already exists in the changedProducts array
                        if (Array.isArray(this.changedProducts)) {
                            const existingIndex = this.changedProducts.findIndex(
                                (changedProduct) => changedProduct.oliId === product.Id
                            );
                            if (existingIndex > -1) {
                                // Update the existing product details
                                this.changedProducts[existingIndex] = productDetails;
                            } else {
                                this.changedProducts.push(productDetails);
                                var matchingRelativeProduct = {};
                                if(Array.isArray(this.relatedProducts)){
                                 matchingRelativeProduct = this.relatedProducts.find(
                                    (relProduct) => relProduct.FedChildProductId === productDetails.ProductId
                                );
                            }
                        
                                if (matchingRelativeProduct) {
                                    // Construct FederatedChannel and add it to changedProducts
                                    const FederatedChannel = {
                                        oliId: matchingRelativeProduct.Id, 
                                        ProductId: matchingRelativeProduct.ProductId,
                                        ListPrice: matchingRelativeProduct.UnitPrice, 
                                        Quantity: productDetails.Quantity,
                                        ProductCode: matchingRelativeProduct.ProductCode,
                                        FedProductLookupId : matchingRelativeProduct.FedChildProductId
                                    };
                                    this.changedProducts.push(FederatedChannel);
                                }
                            }
                        } else {
                            console.error('changedProducts is not an array!');
                        }
                       }
                }
            }
            this.calculateTotalAmount();
        }
    }

    handleAmountChange(event) {
        const input = event.target;
        const productId = input.dataset.id;
        let sanitizedValue = input.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        if (sanitizedValue.startsWith('0') && sanitizedValue.length > 1) {
            sanitizedValue = sanitizedValue.replace(/^0+/, ''); // Remove leading zeroes
        }
        input.value = sanitizedValue;

        if (sanitizedValue !== "") {
            const newAmount = parseFloat(sanitizedValue); // Convert sanitized value to number
            this.inputValues[productId] = sanitizedValue; // Save sanitized value
            const group = this.groupedProducts.find((grp) =>
                grp.products.some((prod) => prod.Id === productId)
            );
            if (group) {
                const product = group.products.find((prod) => prod.Id === productId);
                if (product) {
                    product.isAmtChanged = product.UnitPrice !== newAmount;
                    if(product.isAmtChanged){
                        this.isButtonDisabled = false;
                        const productDetails = {
                            oliId: product.Id, // Opportunity Line Item ID
                            ProductId: product.ProductId, // Product2 ID
                            ListPrice: newAmount, // Updated Unit Price
                            Quantity: newQuantity,// Updated Quantity
                            ProductCode: product.ProductCode, // Product Code
                            FedProductLookupId : product.FedChildProductId
                        };
                        console.log('ProductCode',productDetails)
                        // Check if product already exists in the changedProducts array
                        if (Array.isArray(this.changedProducts)) {
                            const existingIndex = this.changedProducts.findIndex(
                                (changedProduct) => changedProduct.oliId === product.Id
                            );
                            if (existingIndex > -1) {
                                // Update the existing product details
                                this.changedProducts[existingIndex] = productDetails;
                            } else {
                                this.changedProducts.push(productDetails);
                                var matchingRelativeProduct = {};
                                if(Array.isArray(this.relatedProducts)){
                                 matchingRelativeProduct = this.relatedProducts.find(
                                    (relProduct) => relProduct.FedChildProductId === productDetails.ProductId
                                );
                            }
                        
                                if (matchingRelativeProduct) {
                                    // Construct FederatedChannel and add it to changedProducts
                                    const FederatedChannel = {
                                        oliId: matchingRelativeProduct.Id, 
                                        ProductId: matchingRelativeProduct.ProductId,
                                        ListPrice: productDetails.ListPrice, 
                                        Quantity: matchingRelativeProduct.Quantity,
                                        ProductCode: matchingRelativeProduct.ProductCode,
                                        FedProductLookupId : matchingRelativeProduct.FedChildProductId
                                    };
                                    this.changedProducts.push(FederatedChannel);
                                }
                            }
                        } else {
                            console.error('changedProducts is not an array!');
                        }
                       }
                }
            }
            this.calculateTotalAmount();
        }
    }

    async saveChangesToServer() {
        try {
            // Show the spinner while the request is processing
            this.isLoading = true;
            const response = await assignPricebookAndMapProducts({
                opportunityId: this.recordId,
                productDetails: this.changedProducts,
            });
    
            console.log('Response from server:', response);
    
            // Check the success flag from the response
            if (response && response.success) {
                // Reset the isQuantityChanged property for all products
                this.groupedProducts.forEach((group) => {
                    group.products.forEach((product) => {
                        product.isQuantityChanged = false; // Reset quantityChange to false
                        product.isAmtChanged = false; // Reset amountChange to false
                        product.disabled = true;
                    });
                });
    
                // Optionally reset the changedProducts array
                this.changedProducts = [];
                this.isButtonDisabled = true;
    
                // Show a success toast with the message from the response
                this.showToast('Success', response.message, 'success');
            } else {
                // Handle the case where Apex indicates a failure
                this.showToast('Error', response.message || 'Failed to save changes', 'error');
            }
        } catch (error) {
            console.error('Error saving changes to server:', error);
            // Handle unexpected errors
            this.showToast(
                'Error',
                error.body.message || 'An unexpected error occurred while saving changes',
                'error'
            );
        } finally {
            // Hide the spinner after the operation completes
            this.isLoading = false;
        }
    }

     async deleteSelectedProducts() {
        try {
            // Show the spinner while the request is processing
            this.isLoading = true
            const response = await deleteOpportunityLineItems({
                opportunityId: this.recordId,
                productDetails: this.deletedProducts,
            });
              // Check the success flag from the response
              if (response && response.success) {
               // Clear the deletedProducts array
                this.deletedProducts = [];
                const productId = this.productToDelete;
                const groupIndex = this.groupedProducts.findIndex((grp) =>
                    grp.products.some((prod) => prod.Id === productId)
                );
            
                if (groupIndex !== -1) {
                    const group = this.groupedProducts[groupIndex];
                // Remove the product from groupedProducts for UI update
                group.products = group.products.filter((prod) => prod.Id !== productId);

                // Check if the group is now empty
                if (group.products.length === 0) {
                    // Remove the group from groupedProducts
                    this.groupedProducts.splice(groupIndex, 1);
                }

                // Refresh UI
                this.groupedProducts = [...this.groupedProducts];
                this.calculateTotalAmount();

            }
                // Show success toast
                this.showToast('Success', response.message, 'success',);
            } else {
                // Handle the case where Apex indicates a failure
                this.showToast('Error', response.message || 'Failed to save changes', 'error');
            }     
        } catch (error) {
            console.error('Error deleting products:', error);

            // Show error toast
            this.showToast('Error', error.body?.message || 'An error occurred', 'error');
        } finally {
            // Hide the spinner after the operation completes
            this.showDeleteModal = false;
            this.isLoading = false;
            this.productToDelete = null;
        }
    }
    
    
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    

    handleRestore(event) {
        const productId = event.target.dataset.id;
        const group = this.groupedProducts.find((grp) =>
            grp.products.some((prod) => prod.Id === productId)
        );
        
        if (group) {
            const product = group.products.find((prod) => prod.Id === productId);
            if (product) {
                // Restore the original quantity from the product object
                this.inputValues[productId] = product.Quantity.toString();
                product.isQuantityChanged = false;
                product.disabled = true;
    
                // Loop through the changedProducts array and filter out the product matching the oli (OpportunityLineItemId)
                this.changedProducts = this.changedProducts.filter((changedProduct) => {
                    // Check if the oli field in changedProduct matches the product.Id
                    return changedProduct.oliId !== product.Id;
                });    
                // Recalculate the total amount after restoring
                this.calculateTotalAmount();
                this.renderedCallback();
                this.checkIfAllQuantitiesRestored();
            }
        }
    }

    handleAmtRestore(event) {
        const productId = event.target.dataset.id;
        const group = this.groupedProducts.find((grp) =>
            grp.products.some((prod) => prod.Id === productId)
        );
        
        if (group) {
            const product = group.products.find((prod) => prod.Id === productId);
            if (product) {
                // Restore the original quantity from the product object
                this.inputValues[productId] = product.UnitPrice.toString();
                product.isAmtChanged = false;
                product.disabled = true;
    
                // Loop through the changedProducts array and filter out the product matching the oli (OpportunityLineItemId)
                this.changedProducts = this.changedProducts.filter((changedProduct) => {
                    // Check if the oli field in changedProduct matches the product.Id
                    return changedProduct.oliId !== product.Id;
                });    
                // Recalculate the total amount after restoring
                this.calculateTotalAmount();
                this.renderedCallback();
                this.checkIfAllQuantitiesRestored();
            }
        }
    }

    checkIfAllQuantitiesRestored() {
        // Check if any product has isQuantityChanged as true
        const allRestored = this.groupedProducts.every((group) => 
            group.products.every((product) => product.isQuantityChanged === false)
        );
        // Disable the button if all quantities are restored
        this.isButtonDisabled = allRestored;
    }

    renderedCallback() {
        // Sync input fields with `inputValues`
        this.template.querySelectorAll('input').forEach((input) => {
            const productId = input.dataset.id;
            if (this.inputValues[productId] !== undefined) {
                input.value = this.inputValues[productId]; // Sync input field value
            }
        });
    }

    calculateTotalAmount() {
        // Calculate the total amount based on quantity * unitPrice for each product
        let total = 0;
        this.groupedProducts.forEach(group => {
            group.products.forEach(product => {
                const quantity = parseFloat(this.inputValues[product.Id]) || 0;
                const unitPrice = parseFloat(product.UnitPrice) || 0; // Assuming unitPrice is provided by the backend
                total += quantity * unitPrice;
            });
        });
        this.totalAmount = total.toFixed(2); // Update the totalAmount, formatted to 2 decimal places
    }

    handleEdit(event) {
        const productId = event.target.dataset.id;
        this.groupedProducts = this.groupedProducts.map((group) => {
            return {
                ...group,
                products: group.products.map((product) => {
                    if (product.Id === productId) {
                        return { ...product, disabled: false };
                    }
                    return product;
                }),
            };
        });
    }

    openDeleteModal(event) {
        const productId = event.target.dataset.id;
        this.productToDelete = productId;
        const group = this.groupedProducts.find((grp) =>
            grp.products.some((prod) => prod.Id === productId)
        );  

        if (group) {
            const product = group.products.find((prod) => prod.Id === productId);
            if (product) {
                // Add the product to the deletedProducts array
                this.deletedProducts.push({
                    oliId: product.Id,
                    ProductId: product.ProductId
                });
        var matchingRelativeProduct = {};
        if(Array.isArray(this.relatedProducts)){
         matchingRelativeProduct = this.relatedProducts.find(
            (relProduct) => relProduct.FedChildProductId === product.ProductId
        );
        }

        if (matchingRelativeProduct) {
            // Construct FederatedChannel and add it to changedProducts
            const FederatedChannel = {
                oliId: matchingRelativeProduct.Id, 
                ProductId: matchingRelativeProduct.ProductId
            };
            this.deletedProducts.push(FederatedChannel);
        }
            }
        }
        
        this.showDeleteModal = true; // Show confirmation modal
    }

    closeDeleteModal() {
        this.showDeleteModal = false; // Hide modal
        this.productToDelete = null; // Clear the product ID
    }

    handleGenerateQuote() {
        console.log('Generating quote');
    }

    handleCancel() {
        console.log('Cancel action');
    }
    @track isCalledProductFlow = false;
    handleBack() {
        this.isCalledProductFlow = true;
    }

    handleSubmitForApproval() {
        console.log('Submitting for approval');
    }

    updateProduct(productId, changes) {
        const group = this.groupedProducts.find((grp) =>
            grp.products.some((prod) => prod.Id === productId)
        );

        if (group) {
            const product = group.products.find((prod) => prod.Id === productId);
            Object.assign(product, changes);
        }
    }
    handleSaveChanges() {
        if(this.changedProducts.length > 0){
            this.saveChangesToServer();
        }
    }
}