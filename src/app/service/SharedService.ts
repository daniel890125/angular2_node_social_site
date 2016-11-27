import {Component, Injectable,Input,Output,EventEmitter} from '@angular/core'

// Name Service
export interface myData {
   place:string;
   category:string;
   item:Object;
}

@Injectable()
export class SharedService {

  sharingData: myData={place:"",category:"Alle Kategorien",item:{}};
  saveData(place,category,item){
    // console.log('save data function called ' + place + this.sharingData.place);
    this.sharingData.place=place;
    this.sharingData.category = category; 
    this.sharingData.item=item;
  }
  getFullPlace():Object{
      
      return this.sharingData.item ;
  }
  getPlace():string
  {
    // console.log('get data function called');
    return this.sharingData.place;
  }
  getCategory():string
  {
    // console.log('get data function called');
    return this.sharingData.category;
  }
}