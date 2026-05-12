import { LightningElement, track } from 'lwc';

export default class QuizApp extends LightningElement {

    selected = {} //for storing answers

    correctAnswers = 0; // To show the answers

    isSubmitted = false; // To show the result

    //create a array of objects having question no, question and answers object and correct answer fields
     questionList = [   
        {
            id : 1,
            question : "Who is the CEO of Apple?",
            answers : {
                "a" : "Steve",
                "b" : "Bill",
                "c" : "Mark"
            },
            correctAnswer : "a"
        },
        {
            id : 2,
            question : "Who is the CEO of Microsoft?",
            answers : {
                "a" : "Steve",
                "b" : "Bill",
                "c" : "Mark"
            },
            correctAnswer : "b"  
        },
        {
            id : 3,
            question : "Who is the CEO of Google?",
            answers : {
                "a" : "Steve",
                "b" : "Bill",
                "c" : "Mark"
            },
            correctAnswer : "c"
        }
        ]

        changeHandler(event){
            console.log("Inside changeHandler");
            // destructuring
            const{name, value} = event.target;
            console.log(name, value);
            this.selected = {...this.selected, [name] : value};
        }

        submitHandler(event){   
            event.preventDefault();
            let correct = this.questionList.filter( (question) => {
               return (question.correctAnswer === this.selected[question.id])
            });
            this.correctAnswers = correct.length;
            console.log('Correct Answer ===> ',this.correctAnswers);
            this.isSubmitted = true;
        }

        resetHandler(){
            this.correctAnswers = 0;
            this.isSubmitted = false;
            console.log('Reset' , this.correctAnswers);
           
            this.selected = {};
            
        }   

        get allNotSelected(){
            return !(Object.keys(this.selected).length === this.questionList.length);
        }

        get isScoredFull(){
            return `slds-text-heading_large ${this.questionList.length === this.correctAnswers?
                 'slds-text-color_success':'slds-text-color_error'}`;
        }

        
}