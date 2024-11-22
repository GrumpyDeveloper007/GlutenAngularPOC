export interface TopicGroup {
    GeoLongitude: number
    GeoLatatude: number
    Label: string
    Description: string
    Topics: Topic[]
    MapsLink: string
    RestaurantType: string,
    Price: string,
    Stars: string
}

export interface Topic {
    Title: string
    FacebookUrl: string
    NodeID: string
    ShortTitle: string
    PostCreated: Date
}
