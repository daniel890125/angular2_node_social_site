import {Component, Input,OnInit, Output, EventEmitter} from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {  Router } from '@angular/router';
import {DatepickerComponent} from '../datepicker/my-date-range-picker.component';
import {expDaysComponent} from '../expdays/expdays.component';
import {Observable} from 'rxjs/Rx';
import {FacebookService, FacebookLoginResponse, FacebookInitParams} from '../ng2-facebook-sdk/dist';
declare var $:any;

@Component({
	selector: "profile",
	templateUrl: 'profile.component.html',
	providers: [FacebookService]
})

export class ProfileComponent implements OnInit {
access_token:string='';
	APP_ID:string='544098965798466';

	Id:string ='';
	data:any;
	Name:string='';
	Age:string='';
	Job:string='';
	Description:string='';
	isAgeEdit:boolean=false;
	isNameEdit:boolean=false;
	isJobEdit:boolean=false;
	isDescriptionEdit:boolean=false;
	MatchString:string='';
	loged:boolean = false;
	token:string='';
	files:any;
	daterange:any;
	experienceOwn:any;
	totalDisplayed:number = 10;
	wishlist:Object[];
	friendlist:Object[];
	userlist:Object[];
	visiterlist:Object[];
	searchedlist:Object[];
	fbFriendList:Object[];
	editform:FormGroup;
	searchform:FormGroup;
	// facebook:any;

	@Input() profileId:string[];
	@Input() dataRecords:any[];
  @Input() userId:string;
	@Output() refreshPage:EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() logout:EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(public http: Http,private router:Router, fb:FormBuilder, private facebook:FacebookService){
		this.editform = fb.group({
            Name : [''],
            Age : [''],
            Job : [''],
            Description : ['']
        })
		this.searchform = fb.group({
            MatchString : ['']
        })

		let fbParams: FacebookInitParams = {
                                   appId: this.APP_ID,
                                   cookie:true,
																	 status:true,
                                   xfbml: true,
                                   version: 'v2.6'
                                   };
    this.facebook.init(fbParams);
	}

	ngOnChanges() {
		this.experienceOwn = this.dataRecords;
		this.Id = this.userId;
	}
	ngOnInit() {
		this.http.get('/isUserLogin').map((res: any) => res.json())
			.subscribe(
				(res: any) => {
				 this.data = res;
					if(res=='notLoggedIn'){
						this.router.navigate(['/']);
					}else{
						//logged in user object available here
						var initVal = {
														Name : '',
													 	Age : '',
													 	Job : '',
													 	Description : ''
													};

							if(this.data) {
								this.Id=this.data._id;
							  this.Name = this.data.local.nameMain.toUpperCase();
							  initVal.Name = this.data.local.nameMain;
							}
						  if(this.data.age) {
						  	this.Age = this.data.age;
						  	initVal.Age = this.Age;
						  }
						  if(this.data.job) {
						  	this.Job = this.data.job;
						  	initVal.Job = this.Job;
						  }
						  if(this.data.description) {
						  	this.Description = this.data.description;
						  	initVal.Description = this.Description;
						  }
					(<FormGroup>this.editform).setValue(initVal, {onlySelf: true});
						console.log(res);
					}

				});
			this.loadWishList();
			this.loadFriendList();
			this.loadUserList();
			this.loadVisiterList();
	}



myOptions: any = {
activateWeekend: true // or false
}
dateRangeChanged($event) {
this.daterange = $event;
console.log(this.daterange.formatted); // includes ranges changed
}


	profileImageRemove(){
		//alert('Removed');
		this.http.get('/image/removeProfileImage/'+this.Id,new RequestOptions({ body: '',
			headers: new Headers({"Content-Type": "application/json"})
		}))
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
					if(res=='success') {
						alert('Removed Profile Image successully.');
						this.refreshPage.emit(true);
					}

				},
				(error: any) => {
					console.log(error);
				}
			);
	}

	onFileSelect(event){
		this.files = event.srcElement.files[0];
		if ((this.files.type === 'image/jpeg') || (this.files.type === 'image/png')) {
			console.log('profile image name: ' + this.files.name);
				if (this.files.size > 200000) {
					alert(this.files.name + ' size exceeds more than 200 KB ');
					return;
				}
			} else {
				alert(this.files.name + ' invalid image');
				return;
			}
		var data = new FormData();
		data.append("file",this.files);

		data.append("userid",this.Id);
		data.append("type",this.files.type);
		$.ajax({
						url: './image/addprofileimage',
						type: 'POST',
						data: data,
						contentType: false,
						processData: false,
						success: function(data) {
				alert('Profile Image replaced')
								console.log(JSON.stringify(data));
						},error: function (error) {
							alert("error in ajax form submission");
							console.log(error);
					}
				});
	}


	loadWishList() {
		let filterObj:any = {
			'userId':this.Id,
			'limit':this.totalDisplayed
		};


		let paths = ['wishlist'];

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				this.wishlist = data[0].records;
			},
			err => console.error(err)
		);
	}

	loadFriendList() {
		let filterObj:any = {
			'userId':this.Id,
			'limit':this.totalDisplayed,
			'type':'friendlist' 
		};

		let paths = ['relationlist'];

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				this.friendlist = data[0].records;
				this.searchedlist = data[0].records;
			},
			err => console.error(err)
		);
	}

	loadUserList() {
		let filterObj:any = {
			'userId':this.Id,
			'limit':this.totalDisplayed
		};


		let paths = ['user'];

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				this.userlist = data[0].records;
			},
			err => console.error(err)
		);
	}

	loadUser() {
		this.http.get('/user/getUser/'+this.Id)
		        .map((res: any) => res.json())
		            .subscribe(
		                (res: any) => {
		                if(res.local!=undefined)
		                    this.Name = res.local.nameMain;
		                else
		                		this.Name = '';
		                if(res.age!=undefined)
		                    this.Age = res.age;
		                else
		                		this.Age = '';
		                if(res.job!=undefined)
		                    this.Job = res.job;
		                else
		                		this.Job = '';
		                if(res.description!=undefined)
		                    this.Description = res.description;
		                else	
		                		this.Description = '';

		            },
		            (error: any) => {
		                console.log(error);
		            }
		        );
	}

	removeWishList(recId){
		let filterObj:any = {
			'recId' : recId,
			'userId' : this.Id,
			'dispNum':this.totalDisplayed
		};


		let paths = ['removeWishList'];

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				this.wishlist = data[0].records;
			},
			err => console.error(err)
		);
	}

	changeFriendList(friendId){
		let filterObj:any = {
			'userId' : this.Id,
			'friendId' : friendId,
		};


		let paths = ['changeFriendList'];

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				this.loadFriendList();
			},
			err => console.error(err)
		);
	}

	loadMore(val:number){
		this.totalDisplayed += val;
		this.loadWishList();
	}

	showFriendProfile(friendId){
		this.Id = friendId;
		console.log("showProfile caughted - " + friendId);
		// this.refreshPage.emit(true);
		this.loadUser();
		this.loadWishList();
		this.loadFriendList();
		this.loadUserList();
		this.changeVisiter(friendId, 'add');
	}

/*---------------------------------------------------
addes or removes the My userId to the visiter's visiterlist.

	userId: 		ID which is now I am visiting.
	visiterId: 	My ID

*/
	changeVisiter(visiterId, type){
		if (this.Id == this.userId)
			return;
		var updateObj = {
											userId : visiterId,
											visiterId : this.userId, 
											updateType : type
										};
		this.http.post('/api/setuser', updateObj).map((res: any) => res.json())
					.subscribe((res: any) => {
						console.log(res);
						this.profileId.push(this.Id);
					}, (error: any) => {
             console.log(error);
          });
	}

	loadVisiterList(){
		let filterObj:any = {
			'userId':this.Id,
			'limit':this.totalDisplayed,
			'type':'visiterlist' 
		};

		let paths = ['relationlist'];

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json());
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				this.visiterlist = data[0].records;
			},
			err => console.error(err)
		);
	}

	saveProfile(type){
		var updateObj = {userId : this.Id, 
										 name : this.editform.value.Name,
										 job : this.editform.value.Job, 
										 age: this.editform.value.Age,
										  description : this.editform.value.Description};
		this.http.post('/api/setuser', updateObj).map((res: any) => res.json())
							.subscribe((res: any) => {
								console.log(res);
							}, (error: any) => {
                 console.log(error);
              });

		if(type == 'name') {
			console.log("Type : " + type + "\nName : " + this.editform.value.Name);
			this.isNameEdit = false;
		}
		if(type == 'job') {
			console.log("Type : " + type + "\nJob : " + this.editform.value.Job);
			this.isJobEdit = false;
		}
		if(type == 'age') {
			console.log("Type : " + type + "\nAge : " + this.editform.value.Age);
			this.isAgeEdit = false;
		}
		if(type == 'description') {
			console.log("Type : " + type + "\nDescription : " + this.editform.value.Description);
			this.isDescriptionEdit = false;
		}

		this.syncValue();
	}

	syncValue(){
		var initVal;

	  if(this.editform.value.Name) {
	  	this.Name = this.editform.value.Name;
	  }
	  if(this.editform.value.Job) {
	  	this.Job = this.editform.value.Job;
	  }
	  if(this.editform.value.Age) {
	  	this.Age = this.editform.value.Age;
	  }
	  if(this.editform.value.Description) {
	  	this.Description = this.editform.value.Description;
	  }

	}

	isFriend(uid){
		if(this.friendlist != undefined) {
			for (var i = 0; i < this.friendlist.length; i++){
				var user = this.friendlist[i];
				if (user['_id'] == uid)
					return true;
			} 
		}
		return false;
	}

	isVisiting(){
		return this.Id != this.userId;
	}

	profileRemove() {
		this.profileImageRemove();
		
		var updateObj = {userId : this.userId};

			this.http.post('/api/removeuser', updateObj).map((res: any) => res.json())
							.subscribe((res: any) => {
								console.log(res);
								this.logout.emit(true);
							}, (error: any) => {
                 console.log(error);
      });

			this.Name = '';
			this.Age = '';
			this.Description = '';
			this.Job = '';
	}

	search() {
		this.MatchString = this.searchform.value.MatchString;
		this.searchedlist = [];
		
		if(this.friendlist != undefined) {
			for (var i = 0; i < this.friendlist.length; i++){
				var user = this.friendlist[i];
				
				if(this.isMatchSearch(user))
					this.searchedlist.push(user);
			} 
		}
	}

	isMatchSearch(user) {
		if (this.MatchString == '') 	
			return true;

		console.log(user['local']['nameMain'] + " (" + user['local']['nameMain'].indexOf(this.MatchString) + ")");
		console.log(user['description'] + " (" + user['description'].indexOf(this.MatchString) + ")");
		console.log(user['job'] + " (" + user['job'].indexOf(this.MatchString) + ")");


		if (user['local']['nameMain'].indexOf(this.MatchString) != -1)
			return true;
		if (user['description'] != undefined && user['description'].indexOf(this.MatchString) != -1)
			return true;
		// if (user['age'] != undefined && (user['age']+'').indexOf(this.MatchString) != -1)
		// 	return true;
		if (user['job'] != undefined && user['job'].indexOf(this.MatchString) != -1)
			return true;

		return false;
	}

	login(){
		this.facebook.login().then(
      (response: FacebookLoginResponse) => {
      	console.log(response);

      	// if(response.status == 'connected') {
      	// 	var host = 'https://graph.facebook.com';
      	// 	this.access_token = response.authResponse.accessToken;
      	// 	var path = host + '/v2.8/' + response.authResponse.userID +'/friends?access_token=' + this.access_token;

      	// 	this.http.get(path)
      	// 	.map((res: any) => res)
				   //  .subscribe((data : any) => {
				   //  	console.log(data);

				   //  	var path1 = 'https://graph.facebook.com/v2.8/me/messages?access_token=' + this.access_token;
				   //  	var option = {
							// 						  "recipient":{
							// 						    "id":"123875828089064"
							// 						  },
							// 						  "message":{
							// 						    "text":"hello, world!"
							// 						  }
							// 						};
				   //  	this.http.get(path1)
				   //  	.map((res: any) => res)
				   //  	.subscribe((data: any) => {
				   //  		console.log("message result : " + data);
				   //  	});
				   //  });


						this.facebook.ui({
								method: 'apprequests',
								message: 'localhost:4200/profile'
								});

      // 	} else {

      // 	}
      },
      (error: any) => console.error(error)
  	);
	}
}
