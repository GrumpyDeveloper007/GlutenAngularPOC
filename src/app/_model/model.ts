
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

////////////////////////////////////////

export interface GroupData {
    name: string;
    groupId: string;
    country: string;
    geoLatitudeMin: number;
    geoLongitudeMin: number;
    geoLatitudeMax: number;
    geoLongitudeMax: number;
    totalPins: number;
    selected: boolean;
    localPins: number;
    outsideGeo: boolean;
}

////////////////////////////////////////

export interface PinHighlight {
    pinId: number;
    autoSelect: boolean;
    highlightEffect: number;
    country: string;
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
    isC: boolean;
    isTC: boolean;
    oh: string;
    rc: number;
    fb: string;
    oId: number;
}


export interface Topic {
    gId: string
    lId: string
    facebookUrl: string
    shortTitle: string
    postCreated: Date
    selected: boolean
}

////////////////////////////////////////

export interface PinTopicDetailDTO {
    pinId: number;
    description: string;
    country: string;
    topics: Topic[];
    mapsLink: string;
    restaurantType: string;
    price: string;
    stars: string;
    isC: boolean;
    isTC: boolean;
    oh: string;
    rc: number;
    fb: string;
}



export interface PinSummary {
    pinId: number;
    summary: string;
    country: string;
    language: string;
}

////////////////////////////////////////

export interface CountryMeta {
    Country: string;
    GlutenFree: string;
    Coeliac: string;
    SpokenLanguages: string[];
}

////////////////////////////////////////

export interface DayOpeningTimesDTO {
    id: number;
    bo: number | null;
    bc: number | null;
    lo: number | null;
    lc: number | null;
    do: number | null;
    dc: number | null;
}

export interface PinOpeningTimesDTO {
    id: number;
    m: number;
    t: number;
    w: number;
    th: number;
    f: number;
    s: number;
    su: number;
}

export interface PinExtraDTO {
    do: DayOpeningTimesDTO[];
    po: PinOpeningTimesDTO[];
}

export enum IsOpen {
    Yes,
    No,
    Unknown
}