import {Pipe, PipeTransform } from '@angular/core';

@Pipe ({
    name:'commentsFilter'
})

export class commentAllFilter implements PipeTransform{
    transform(value:any, args:string[]){
    if (value==null) {
        return null;
        }
        var id = args;
        return value.filter(value => value._roomID===id).slice().reverse();
    }
}
