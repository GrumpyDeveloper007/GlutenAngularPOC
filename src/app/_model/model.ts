export interface TopicGroup {
    geoLongitude: number;
    geoLatitude: number;
    label: string;
    placeName: string;
    description: string;
    topics: Topic[];
    mapsLink: string;
    restaurantType: string;
    price: string;
    stars: string;
    isGF: boolean;
    isC: boolean;
    isGFG: boolean;
}

export interface GMapsPin {
    placeName: string;
    label: string;
    address: string | null;
    geoLatitude: string;
    geoLongitude: string;
    mapsUrl: string | null;
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
export class TopicGroupClass {
    constructor(
        public geoLongitude: number,
        public geoLatitude: number,
        public label: string,
        public description: string,
        public topics: Topic[],
        public mapsLink: string,
        public restaurantType: string,
        public price: string,
        public stars: string,
    ) { }
}

export interface Topic {
    facebookUrl: string
    shortTitle: string
    postCreated: Date
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
