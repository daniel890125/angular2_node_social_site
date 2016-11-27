
import { Component,Input,OnChanges,Output,EventEmitter,NgZone  } from "@angular/core";
// import {Control,ControlGroup,Validators,FormBuilder} from "@angular/common";

import { Http, Headers, RequestOptions } from "@angular/http";
import { AddRecordsService } from '../../service/addRecord-service';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {DatepickerComponent} from '../datepicker/my-date-range-picker.component';

import 'rxjs/add/operator/map'
declare var $:any;

@Component({
  selector: "record",
	templateUrl: 'record.component.html'
})


export class RecordComponent implements OnChanges {
    recordform:FormGroup;
    usrId:string;
    error:string='';
    userExist:string='';
    userNotExist:string = '';
    files:any='';
    public opentab = false;
    public form;
    @Input() userId:string;
    //@Output() refreshPage:EventEmitter<boolean> = new EventEmitter<boolean>();




    myOptions: any = {
activateWeekend: true // or false
}

dateRangeChanged($event) {
console.log($event); // includes ranges changed
}
    saveExperiences() {
        this.recordform.controls['user'].setValue(this.userId);
        var data = new FormData();

        data.append("obj",JSON.stringify(this.recordform.value));
        for(var i=0; i<this.files.length; i++)
            data.append("file",this.files[i]);

            this.http.post('/image/experience',data)
			.map((res:any)=>res.json())
			.subscribe((res:any)=>{
				// if(res=='success'){
					this.files='';
					//$('#myModal').modal('hide');
					alert("Added Record successfully");
          location.reload();
					//this.refreshPage.emit(true);
				// }
			}),(error:any)=>{
                    console.log(error);
                }

    }

    ngOnChanges() {
        console.log('Changes userid: '+this.userId);
		this.usrId = this.userId;
	}


        constructor(public fb:FormBuilder, public http:Http, private addRecordsService:AddRecordsService){

        this.recordform = fb.group({
        category : ['',Validators.required],
        specCategory : ['', Validators.required],
        amountProduct:['', Validators.required],
        price:  ['',Validators.required],
        currency:   ['',Validators.required],
        companyName:['',Validators.required],
        email:['',Validators.required],
        address:['',Validators.required],
        nr:['',Validators.required],
        postcode:['',Validators.required],
        city:['',Validators.required],
        country:['',Validators.required],
        title:['',Validators.required],
        description:['',Validators.required],
        leistung:['',Validators.required],
        dauer:['',Validators.required],
        offerDate:['',Validators.required],
        user:[this.userId],
        worldwide : [''],
        test:['', Validators.required]


   });

        this.recordform.removeControl('test');



        }

        onChange(val){
        if(val == true){
        this.opentab = true;
        this.recordform.addControl('test', new FormControl('', Validators.required));
        }else{
        this.opentab = false;
        this.recordform.removeControl('test');



        }

        }
    options: Object = {
    url: '/image/experience'
    // obj : this.form.value
  };

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



}
