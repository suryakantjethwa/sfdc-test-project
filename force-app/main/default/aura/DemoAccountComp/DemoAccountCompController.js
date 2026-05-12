({
	doInit : function(component, event, helper) {
        var action = component.get("c.getAccounts");
        
        action.setCallback(this, (response) => {
            var state = response.getState();
            if(state === "SUCCESS"){
              component.set("v.accList", response.getReturnValue());
            }
        });
        
        $A.enqueueAction(action);
	}
})