import { Component,Input,OnChanges } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import {Advertise} from '../../pipes/advertise.pipe';
import 'rxjs/add/operator/map'

@Component({
  selector: "advertise",
	templateUrl: 'advertise.component.html'
})

export class advertiseComponent implements OnChanges{
	experiences_days_shuffle:any[] = [{}] ;
	response: any;
	data: any;
	error: any;
  category_search:string='';

	@Input() catSearch:string='';
  @Input() expDays:any[];

	constructor(public http: Http) {

	}
	ngOnChanges() {
		this.category_search = this.catSearch;
    this.experiences_days_shuffle = this.expDays;
	}
}
