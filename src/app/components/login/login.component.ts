
import {Component, OnInit,ViewContainerRef,Output,EventEmitter, Input} from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
//import {ContactComponent} from '../contact/contact.component';
import { ShoppingCartService } from '../../service/shoppingCart-service'
import { AddRecordsService } from '../../service/addRecord-service';
import 'rxjs/add/operator/map';
declare var $:any;
// import { Modal, IN_APP_MODAL_PROVIDERS as MODAL_P } from '../common/custom_plugin';

@Component({
	selector: "login",
	templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
    isAlive:boolean = false;
    email:string='';
	role:number=0;
	Id:string ='';
    password:string='';
    invalid:string='';
    display:boolean = false;
	experience_own:any=[];
	data:any;
	@Input() logoutFlag:boolean;


	@Output() roleSet:EventEmitter<number> = new EventEmitter<number>();
	@Output() userIdSet:EventEmitter<string> = new EventEmitter<string>();
	@Output() loginState:EventEmitter<boolean> = new EventEmitter<boolean>();


	_modal = null;
    userrole(){
		alert('user role selected');

    }
		constructor(public http: Http, private shoppingCartService: ShoppingCartService, private addRecordsService:AddRecordsService) {
			// modal.defaultViewContainer = viewContainer;
		}
	 bindModal(modal) {this._modal=modal;}

	 close() {
        this._modal.close();
    }
	loginStatus(){
		this.http.get('/loginStatus',new RequestOptions({ body: '',
			headers: new Headers({"Content-Type": "application/json"})
		}))
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
				this.data = res;
				if(this.data.role!=null && this.data.role!=undefined) {
					this.role = this.data.role;
					this.roleSet.emit(this.role)
					this.userIdSet.emit(this.data.id);
					this.isAlive = true;
					this.logoutFlag = false;
					this.Id=this.data.id;
					if(this.role==1) {
						this.http.get('/exp/ownExp/'+this.Id, new RequestOptions({ body: ''
						}))
						.map((res:any)=>res.json())
							.subscribe(
								(res:any) =>{
                  console.log(res);
									this.experience_own = res;
								}
							)

						// });
					}
				}
				else {
					this.role = null
					this.isAlive = false;
					this.Id=null;
				}
				this.loginState.emit(this.isAlive);
					console.log(this.isAlive+' testing alive status');

			},
			(error: any) => {
				console.log(error);
			}
		);

	}



    getPassword(template){
		// console.log('get password');
        this._modal.open();
		    $('.modal-backdrop.fade.in').css("display","none");
		// this.modal.alert()
        // .title('AngularModal')
        // .templateRef(template)
        // .open();
    }
    signUp() {

    }

  ngOnChanges() {
  	this.logout(this.logoutFlag);
	}
	ngOnInit(){
		this.loginStatus();
	}

    signIn() {
        if(this.email==undefined || this.email=='') {
			alert('Bitte geben Sie eine gültige E-Mail Adresse an');
			return;
		}else if(this.password==undefined || this.password ==''){
			alert('Bitte geben Sie einen gültigen Password ein');
			return;
		}
		this.invalid='';
		var formData = {
			email : this.email,
			password : this.password
		};
        console.log(formData);
        this.http.post('/login',formData)
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
					// console.log(res);
                    if(res=='EXIST')
					    this.invalid = "Ungültige Email / Passwort";
                    else
                        this.loginStatus();
					//console.log(this.response);
				},
				(error: any) => {
					console.log(error);
				}
			);
    }


	logout(flag){
		if(flag) {
			this.http.get('/logout',new RequestOptions({ body: '',
			headers: new Headers({"Content-Type": "application/json"})
		}))
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
                    if(res==='Success')
                       this.loginStatus();
					console.log('Response:'+res);
				},
				(error: any) => {
					console.log(error);
				}
			);
		}
	}


}
