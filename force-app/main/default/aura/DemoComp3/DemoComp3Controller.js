({
    doInit : function(component, event, helper) {
		component.set("v.Message1" , "Button 1 Initialized ")
        component.set("v.Message2" , "Button 2 Initialized")
	},
	handleClick : function(component, event, helper) {
		component.set("v.Message1" , "Button Clicked")
        //var btn = event.getSource();
        //var msg = btn.get("v.label");
        component.set("v.Message1" , event.getSource().get("v.label"))
	},
    
    handleClick2 : function(component, event, helper) {
		component.set("v.Message2" , "Another Button Clicked")
        component.set("v.Message2" , event.getSource().get("v.label"))
	}
})