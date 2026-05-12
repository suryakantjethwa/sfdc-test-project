public class InheritenceDemo {
    //Primitive variables 
    Integer a = 2;
    String str = 'Yatin';
    /**
    
     c - language
     cpp - C++ - OOPs Language
     Object oriented programming concepts
     Any language that supports the four pillars of Object-Oriented -Programming is known as OOP language
     Design patterns 
   
   
     1.Encapsulation - This is the ability to bind data attributes(variable in any language) and methods(behaviour) together 
                       is known as Encapsulation.

     2.Inheritence   - This is the ability to extend the existing class to add a new fuctionality. 
                      EX - Child class extends the parent class.
     
     3.Abstraction   - This is the ability to hide the complex implementations.

     4.Polymorphism  - This is the ability to perform differnt actions by calling the same method. 
   
   **/
    
    //!. Encapsulation Example 
    
    public class person{
        
        //Data attribute , variable 
        private String name;
        Public Integer age;
        Public String country;
      
        //Method or behaviour 
        public void setName(string str){
           name = str;
        }
        public void setAge(Integer a){
           age = a;
        }
        public void setAge(string add){
           country = add;
        }    
    } 
     /** Design pattern 
     To use inheritance we need to use virtual keyword or abstract keyword in base class and its methods which you want to inherit
     in child class
     imp ---->
     The virtual keyword states that a class or method can be inherited and overridden by child classes.
  
    **/
    
    
    /*
    PArent class or base class 
    */
    public virtual class fourWheelVehicle{
     
        public virtual void ability(){
            system.debug('This is fourWheelVehicle !!');
        }
        
        public void information(){
           system.debug('Info about vehicle !!'); 
        }
        
    }
    
    /*
    Child classes 
    */    
    public class Truck extends fourWheelVehicle{
         //override keyword is used to override the method existing in the base class
         //Override keyword informs that this is new version or specific version of the same method in the base class
        public override void ability(){
            super.ability();
            System.debug('I can carry heavy loads');
        }
    }
    
    public class SUV extends fourWheelVehicle{
        public override void ability(){
            super.ability();
            System.debug('I can carry 7 passengers!');
        }        
    }
    
    public class SEDAN extends fourWheelVehicle{
        public override void ability(){
            super.ability();
            System.debug('I can carry 4 passengers!');
        }         
    }
    
    
    
    public static void myFunctionTestingInheritence(){
        
          Truck f1 = new Truck();
          f1.ability();
          f1.information();
    }
       
    
    /**
     * Polymorphism  --- > There are two types polymorphism on the basis of when the implementation is selected. 
     *      when the implemetation is selected at compile time  it is known is static dispatch
     * when the implemetation is selected when the program is running(In case of virtual method) time it is known is dynamic 
     *  dispatch
     *       
     */
    
     // Interface -- >  it is another way to achieve polymorphism and Abstraction in any programming language.
     

     //Example -- Interface 
  
    public interface playstation {
        void playSmackDown(String player1, string player2);
        void playMilesMoralis(String player1, string player2);
    }

    
   
}