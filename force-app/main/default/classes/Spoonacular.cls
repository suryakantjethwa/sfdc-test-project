public with sharing class Spoonacular {
    private static final string SPOONACULAR_API = 'https://api.spoonacular.com';

    public Spoonacular() {

    }

    public static void getRandomReceipe(){
     Http http = new Http();
     HttpRequest req = new HttpRequest();
     req.setEndpoint('https://api.spoonacular.com/recipes/complexSearch');
     
    }
}