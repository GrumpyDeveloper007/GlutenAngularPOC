export class FilterOptions {
    constructor(
        public ShowHotels: boolean,
        public ShowStores: boolean,
        public ShowOthers: boolean,
        public ShowGMPins: boolean,
        public ShowChainPins: boolean,
        public ShowNonGFGroupPins: boolean,
        public ShowTemporarilyClosed: boolean,
        public SelectedMap: string

    ) { }
}