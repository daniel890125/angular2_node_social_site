import { Injectable,Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'advertise'})

@Injectable()
export class Advertise implements PipeTransform {
    transform(items: any[], args: any[]): any {

      if(!items || !items.length || !args.length ) return [];

      return items.filter(item => item.category.toString().toLowerCase().indexOf(args.toString().toLowerCase()) != -1);
    }
}
