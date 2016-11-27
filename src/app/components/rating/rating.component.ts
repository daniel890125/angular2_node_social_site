import { Component, Input, Output, OnInit, EventEmitter,OnChanges } from '@angular/core';

@Component({
  selector: 'rating',
  template: `
    <div class="stars">
      <star
        *ngFor="let star of stars"
        [active]="star <= _rating"
        (rate)="onRate($event)"
        [position]="star"
      >
      </star>
    </div>
  `
})
export class RatingComponent implements OnChanges {
  @Input() starCount: number;
  @Input() rating: number;
  @Output() rate:EventEmitter<number> = new EventEmitter<number>();
  stars:number[] = [1,2,3,4,5];
  _rating = this.rating;

  constructor() {
    const count = this.starCount < 0 ? 5 : this.starCount;
  }

  ngOnChanges(){
    this._rating = this.rating;
  }

  onRate(star) {
    this.rate.emit(star);
    this._rating = star;
  }
}
