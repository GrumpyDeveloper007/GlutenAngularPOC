export interface Topic {
    Title: string
    ResponsesV2: ResponsesV2[]
    HashTags: string[]
    UrlsV2: UrlsV2[]
    AiTitleInfoV2?: AiTitleInfoV2[]
    AiParsed: boolean
    FacebookUrl: string
    NodeID: string
    ResponseHasLink: boolean
    ResponseHasMapLink: boolean
}

export interface ResponsesV2 {
    Message?: string
    NodeId: string
    Links?: Link[]
}

export interface Link {
    Url: string
    Pin?: Pin
    AiGenerated: any
}

export interface Pin {
    Label: string
    Address: string
    Type: any
    GeoLatatude: string
    GeoLongitude: string
}

export interface UrlsV2 {
    Url: string
    Pin?: Pin2
    AiGenerated?: boolean
}

export interface Pin2 {
    Label: string
    Address: string
    Type: any
    GeoLatatude: string
    GeoLongitude: string
}

export interface AiTitleInfoV2 {
    Text: string
    Category: string
    SubCategory?: string
    ConfidenceScore: number
    Offset: number
    Length: number
}