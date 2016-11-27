import { Component,OnInit,Output,EventEmitter,HostListener,ElementRef,Inject,ChangeDetectorRef,ChangeDetectionStrategy } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { AddRecordsService } from '../../service/addRecord-service';
import { ShoppingCartService } from '../../service/shoppingCart-service'
import {expDaysComponent} from '../expdays/expdays.component';
import {advertiseComponent} from '../advertise/advertise.component';
import {SharedService} from '../../service/SharedService';
import {LoginComponent} from '../login/login.component';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Rx';
import {AutocompleteService} from '../../service/autocomplete.service';
import {Places} from '../../pipes/places.pipe';
import {ProfileComponent} from '../profile/profile.component';


@Component({
	selector: "search",
	host: {'(document:click)': 'hideAutocomplete($event)'},
	templateUrl: 'search.component.html'
})

export class SearchComponent implements OnInit{
	//@HostListener('window:scroll', ['$event'])
	loading:boolean = true;
	profileId:string[] = [];
	place:string = '';
	totalDisplayed:number = 10;
	place_search:string='';
	public miles:number=20;
	public specspeccat:string;
	response: any;
	price:number=0;
	public item;
	term:string="";
	data: any;
	error: any;
	role: number;
	scrollTop:boolean=false;
	rangeStart:number=0;
	rangeEnd:number=0;
	filteredRecords:number =0;
	private categoryDefault:string;
	category_search:string;
	exp_search:any[];
	specCategory_search:string='Unterkategorie';
	adminTab:boolean = false;
	profileTab:boolean = false;
	sharedObj:Object;
	userId:string;
	isAlive:boolean = false;
	elementRef:any;
	public items:any[];
	public lat=0;
	public long=0;
	priceSlide:boolean=false;
	min:number=0;
	max:number=0;
	public closeIcon;
	public wrapper;
    public noplacefound;
    public rangeDropdown;
    public categoryDropdown;
    public subcategoryDropdown;
		public service;

		logoutFlag:boolean = false;


	public specItems:string[];


	private prevFilter:any = null;
    exp_search_adv:any[];
    notifier:Observable<any>;
		hideSubSubCat:boolean = false;

		constructor(public http: Http,service:SharedService,private autocomplete:AutocompleteService,myElement: ElementRef,private shoppingCartService:ShoppingCartService, private addRecordsService:AddRecordsService) {
			this.elementRef = myElement;

		    this.service=service;




	    }




	onScroll(event){
		if(window.scrollY > 100)
			this.scrollTop= true;
		else
			this.scrollTop= false;
	}

	toTop(){

		window.scrollTo(0,0);

	}
    adminClick() {
		this.adminTab = true;
	}
	profileClick(){
			this.profileTab = true;

	}
	search(term) {
        this.term= term;
        this.autocomplete.search(term).then(this.parseSearchResponse.bind(this));
    }
    parseSearchResponse(res) {

        this.items =res;
       this.noplacefound= (this.items.length == 0) ? true : false;
    }
	selectPlace(item){
	this.hideSubSubCat = false;
		this.place_search=item.placename;
		this.lat= Number(item.lat);
		this.long= Number(item.lon);

		if(item.city!=item.placename)
			this.specspeccat=item.specspeccat;
		else
			this.specspeccat='';

		this.item=item;
        this.place = item.city;
		this.items = [];
		this.toggleRangeDropdown();



        this.showRemoveIcon();

        this.elementRef.nativeElement.querySelector("select.categorydd").focus();


		setTimeout(this.changeQuery(),20);



	}



	changeRange(event){
             this.miles = + event.target.value;
			 this.specspeccat='';
             this.changeQuery();
	}
	onSliderChange(data:any):void {
		this.rangeStart = data.min;
		this.rangeEnd = data.max;

		this.changeQuery();
    }

	ngOnInit() {


             var search_item= this.service.getFullPlace();
		     if(search_item != "undefined"){

                this.place_search = search_item.placename || "";
                this.item=search_item;

            }
            else{

            	   this.place_search = this.service.getPlace();
            	   this.item.is_city=false;
            	   this.item.placename="";
            }




        this.category_search = this.categoryDefault = this.service.getCategory();
		this.initPriceBoundaries();

		this.wrapper = this.elementRef.nativeElement.querySelector("div.location-inner-wrap");
        this.closeIcon = this.elementRef.nativeElement.querySelector("span.search-close-icon");
        this.rangeDropdown = this.elementRef.nativeElement.querySelector("select.miles_select");
        this.categoryDropdown = this.elementRef.nativeElement.querySelector("select.categorydd");
        this.subcategoryDropdown = this.elementRef.nativeElement.querySelector("select.subcategorydd");

        this.toggleRangeDropdown();

        let _self =this;
         this.showRemoveIcon();
         setTimeout(function(){ _self.toggleRangeDropdown(); _self.changeQuery()},10);;

	}

	toggleRangeDropdown(){
		 let _self= this;

		 setTimeout(function(){

		 	_self.subcategoryDropdown = _self.elementRef.nativeElement.querySelector("select.subcategorydd");
		         if(_self.item.is_city == true){
		             _self.rangeDropdown.removeAttribute("disabled");
		             _self.categoryDropdown.removeAttribute("disabled");

		             if(_self.subcategoryDropdown !=null)
		               _self.subcategoryDropdown.removeAttribute("disabled");

		         }
		         else{
		               _self.rangeDropdown.setAttribute("disabled","disabled");
		               _self.miles=20;
		               _self.category_search="Alle Kategorien";
		               _self.specCategory_search="Unterkategorie";
		               _self.categoryDropdown.setAttribute("disabled","disabled");
		               if(_self.subcategoryDropdown !=null)
		               _self.subcategoryDropdown.setAttribute("disabled","disabled");
		             }

				 },100);
	}

	public changeSpecSpecItem(newVal:string):void {
		// console.log(newVal);
		// console.log(this.specspeccat);
		this.specspeccat = newVal;
		this.changeQuery();
	}




	private initPriceBoundaries():void {
		 this.http.get('/api/getMinMax').map((res: any) => res.json())
			.subscribe(
				(res: any) => {
					if (res.min > 0) {
						this.min = res.min;
					}
					if (res.max > 0) {
						this.max = res.max;
					}
					this.priceSlide = true;
				});
	}



	changeQuery() {

		if(this.place_search==undefined)
			this.place_search = "";
		//if(this.place=="" && this.place_search.search(",")==-1)
			this.place = this.place_search;
		 if(this.place_search.search(",")!=-1)
			this.place = this.place_search.split(",")[0];



        // console.log('place: '+this.place ,this.item);
		let filterObj:any = {
			'category':this.category_search,
			'city' : this.place,
			'limit' : this.totalDisplayed,
			'price': this.price,
			'spec' : this.specCategory_search,
			'stPrice':this.rangeStart,
			'endPrice':this.rangeEnd,
			'lat': this.lat,
			'lon': this.long,
			 "item":this.item || {} ,
			'specspeccat':this.specspeccat,
			'miles' : this.miles
		};





		let paths = ['load'];


		if (this.category_search == this.categoryDefault && (!this.prevFilter
            || this.category_search != this.prevFilter.category)) {
			paths.push('loadAdvertise');
		}


		if (this.isFilterChanged()) {
		    //  console.log("chagnese")
			filterObj.priceBoundaries = true;
			filterObj.stPrice = 0;
			filterObj.endPrice = 0;

		}

		const self = this;
		const requests = paths.map(function (path) {
			return self.http.post('/api/' + path, filterObj).map((res: any) => res.json()
		);
		});

		Observable.forkJoin(requests).subscribe(
			data => {
				if (data[0].priceBoundaries) {
					this.min = data[0].priceBoundaries.min;
					this.max = data[0].priceBoundaries.max;
					this.rangeStart = this.min;
		      this.rangeEnd = this.max;
				}

				this.data = data;
				this.exp_search = data[0].records;

				this.filteredRecords = data[0].count;
					this.loading = false;
				if(this.specspeccat=='' || (this.item.city!=this.item.placename))
					this.specItems = data[0].specspecval.sort();

				if (data[1]) {
					this.exp_search_adv = data[1].records;
				}

			},

			err => console.error(err)

		);

	}

	private isFilterChanged():boolean {

		if (this.prevFilter == null || this.price != this.prevFilter.price
			|| this.place != this.prevFilter.city || this.category_search != this.prevFilter.category
			|| this.specCategory_search != this.prevFilter.spec || this.lat != this.prevFilter.lat || this.long != this.prevFilter.long || this.miles != this.prevFilter.miles || this.specspeccat != this.prevFilter.specspeccat ) {
			this.prevFilter = {
				price: this.price,
				city: this.place,
				category: this.category_search,
				spec: this.specCategory_search,
				specspeccat: this.specspeccat,
				lat: this.lat,
				long:this.long,
				miles:this.miles
			};


			return true;
		}

		return false;
	}

	pricewise(val){
		this.price = val;
		this.changeQuery();
		this.adminTab = false;
		this.profileTab = false;

		this.removeVisiter();
	}

	setUserId(id){
		this.userId = id;
	}

	setRole(role) {
		this.role = role;
	}
	loginState(alive) {
		this.isAlive = alive;
	}
	changeText(places:any) {
		//  this.place_search = places.city;
		// console.log(this.place_search);
		// if(this.place==undefined)
		// 	this.place="";
		// this.changeQuery();
	};

	changePlace(){
		// console.log('Changed Text:'+this.place_search);
		this.specspeccat='';
		this.changeQuery();
	}
	changeCategory(newVal){
			this.category_search = newVal;
			this.specCategory_search='';
			this.specspeccat='';
			this.changeQuery();

			if(this.category_search=='Alle Kategorien')
				this.specCategory_search='Unterkategorie';

	}
	changeSpecCat(newVal) {
		this.specCategory_search = newVal;
		this.specspeccat='';
		this.changeQuery();
	}
	loadMore(val:number){
		this.totalDisplayed += val;
		this.changeQuery();
	}

	// rangeValueChanged(event: any){
	// 	this.rangeStart = event.startValue;
	// 	this.rangeEnd = event.endValue;
	// 	this.changeQuery();
	// 	// $('#sider').focus();
	// }

	getOwn(){
		if(this.role==1) {
		this.http.get('/exp/ownExp/'+this.userId, new RequestOptions({ body: ''
		}))
		.map((res:any)=>res.json())
			.subscribe(
				(res:any) =>{
					console.log(res);
					this.exp_search = res;
					this.filteredRecords = res.length;
				}
			)

		}

		this.removeVisiter();
	}
	showRemoveIcon() {
		if(this.place_search=="") return false;
        this.closeIcon.style.display = "block";
    }

    hideRemoveIcon() {
        this.closeIcon.style.display = "none";
    }
    emptyAutocomplete() {
		this.hideSubSubCat = true;
        this.place_search = "";
        this.lat= 0;
		this.long= 0;
		this.item=[];
		this.category_search = "Alle Kategorien";
	    this.specCategory_search='Unterkategorie';

        this.toggleRangeDropdown();

        this.hideRemoveIcon();
         this.changeQuery();



    }


	hideAutocomplete(ev) {
        var clickedSelector = ev.target;

        var in_loop = false;
        do {
            if (clickedSelector === this.wrapper.nativeElement) {
                in_loop = true;
            }
            clickedSelector = clickedSelector.parentNode;
        } while (clickedSelector);
        if (!in_loop) {
            this.items = [];
            this.noplacefound = "";
        }
    }

  removeVisiter() {
  	var updateObj = {
											userId : this.profileId[0],
											visiterId : this.userId, 
											updateType : 'remove'
										};
		this.http.post('/api/setuser', updateObj).map((res: any) => res.json())
					.subscribe((res: any) => {
						console.log(res);
						this.profileId = [];
					}, (error: any) => {
             console.log(error);
          });
  }

  messageClick() {
  	this.removeVisiter();
  }

  logout() {
  	// this.userId = '';
  	// this.role = -1;
  	// this.isAlive = false;

  	this.logoutFlag = true;
  	this.pricewise(0);
  }
}
