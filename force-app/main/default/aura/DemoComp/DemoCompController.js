({
	doInit : function(component, event, helper) {
        
       // component.set('v.Var1' , "DemoCompController Value Var1")
        var data = { 'Name' : 'Surya' , 
                    'Email' : 'Test@test.com'}
        
        component.set("v.jsObject" , data)
        
        component.set( "v.userData" , 
                      {
                          'mystr1' : 'Suryakant P Jethwa',
                          'mystr2' : 2024
                          
                      }
                     
                     )
		
	}
})