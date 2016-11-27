import { Component,Input,OnChanges,Output,EventEmitter,AfterViewInit,ElementRef } from "@angular/core";

import { Http, Headers, RequestOptions } from "@angular/http";

import 'rxjs/add/operator/map'
declare var $: any;

@Component({
    selector: "role",
	templateUrl: 'role.component.html'
})


export class RoleComponent implements AfterViewInit{
	hideModal:boolean = true;
    button:string = "Add";
    footerStatus:string = '';
    email:string=''
    nameMain:string='';
    role:number=0;

	// constructor(private _rootNode: ElementRef,public http:Http) {}

    constructor(public http:Http){
    }

	ngAfterViewInit(){
		// this.modalEl = $(this._rootNode.nativeElement).find('div.modal');
	}

	// open() {
    //     this.modalEl.modal('show');
    // }

    // close() {
    //     this.modalEl.modal('hide');
    // }

    searchId(){
        this.http.get('/user/fetchRecord/'+this.email)
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
				if(res!='') {
                    console.log(res);
                    alert(res.local.nameMain);
                    // this.form.value.nameMain = res.local.nameMain;
                    // this.form.value.role = res.role.toString();
                    this.nameMain = res.local.nameMain;
                    this.role = res.role;
                    this.button='Update';
                    this.footerStatus='Record found and Retrieved';
                }else{
                    this.nameMain='';
                    this.button='Add';
                    this.role = 0;
                    this.footerStatus='No Record Found';
                }
                },(error: any) => {
				    console.log(error);
			});
    }

    update(){
        var admin={
             local:{
                email:this.email
            },
            nameMain: this.nameMain,
            role:this.role
        }
        if(this.button=='Update') {
            this.http.put('/user',admin)
		.map((res: any) => res.json())
			.subscribe(
				(res: any) => {
                    if(res=='success')
                        this.footerStatus='Updated Successfully';
                    else
                        this.footerStatus='Not Updated';
                },(error:any) =>{
                    console.log(error);
                });

        }else {
            this.http.post('/user',admin)
            .map((res: any) => res.json())
                .subscribe(
                    (res: any) => {
                        if(res)
                            this.footerStatus='Added User Information Successfully';

                    },(error:any) =>{
                        console.log(error);
                    });
        }

    }

}
