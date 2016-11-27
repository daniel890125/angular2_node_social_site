
import { Component,Input,OnChanges,Output,EventEmitter } from "@angular/core";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Http, Headers, RequestOptions } from "@angular/http";
import 'rxjs/add/operator/map';

@Component({
  selector: "signup",
	templateUrl: 'signup.component.html'
})


export class SignupComponent {
    signform:FormGroup;
    error:string='';
    userExist:string='';
    userNotExist:string = '';

    signUp() {
        // console.log(this.form);
        this.userNotExist = "";
		this.userExist="";
        if(this.signform.value.password!==this.signform.value.confirm_password)
            this.error='true';
        else {
            this.http.post('/signup',this.signform.value)
		.map((res: any) => res.json())
			.subscribe(
                (res: any) => {
                    if(res=='EXIST'){
                        this.userNotExist = "";
					    this.userExist = 'Die E-Mail ist bereits vergeben';
                    }else {
                        this.userExist = "";
                        this.userNotExist = 'Glückwunsch! Sie sind nun registriert und angemeldet!';
                    }
                }

            ),(error: any) => {
					console.log(error);
				}
        }
    }

    constructor(fb:FormBuilder, public http:Http){
        this.signform = fb.group({
            nameMain : ['',Validators.required],
            email : ['',Validators.required],
            password:['',Validators.required],
            confirm_password:['',Validators.required]
        })
    }
}
