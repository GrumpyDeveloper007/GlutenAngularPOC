export interface TopicGroup {
    geoLongitude: number
    geoLatitude: number
    label: string
    description: string
    topics: Topic[]
    mapsLink: string
    restaurantType: string,
    price: string,
    stars: string
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
    title: string
    facebookUrl: string
    shortTitle: string
    postCreated: Date
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