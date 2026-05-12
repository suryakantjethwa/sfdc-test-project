import { LightningElement } from 'lwc';

export default class ParentCompCustomEventWithData extends LightningElement {
    count = 1;
    endValue = 0;
    msg = 'Default Msg'
    handleEventChange(event){
      this.endValue = event.detail.endValue;
      this.msg = event.detail.msg;
      if(this.count < this.endValue){
        this.count = this.count + 1;
      }
      
    }

}