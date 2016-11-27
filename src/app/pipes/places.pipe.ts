import { Injectable,Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'places'})
 
@Injectable()
export class Places implements PipeTransform {
    transform(items: any[], args: any[]): any {
                 
               
                 if(!items.length || !args.length ) return [];
                 
           let filter_items= items.filter(item => item.city.toString().toLowerCase().indexOf(args.toString().toLowerCase()) != -1);

           return filter_items.slice(0,5);
         
    }
}