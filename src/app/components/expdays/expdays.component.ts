import { Component,Input, OnInit, OnChanges,Output,EventEmitter } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import {CommentsComponent} from '../comments/comments.component';
import {Observable} from 'rxjs/Rx';
import {CommentsAllComponent} from '../commentsall/commentsall.component';
import {commentFilter} from '../../pipes/filterpipe';
import {RatingComponent} from '../rating/rating.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import 'rxjs/add/operator/map'
declare var $:any;

@Component({
    selector: "expdays",
	templateUrl: 'expdays.component.html'
})


export class expDaysComponent implements OnChanges,OnInit{
	files:any='';
	@Input()isWishList:boolean = false;
	editform:FormGroup;
	@Input() expdays:any[];
	@Input() userId:string;
	@Input() alive:boolean;
	response: any;
	experiences_days:any;
	isAlive:boolean = false;
	data: any;
	error: any;
	showComment:boolean=false;
	@Input() admin:boolean;
    @Input() role:number;
	@Input() message:boolean;
	@Output() refreshPage:EventEmitter<boolean>= new EventEmitter<boolean>();
	comments:any[];
  wishlistData:any[];
	countCommentSum:any[];
	experienceId:string='';

	@Output() moreClicked:EventEmitter<number> = new EventEmitter<number>();
	@Output() removeClicked:EventEmitter<string> = new EventEmitter<string>();

	constructor(public http: Http,public fb:FormBuilder) {

		this.editform = fb.group({
            title : ['',Validators.required],
            description : ['',Validators.required],
            images:['',Validators.required],
			_id:['',Validators.required]
        })

	}

	ngOnInit(){
		this.refreshComments(true);
		// console.log(this.userId);
	}


	refreshComments(boolVal){

		console.log('Test refresh comments');
		this.http.get('/api/getComments/')
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
					this.comments = res;
				},
				(error: any) => {
					console.log(error.json());
				}
			);


		this.http.get('/api/getCommentsSum/')
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
					this.countCommentSum = res;
				},
			(error: any) => {
				console.log(error.json());
			}
		);
	}

	ngOnChanges() {
		this.isAlive = this.alive;
		// alert('change detected');
		this.experiences_days = this.expdays;
		this.loadWishStatusList();
	}

	loadMore(){
		this.moreClicked.emit(5);
	}

	removeWishList(recId){
		this.removeClicked.emit(recId);
	}

	deleteAcc(val){
		this.http.get('/exp/deleteExperiences/'+val)
		.map((res:any)=>res.json())
			.subscribe((res:any)=>{
				this.refreshPage.emit(true);
			})
	}

	editData(){
		$('#edit_modal').modal('hide');
		this.http.post('/exp/editData',this.editform.value)
		.map((res:any)=>res.json())
			.subscribe((res:any)=>{
				this.refreshPage.emit(true);
			})
	}

	Insert(val){
		this.experienceId = val;
		this.http.get('/exp/imageCount/' + val)
		.map((res:any)=>res.json())
			.subscribe((res:any)=>{
				$('#insertImg_modal').modal('show');
			})
	}
	edit(val){
		// alert(val);
		this.http.get('/exp/edit/'+val)
		.map((res:any)=>res.json())
			.subscribe((res:any)=>{
				// this.refreshPage.emit(true);
				console.log(res);
				this.editform.controls['title'].setValue(res.title);
				this.editform.controls['description'].setValue(res.description);
				this.editform.controls['images'].setValue(res.images[0]);
				this.editform.controls['_id'].setValue(res._id);
				$('#edit_modal').modal('show');
			})

	}

	onFileSelect(event){

    	var target = event.target || event.srcElement;
   		this.files = target.files;
        var file;
			if (this.files.length > 3) {
				alert('More than 3 files are selected');
                this.files=[];
				return;
			}

			for (var i = 0; i < this.files.length; i++) {
				file = this.files[i];
				if ((file.type === 'image/jpeg') || (file.type === 'image/png')) {
					console.log('File name: ' + file.name);
					//$scope.upload.contentType = file.type;
					//$scope.upload.filename = file.name;
					$('#uploadSucces').append("<div class='alert alert-success' class='successUp' role='alert'>File " + file.name + " will be uploaded!</div>");
					$('#dropzone').removeClass('hover');
					$('#dropzone').addClass('dropped');
					$('#dropzone img').remove();
					if (file.size > 200000) {
						alert(file.name + ' size exceeds more than 200 KB ');
                        this.files=[];
						return;
					}
				} else {
					alert(file.name + ' invalid image');
                    this.files=[];
					return;
				}
			}

        console.log(this.files[0]);
    }

	insertImage(){
		if(this.files!==''){
			var data = new FormData();
			var upload = {
				experienceId : this.experienceId
			}
			for(var i=0; i<this.files.length; i++)
				data.append("file",this.files[i]);
			data.append("obj",JSON.stringify(upload));
			this.http.post('/image/add',data)
			.map((res:any)=>res.json())
			.subscribe((res:any)=>{
				if(res=='success'){
					this.files='';
					$('#insertImg_modal').modal('hide');
					alert("Uploaded successfully");
					this.refreshPage.emit(true);
				}
			})

		}
		else
			alert('No file selected');
	}

	commentStatus(val){
		this.showComment = val;
	}

	wishlist(recId, userId){
	  if(recId != undefined && userId != undefined){

	  this.http.post('/api/saveWishlist',{'recId':recId,'userId':userId})
	  .map((res:any)=>res.json())
	    .subscribe((res:any)=>{
	      this.loadWishStatusList();
	      console.log('success!');
	    });
	  }
	}

	loadWishStatusList(){
		this.wishlistData = [];
		let filterObj:any = {
			'userId':this.userId
		};


		let paths = ['wishlist'];

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				if (data[0] != 'nofield')
					this.wishlistData = data[0]['records'];
				else
					this.wishlistData = [];
			},
			err => console.error(err)
		);
	}

	isWishItem(recId){
		for(var i = 0 ; i < this.wishlistData.length; i++){
			if (this.wishlistData[i]['_id'] == recId)
				return true;
		}
		return false;
	}


}
