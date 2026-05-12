import { LightningElement, track } from 'lwc';

export default class MultiselectLwc extends LightningElement {
    @track selectedValues = []; // Stores selected values
    @track options = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
    ]; // Options for the picklist

    handleChange(event) {
        this.selectedValues = event.detail.value; // Capture selected values
    }
    
}