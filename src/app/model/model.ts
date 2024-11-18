export interface TopicGroup {
    GeoLongitude: number
    GeoLatatude: number
    Label: string
    Description: string
    Topics: Topic[]
}

export interface Topic {
    Title: string
    FacebookUrl: string
    NodeID: string
}
