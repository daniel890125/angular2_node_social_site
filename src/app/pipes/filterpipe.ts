import {Pipe, PipeTransform } from '@angular/core';

@Pipe ({
    name:'myFilter'
})

export class commentFilter implements PipeTransform{
    transform(value:any, args1:string){
    if (value==null) {
        return null;
        }
        var id = args1
        return value.filter(value => value._id===id);
    }
}
