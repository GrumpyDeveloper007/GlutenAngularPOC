import { Injectable } from '@angular/core';
import { GroupData, TopicGroup } from '../_model/model';
import { Others } from "../_model/staticData";
import L from "leaflet";


@Injectable({
    providedIn: 'root',
})
export class GroupService {
    constructor() { }
    groups: GroupData[] = [];
    allGroups: GroupData[] = [];


    setAllGroupState(state: boolean) {
        this.allGroups.forEach(group => {
            group.selected = state;
        });
    }

    setAllGroups(data: GroupData[]) {
        this.allGroups = data ?? [];
        this.allGroups.forEach(p => p.selected = true);
    }

    resetActiveGroupList() {
        this.groups = [];
    }

    addGroupsBasedOnLocation(country: string, mapCenter: L.LatLng) {
        this.allGroups.forEach(g => {
            if (g.country == country) {
                if (g.geoLatitudeMin != 0) {
                    if (g.geoLatitudeMin < mapCenter.lat
                        && g.geoLatitudeMax > mapCenter.lat
                        && g.geoLongitudeMin < mapCenter.lng
                        && g.geoLongitudeMax > mapCenter.lng) {
                        g.localPins = 0;
                        g.outsideGeo = false;
                        this.groups.push(g);
                        //console.log("added group", g.country, value, g.name);
                    }
                    else {
                        g.localPins = 0;
                        g.outsideGeo = true;
                        this.groups.push(g);
                        //console.log("geo skipped group", g.country, g, mapCenter);
                    }
                }
                else {
                    g.localPins = 0;
                    g.outsideGeo = false;
                    this.groups.push(g);
                    //console.log("added group,by country", g.country, g.name);
                }
            }
        });
    }

    isGroupSelected(pinTopicGroup: TopicGroup): boolean {
        // Default to true, only hide if the group is unticked, 
        // this allows for pins to work correctly when the group is not shown (e.g. group has <5 pins)
        var result = false;
        if (pinTopicGroup.topics == undefined) {
            return true;
        }
        if (this.groups.length == 0) {
            return true;
        }

        let found = false;
        for (const group of this.groups) {
            for (const pinGroup of pinTopicGroup.topics) {
                if (group.groupId === pinGroup.gId) {
                    found = true;
                    if (group.selected === true) result = true;
                }
            }
        }
        if (!found) return true;
        return result;
    }

    selectTopicsForCurrentlySelectedGroups(pinTopicGroup: TopicGroup) {
        // Default to true, only hide if the group is unticked, 
        // this allows for pins to work correctly when the group is not shown (e.g. group has <5 pins)
        if (pinTopicGroup.topics == undefined) {
            return;
        }
        if (this.groups.length == 0) {
            // select all topics
            for (const pinGroup of pinTopicGroup.topics) {
                pinGroup.selected = true;
            }
        }

        for (const group of this.groups) {
            for (const pinGroup of pinTopicGroup.topics) {
                if (group.groupId === pinGroup.gId) {
                    pinGroup.selected = group.selected === true;
                }
            }
        }
        return;
    }

    updateGroupLocalPinCount(pinTopicGroup: TopicGroup) {
        if (pinTopicGroup.topics == undefined) {
            for (const group of this.groups) {
                group.localPins = -1;
            }
            return;
        }
        if (this.groups.length == 0) {
            return;
        }

        for (const group of this.groups) {
            //if (group.selected) {
            for (const pinGroup of pinTopicGroup.topics) {
                if (group.groupId === pinGroup.gId) {
                    group.localPins++;
                    break;
                }
            }
            //}
        }
    }

    sortGroups(): GroupData[] {
        return this.groups.sort((a, b) => {
            if (a.localPins < b.localPins) {
                return 1;
            }

            if (a.localPins > b.localPins) {
                return -1;
            }

            return 0;
        });
    }


}