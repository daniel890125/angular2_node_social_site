import { Component, OnInit } from "@angular/core";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Http, Headers, RequestOptions } from "@angular/http";
import {ActivatedRoute,Router} from '@angular/router'
import 'rxjs/add/operator/map'


@Component({
	selector: "resetpass",
	templateUrl: 'resetpass.component.html',

})
export class ResetPassComponent implements OnInit{
	passform:FormGroup;
    allow:boolean= false;
    userId:string;

	constructor(fb:FormBuilder, public http:Http,private router: Router,private route: ActivatedRoute){
        this.passform = fb.group({
            email : ['',Validators.required],
            password:['',Validators.required],
            confirm_password:['',Validators.required]
        })
    }
    ngOnInit(){
        this.route
      .params
      .subscribe(params => {
        this.userId = params['id'];
        this.http.get('/user/setpass/'+this.userId)
        .map((res:any)=>res.json())
        .subscribe((res:any)=>{
            if(res!=''&& res.message=="success")
                this.allow=true;
        }),(error:any)=>{
            console.log(error);
        }
      })
    }

    searchId() {

        this.http.get('/user/getUser/'+this.userId)
        .map((res: any) => res.json())
			.subscribe(
                (res: any) => {
                    if(res!=''){
                        if(this.passform.value.email != res.local.email) {
                            alert('Unable to reset with this id');
                            this.passform.value.email="";
                        }
                    }else {
                        this.passform.value="";
                        alert('Invalid URL');
                    }
                }

            ),(error: any) => {
					console.log(error);
				}
    }

    reset(){
         if(this.passform.value.password != this.passform.value.confirm_password) {
            alert('Password doesn\'t match');
        }
        else {
            var pass = {
                id:this.userId,
                local:{
                    'email':this.passform.value.email,
                    'password':this.passform.value.password
                }
                // 'local.password':
            }
            console.log(pass);
            this.http.post('/user/reset/',pass)
            .map((res: any) => res.json())
			.subscribe(
                (res: any) => {
                 if(res=='success'){
                     alert('Reset Password Successful');
                     	window.location.href='#/search';
                 }

                }

            ),(error: any) => {
					console.log(error);
				}

        }
    }

}
