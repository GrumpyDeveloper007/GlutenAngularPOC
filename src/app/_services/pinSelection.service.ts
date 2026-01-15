import { Injectable } from '@angular/core';
import { PinExtraDTO, DayOpeningTimesDTO, PinOpeningTimesDTO, TopicGroup, IsOpen } from '../_model/model';
import { GlutenApiService } from '../_services';

type PinOpeningTimesDTOPropertyKey = keyof PinOpeningTimesDTO;

@Injectable({
    providedIn: 'root',
})
export class PinSelectionService {
    extraInfo: PinExtraDTO | undefined;
    dayOpeningTimes: Record<number, DayOpeningTimesDTO> = {};
    pinOpeningTimesDTO: Record<number, PinOpeningTimesDTO> = {};
    dayofWeekProperty: string = '';

    constructor(
        private apiService: GlutenApiService,
    ) { }

    setDayOfWeek() {
        const today: Date = new Date();
        const daysOfWeek: string[] = ['su', 'm', 't', 'w', 'th', 'f', 's']; // s= saturday
        this.dayofWeekProperty = daysOfWeek[today.getDay()];
    }

    getMinutesPastMidnight(): number {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Calculate the total minutes: each hour has 60 minutes
        const totalMinutes = (hours * 60) + minutes;

        return totalMinutes;
    }

    isPinOpenNow(pin: TopicGroup): IsOpen {
        if (this.pinOpeningTimesDTO == undefined) return IsOpen.Unknown;
        if (this.dayOpeningTimes == undefined) return IsOpen.Unknown;
        let pinOpeningTimes = this.pinOpeningTimesDTO[pin.oId];
        //console.log("pinOpeningTimes", pinOpeningTimes, pin.oId, pin.pinId);
        if (pinOpeningTimes == undefined) return IsOpen.Unknown;
        let currentTimeOfDay = this.getMinutesPastMidnight();
        const propName: PinOpeningTimesDTOPropertyKey = this.dayofWeekProperty as keyof PinOpeningTimesDTO;
        const dayOpeningTimesId = pinOpeningTimes[propName];
        if (dayOpeningTimesId == 0) return IsOpen.Unknown;
        let dayOpeningTimes = this.dayOpeningTimes[dayOpeningTimesId];
        //console.log("dayOpeningTimes", dayOpeningTimes, propName, dayOpeningTimesId);
        if (dayOpeningTimes == undefined) {
            //console.log("dayOpeningTimes - undefined");
            return IsOpen.Unknown;
        }
        if (dayOpeningTimes.bo != undefined && dayOpeningTimes.bc && dayOpeningTimes.bo < currentTimeOfDay && dayOpeningTimes.bc > currentTimeOfDay) {
            return IsOpen.Yes;
        }
        if (dayOpeningTimes.lo != undefined && dayOpeningTimes.lc && dayOpeningTimes.lo < currentTimeOfDay && dayOpeningTimes.lc > currentTimeOfDay) {
            return IsOpen.Yes;
        }
        if (dayOpeningTimes.do != undefined && dayOpeningTimes.dc && dayOpeningTimes.do < currentTimeOfDay && dayOpeningTimes.dc > currentTimeOfDay) {
            return IsOpen.Yes;
        }

        return IsOpen.No;
    }

    loadData() {
        this.setDayOfWeek();
        this.apiService.getPinsExtraInfo().subscribe(data => {
            if (data == undefined) return;
            data.do.forEach(p => this.dayOpeningTimes[p.id] = p);
            data.po.forEach(p => this.pinOpeningTimesDTO[p.id] = p);
        });
    }
}