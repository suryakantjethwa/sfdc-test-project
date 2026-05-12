({
	myAction : function(component, event, helper) {
        component.set("v.Columns" , [
            {label:"First Name", fieldName:"FirstName" , type:"text"},
            {label:"Last Name", fieldName:"LastName" , type:"text"},
            {label:"Phone", fieldName:"Phone" , type:"Phone"}
        ]);
        
        var action = component.get("c.getContacts");
        action.setParams({
            recId: component.get("v.recordId")
        });
        action.setCallback(this , function(data){
            var state = data.getState();
            if(state === "SUCCESS"){
               component.set("v.Contacts", data.getReturnValue()); 
            }else if(state === "ERROR"){
                var errors = data.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.error("Error message: " + errors[0].message);
                    }
                } else {
                    console.error("Unknown error");
                }
            }
            
        });
        $A.enqueueAction(action);
		
	}
})