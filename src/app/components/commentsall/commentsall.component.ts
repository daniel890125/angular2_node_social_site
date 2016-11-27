import {Component,Input,OnChanges,Output,EventEmitter} from '@angular/core';
import {RatingComponent} from '../rating/rating.component';
import {commentAllFilter} from '../../pipes/filterpipe.commentsall';

@Component({
  selector: "commentall",
	templateUrl: 'commentsall.component.html'
})

export class CommentsAllComponent {
    limit = 2;
    rate:number = 1;
    textValue:string='';
    @Input() comments:any[];
    @Input() Id:string;

    @Input() showComment:boolean;

    constructor(){
        this.rate = 1;
    }

    rateFunction(rating){
        return this.rate;
    }
    incrementLimit(){
       this.limit += 2;
  //      $('html, body').animate({
  //     scrollTop : $(window).scrollTop() + 300
  //  });
    }

    decrementLimit(){
       this.limit -= 2;
  //      $('html, body').animate({
  //    scrollTop : $(window).scrollTop() - 300
  //  });
    }
}
