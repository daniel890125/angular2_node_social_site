import { Component,Input,OnChanges,Output,EventEmitter,AfterViewInit,ElementRef } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import 'rxjs/add/operator/map'
declare var $: any;

@Component({
    selector: "forgotpass",
	templateUrl: 'forgotpass.component.html'

})


export class PasswordComponent implements AfterViewInit{
	modalEl = null;
	hideModal:boolean = true;
	email:string = '';
	constructor(private _rootNode: ElementRef,public http:Http) {}

	ngAfterViewInit(){
		this.modalEl = $(this._rootNode.nativeElement).find('div.modal');
	}

	open() {
        this.modalEl.modal('show');
    }

    close() {
        this.modalEl.modal('hide');
    }
	fetchPassword(){
		this.http.get('/user/fetchpass/'+this.email,new RequestOptions({ body: '',
			headers: new Headers({"Content-Type": "application/json"})
		}))
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
					if(res=='success') {
						alert('Ihr Passwort wurde soeben an Ihre E-Mail verschickt');
						this.modalEl.modal('hide');
					}
					else
					alert('Bitte geben Sie eine gültige E-Mail ein');
				},
				(error: any) => {
					console.log(error.json());
				}
			);
	}

}
