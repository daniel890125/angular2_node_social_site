import {Injectable} from '@angular/core';
import {IMyDateRange} from '../interfaces/my-date-range.interface';
import {IMyDate} from '../interfaces/my-date.interface';

@Injectable()
export class DateRangeValidatorService {

    public isDateRangeValid(daterange:string, dateFormat:string): IMyDateRange {

        let invalidDateRange:IMyDateRange = {beginDate: {day: 0, month: 0, year: 0}, endDate: {day: 0, month: 0, year: 0}};

        if(daterange.length !== 23) {
            return invalidDateRange;
        }

        let parts = daterange.split(' - ');
        if(parts.length !== 2) {
            return invalidDateRange;
        }

        let separator = dateFormat.replace(/[dmy]/g, '')[0];
        let dpos = dateFormat.indexOf('dd');
        let mpos = dateFormat.indexOf('mm');
        let ypos = dateFormat.indexOf('yyyy');

        let datesInMs:Array<IMyDate> = [];

        for(var i in parts) {
            let date:IMyDate = this.isDateValid(parts[i], separator, dpos, mpos, ypos);
            if(date.day === 0 && date.month === 0 && date.year === 0) {
                return invalidDateRange;
            }
            datesInMs.push(date);
        }

        if(this.getTimeInMilliseconds(datesInMs[1]) < this.getTimeInMilliseconds(datesInMs[0])) {
            return invalidDateRange;
        }

        // Valid date range
        return {
            beginDate: {day: datesInMs[0].day, month: datesInMs[0].month, year: datesInMs[0].year},
            endDate: {day: datesInMs[1].day, month: datesInMs[1].month, year: datesInMs[1].year}
        };
    }

    private isDateValid(date:string, separator:string, dpos:number, mpos:number, ypos:number): IMyDate {
        let daysInMonth:Array<number> = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        let invalidDate:IMyDate = {day: 0, month: 0, year: 0};

        if(date.length !== 10) {
            return invalidDate;
        }

        let parts = date.split(separator);
        if(parts.length !== 3) {
            return invalidDate;
        }

        if (dpos !== -1 && mpos !== -1 && ypos !== -1) {
            let day = parseInt(date.substring(dpos, dpos + 2)) || 0;
            let month = parseInt(date.substring(mpos, mpos + 2)) || 0;
            let year = parseInt(date.substring(ypos, ypos + 4)) || 0;

            if(day === 0 || month === 0 || year === 0) {
                return invalidDate;
            }

            if(year < 1000 || year > 9999 || month < 1 || month > 12) {
                return invalidDate;
            }

            if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
                daysInMonth[1] = 29;
            }

            if(day < 1 || day > daysInMonth[month - 1]) {
                return invalidDate;
            }

            // Valid date
            return {day: day, month: month, year: year};
        }
        return invalidDate;
    }

    private getTimeInMilliseconds(date:IMyDate):number {
        return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getTime();
    }
}