export interface TopicGroup {
    GeoLongitude: number
    GeoLatitude: number
    Label: string
    Description: string
    Topics: Topic[]
    MapsLink: string
    RestaurantType: string,
    Price: string,
    Stars: string
}


export class Restaurant {
    constructor(
        public Show: boolean,
        public Name: string,
    ) { }
}
export class TopicGroupClass {
    constructor(
        public GeoLongitude: number,
        public GeoLatitude: number,
        public Label: string,
        public Description: string,
        public Topics: Topic[],
        public MapsLink: string,
        public RestaurantType: string,
        public Price: string,
        public Stars: string,
    ) { }
}

export interface Topic {
    Title: string
    FacebookUrl: string
    NodeID: string
    ShortTitle: string
    PostCreated: Date
}
