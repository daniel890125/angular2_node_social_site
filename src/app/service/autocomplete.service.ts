import { Injectable,OnInit } from '@angular/core';
import { URLSearchParams,Http, Response } from '@angular/http';
import 'rxjs/add/operator/map'

@Injectable()
export class AutocompleteService implements OnInit {
  jsonObj:any = [];

  constructor(private http: Http) {}

  search(term: string) {
    let params = new URLSearchParams();
    params.set('q', term);
    return this.http
                .get('/api/getplaces', { search: params })
                 .map(this.parseResponse)
                .toPromise();
  }

  private parseResponse(res: Response) {
      return  res.json();
  }

  ngOnInit(){

  }

}
