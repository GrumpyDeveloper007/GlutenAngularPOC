export interface TopicGroup {
    GeoLongitude: number
    GeoLatatude: number
    Label: string
    Description: string
    Topics: Topic[]
    MapsLink: string
}

export interface Topic {
    Title: string
    FacebookUrl: string
    NodeID: string
}
