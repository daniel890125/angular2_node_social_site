import {Component,Input,OnChanges,Output,EventEmitter} from '@angular/core';
import {RatingComponent} from '../rating/rating.component';
import { Http, Headers, RequestOptions } from "@angular/http";
import {commentFilter} from '../../pipes/filterpipe';
import {CommentsAllComponent} from '../commentsall/commentsall.component';
import { ShoppingCartService } from '../../service/shoppingCart-service'
import {Observable} from 'rxjs/Rx';

@Component({

    selector: "comment",
    templateUrl: 'comments.component.html',
})

export class CommentsComponent implements OnChanges{

    rate:number;
    textValue:string='';
    alive:boolean = false;
    id:string;
    data:any;
    _id:string;
    nameMain:string;
    role:number;
    countLikeSum:number = 0;
    countDislikeSum:number = 0;
    status:string = 'undefined';  // -1:undefined, 0:dislike, 1:like
    @Input() countCommentSum:any[];
    @Input() comments:any[];
    @Input() rec:any;
    @Input() isAlive:boolean;
    showComment:boolean = false;
    showComment2:boolean = false;
    @Output() commentStatus:EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() refreshComments:EventEmitter<boolean> = new EventEmitter<boolean>();

    // @Input showComment:boolean;
    constructor(public http: Http, private shoppingCartService: ShoppingCartService) {
        this.rate = 1;
    }



    hideComment(){
        this.showComment = false;
        this.commentStatus.emit(this.showComment);
    }

    hideDetails(){
        this.showComment2 = false;

    }




    addComments(){

        this.http.get('/user/getUser/'+this.id)
        .map((res: any) => res.json())
            .subscribe(
                (res: any) => {
                if(res.local!=undefined)
                    this.nameMain = res.local.nameMain;
                else if(res.facebook!=undefined)
                    this.nameMain = res.facebook.name;
                else if(res.twitter!=undefined)
                    this.nameMain = res.twitter.displayName;
                else if(res.google!=undefined)
                    this.nameMain = res.google.name;

                var formData = {
                    namePerson : this.nameMain,
                    star : this.rate,
                    commentsData : this.textValue,
                    token : this.id,
                    objectID : this.rec._id
                };

                this.http.post('/api/comments/',formData)
                .map((res: any) => res.json())
                    .subscribe(
                        (res: any) => {
                            this.refreshComments.emit(true);
                            this.textValue='';
                            this.rate=1;
                        },(error: any) => {
                            console.log(error);
                });

                this.http.post('/api/postReviewTotal/',formData)
                .map((res: any) => res.json())
                    .subscribe(
                        (res: any) => {

                        },(error: any) => {
                            console.log(error);
                });

            },
            (error: any) => {
                console.log(error);
            }
        );

    }

    ngOnChanges() {
        this.alive = this.isAlive

        this.http.get('/loginStatus',new RequestOptions({ body: '',
            headers: new Headers({"Content-Type": "application/json"})
        }))
        .map((res: any) => res.json())
            .subscribe(
                (res: any) => {
                this.data = res;

                if(this.data.role!=null && this.data.role!=undefined) {
                    // console.log(this.role);
                    this.isAlive = true;
                    this.id=this.data.id;
                }
                else {
                    this.role = null
                    this.isAlive = false;
                    this.id=null;
                }
                this.loadLikeStatusList();
                    // console.log(this.isAlive+' testing alive status');
            },
            (error: any) => {
                console.log(error);
            }
        );

    }
    rateFunction(rating){
        return this.rate;
    }
    rateVal(val){
        this.rate = val;
        console.log('changed Rate: '+val);
    }
    addToCart(rec) {
    var item = { id: rec._id, description: rec.description, quantity: 1, price: rec.price, currency: rec.currency };
    var existingItem = this.shoppingCartService.cartItems.find(p => p.id == item.id);
    if (existingItem)
        existingItem.quantity += 1;
    else
        this.shoppingCartService.cartItems.push(item);
    }

    loadLikeStatusList() {
        let filterObj:any = {
            'userId':this.id,
            'recId':this.rec._id
        };


        let paths = ['likelistsum'];

        const self = this;
        const requests = paths.map(function (path) {
            return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
        });

        Observable.forkJoin(requests).subscribe(
            data => {
                if (data != undefined) {
                    this.countLikeSum = data[0]['likeSum'];
                    this.countDislikeSum = data[0]['unlikeSum'];
                    this.status = data[0]['status'];
                } else {
                    this.status = 'undefined';
                }
                if (this.countLikeSum == undefined)
                    this.countLikeSum = 0;
                if (this.countDislikeSum == undefined)
                    this.countDislikeSum = 0;
            },
            err => console.error(err)
        );
    }

    addLike(){
      if(this.rec._id != undefined && this.id != undefined){

      this.http.post('/api/saveLikeList',{'recId':this.rec._id,'userId':this.id})
      .map((res:any)=>res.json())
        .subscribe((res:any)=>{
          this.loadLikeStatusList();
          console.log('success!');
        });
      }
    }

    addDislike(){
      if(this.rec._id != undefined && this.id != undefined){

      this.http.post('/api/saveUnlikeList',{'recId':this.rec._id,'userId':this.id})
      .map((res:any)=>res.json())
        .subscribe((res:any)=>{
          this.loadLikeStatusList();
          console.log('success!');
        });
      }
    }
}
