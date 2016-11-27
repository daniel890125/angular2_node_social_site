import {
    Component, Input, OnInit, ElementRef, HostListener, EventEmitter, Output, OnChanges,
    SimpleChanges
} from "@angular/core";

@Component({
    selector: 'range-slider[min][max]',
    template: `
        <div class="range-slider">
            <div class="slider-body">
                <div (mousedown)="onMousedown($event.target)" (click)="onBtnClick($event)" class="slider-btn"></div>
                <div (mousedown)="onMousedown($event.target)" (click)="onBtnClick($event)" class="slider-btn"></div>
                <div class="slider-selection"></div>
            </div>
            <span class="min-boundary">{{currentMin}}</span>
            <span class="max-boundary">{{currentMax}}</span>
        </div>
    `
})
export class RangeSliderComponent implements OnInit, OnChanges {

    @Input()
    private min: number;
    @Input()
    private max: number;

    @Output()
    private boundariesChangeEvent = new EventEmitter();

    private currentMin: number;
    private currentMax: number;
    private prevMin: number;
    private prevMax: number;

    private disabled:boolean = false;
    private currentBtn: any;
    private minBtn: any;
    private maxBtn: any;
    private selection: any;

    constructor(private el: ElementRef) {
    }

    ngOnInit(): void {
        this.currentMin = this.prevMin = this.min;
        this.currentMax = this.prevMax = this.max;

        if (this.min == this.max) {
            this.disabled = true;
            this.el.nativeElement.classList.add('range-slider-disabled');
        } else {
            this.disabled = false;
            this.el.nativeElement.classList.remove('range-slider-disabled');
        }

        this.selection = this.el.nativeElement.querySelector('.slider-selection');

        this.minBtn = this.el.nativeElement.querySelector('.slider-btn:first-child');

        const maxWidthPx = this.el.nativeElement.getBoundingClientRect().width;
        const offset = this.toPercents(-this.minBtn.getBoundingClientRect().width / 2, maxWidthPx);

        this.minBtn.style.left = offset + '%';
        this.minBtn.style.right = 'auto';
        this.selection.style.left = this.minBtn.style.left;

        this.maxBtn = this.el.nativeElement.querySelector('.slider-btn:not(:first-child)');

        this.maxBtn.style.left = 'auto';
        this.maxBtn.style.right = offset + '%';
        this.selection.style.right = 'auto';
        this.selection.style.width = 100 + '%';
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.ngOnInit();
    }

    @HostListener('document:mousemove', ['$event'])
    private onMousemove(event) {
        if (!this.currentBtn) {
            return;
        }

        let positionPx: number = this.getRelativeXPosition(event);

        if (this.currentBtn === this.minBtn) {
            this.setMinBtn(positionPx);
        } else {
            this.setMaxBtn(positionPx);
        }
    }

    @HostListener('document:mouseup', ['$event'])
    private onMouseup(): void {
        if (this.currentBtn == null) {
            return;
        }

        this.currentBtn = null;

        this.onBoundariesChange();
    }

    @HostListener('click', ['$event'])
    private onClick(event): void {
        if (this.disabled) {
            return;
        }

        let positionPx: number = this.getRelativeXPosition(event);
        const maxBtnRight = this.maxBtn.offsetLeft + this.maxBtn.getBoundingClientRect().width;

        if (positionPx < this.minBtn.offsetLeft) {
            this.setMinBtn(positionPx);
        } else if (positionPx > maxBtnRight) {
            this.setMaxBtn(positionPx);
        } else {
            if (positionPx - this.minBtn.offsetLeft < maxBtnRight - positionPx) {
                this.setMinBtn(positionPx);
            } else {
                this.setMaxBtn(positionPx);
            }
        }

        this.onBoundariesChange();
    }

    private onBtnClick(event): void {
        event.stopPropagation();
    }

    private onMousedown(btn): void {
        this.currentBtn = btn;
    }

    private setMinBtn(positionPx: number): void {
        const maxWidthPx = this.el.nativeElement.getBoundingClientRect().width;
        const btnWidthPx = this.minBtn.getBoundingClientRect().width;
        const siblingPosition = this.maxBtn.offsetLeft;

        let offsetPx = positionPx - btnWidthPx / 2;
        let k: number;

        if (offsetPx < -btnWidthPx / 2) {
            k = -btnWidthPx / 2;
        } else {
            if (positionPx + btnWidthPx / 2 < siblingPosition) {
                k = offsetPx;
            } else {
                k = siblingPosition - btnWidthPx;
            }
        }

        this.minBtn.style.left = this.toPercents(k, maxWidthPx) + '%';

        this.selection.style.left = this.minBtn.style.left;
        this.selection.style.width = this.toPercents(siblingPosition + btnWidthPx - btnWidthPx / 2 - k, maxWidthPx) + '%';

        this.updateBoundaries();
    }

    private setMaxBtn(positionPx: number): void {
        const maxWidthPx = this.el.nativeElement.getBoundingClientRect().width;
        const btnWidthPx = this.maxBtn.getBoundingClientRect().width;
        const siblingPosition = this.minBtn.offsetLeft;

        let offsetPx = positionPx - btnWidthPx / 2;
        let k = 0;

        if (positionPx + btnWidthPx / 2 > maxWidthPx + btnWidthPx / 2) {
            k = -btnWidthPx / 2;
        } else {
            if (positionPx - btnWidthPx / 2 < siblingPosition + btnWidthPx) {
                k = maxWidthPx - siblingPosition - btnWidthPx * 2;
            } else {
                k = maxWidthPx - offsetPx - btnWidthPx;
            }
        }

        this.maxBtn.style.right = this.toPercents(k, maxWidthPx) + '%';

        this.selection.style.width = this.toPercents(this.maxBtn.offsetLeft + btnWidthPx - siblingPosition - btnWidthPx / 2, maxWidthPx) + '%';

        this.updateBoundaries();
    }

    private updateBoundaries(): void {
        const maxWidthPx = this.el.nativeElement.getBoundingClientRect().width;
        const btnWidthPx = this.minBtn.getBoundingClientRect().width;

        this.currentMin = this.min + Math.floor((this.max - this.min) * this.toPercents(this.minBtn.offsetLeft + btnWidthPx / 2, maxWidthPx) / 100);
        this.currentMin = Math.max(this.currentMin, this.min);

        this.currentMax = this.max - Math.floor((this.max - this.min) * (1 - this.toPercents(this.maxBtn.offsetLeft + btnWidthPx / 2, maxWidthPx) / 100));
        this.currentMax = Math.min(this.currentMax, this.max);
    }

    private onBoundariesChange(): void {
        if (this.prevMin != this.currentMin || this.prevMax != this.currentMax) {
            this.boundariesChangeEvent.emit({
                min: this.currentMin,
                max: this.currentMax
            });

            this.prevMin = this.currentMin;
            this.prevMax = this.currentMax;
        }
    }

    private getRelativeXPosition(mouseEvent: any): number {
        return mouseEvent.pageX - this.el.nativeElement.getBoundingClientRect().left;
    }

    private toPercents(val: number, maxVal: number): number {
        return val / maxVal * 100;
    }
}