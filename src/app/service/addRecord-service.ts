import {Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
@Injectable()
export class AddRecordsService {
    constructor() { }

    addRecord:boolean=false;
}
