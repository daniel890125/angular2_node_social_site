import { Component } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
declare var $:any;

@Component({
    selector: "contact",
    templateUrl: 'contact.component.html'
})
export class ContactComponent {
    contactform:FormGroup;

    constructor(fb:FormBuilder, public http:Http){
        this.contactform = fb.group({
            grund:['',Validators.required],
            name:['',Validators.required],
            email:['',Validators.required],
            nachricht:['',Validators.required]
        })
    }

    sendMessage(){
        $('#sendMessage-modal').modal('hide');
        this.http.post('/api/sendMessage',this.contactform.value)
        .map((res:any)=>res.json())
			.subscribe((res:any)=>{
                if(res=='success') {
                    alert('Successfully delivered');
                }
            })
    }
}
