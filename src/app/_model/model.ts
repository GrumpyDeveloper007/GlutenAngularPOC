
export interface GMapsPin {
    pinId: number;
    label: string;
    address: string | null;
    geoLatitude: string;
    geoLongitude: string;
    mapsLink: string | null;
    restaurantType: string;
    price: string | null;
    stars: string | null;
    comment: string | null;
    description: string | null;
}

export class Restaurant {
    constructor(
        public show: boolean,
        public name: string,
    ) { }
}


export interface IpAddressData {
    ip: string;
    hostname: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
}

export interface GroupData {
    name: string;
    groupId: string;
    country: string;
    geoLatitudeMin: number;
    geoLongitudeMin: number;
    geoLatitudeMax: number;
    geoLongitudeMax: number;
    totalPins: number;
}

////////////////////////////////////////
export interface TopicGroup {
    pinId: number;
    geoLongitude: number;
    geoLatitude: number;
    label: string;
    description: string;
    topics: Topic[];
    mapsLink: string;
    restaurantType: string;
    price: string;
    stars: string;
    isGF: boolean;
    isC: boolean;
    isGFG: boolean;
    isTC: boolean;
    languages: { [id: string]: string; };
    Oh: string;

}


export interface Topic {
    GId: string
    LId: string
    facebookUrl: string
    shortTitle: string
    postCreated: Date
}

////////////////////////////////////////

export interface PinLanguage {
    description: string;
    language: string;
}

export interface PinTopicDetailDTO {
    pinId: number;
    description: string;
    topics: Topic[];
    mapsLink: string;
    restaurantType: string;
    price: string;
    stars: string;
    isGF: boolean;
    isC: boolean;
    isGFG: boolean;
    isTC: boolean;
    languages: { [id: string]: string; };
    Oh: string;
}



export interface PinSummary {
    pinId: number;
    summary: string;
    country: string;
    language: string;
}