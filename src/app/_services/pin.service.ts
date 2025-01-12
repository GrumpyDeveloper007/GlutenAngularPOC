import { Injectable } from '@angular/core';
import { MarkerOptions } from 'maplibre-gl';
import { TopicGroup } from '../_model/model';
import { Others } from "../_model/staticData";
import * as maplibre from 'maplibre-gl';
import L from "leaflet";


@Injectable({
    providedIn: 'root',
})
export class PinService {
    constructor() { }

    isStore(pin: TopicGroup): boolean {
        return pin.restaurantType != null && (pin.restaurantType.includes("store")
            || pin.restaurantType.includes("Supermarket")
            //Donut shop, Ice cream shop .... || pin.restaurantType.includes("shop"))
            || pin.restaurantType.includes("market") || pin.restaurantType.includes("Market")
            || pin.restaurantType.includes("mall") || pin.restaurantType.includes("Hypermarket")
            || pin.restaurantType.includes("Grocery store")
            || pin.restaurantType.includes("Food products supplier")
            || pin.restaurantType.includes("Condiments supplier")
            || pin.restaurantType.includes("Catering food and drink supplier")
            || pin.label.includes("Department Store")
            || pin.label.includes("Bottle Shop")
        );
    }


    isHotel(pin: TopicGroup): boolean {
        return pin.restaurantType == "Hotel" || pin.restaurantType == "5-star hotel";
    }
    isOther(pin: TopicGroup): boolean {
        return pin.restaurantType == null || Others.includes(pin.restaurantType);
    }

    isInBounds(geoLatitude: number, geoLongitude: number, bounds: maplibregl.LngLatBounds): boolean {
        return bounds.contains([geoLongitude, geoLatitude]);
        //        if (pin.geoLatitude > bounds._ne.lat) return;
        //     if (pin.geoLatitude < bounds._sw.lat) return;
        //     if (pin.geoLongitude > bounds._ne.lng) return;
        //     if (pin.geoLongitude < bounds._sw.lng) return;
    }

    isInBoundsLeaflet(geoLatitude: number, geoLongitude: number, bounds: L.LatLngBounds): boolean {
        if (geoLatitude > bounds.getNorthEast().lat) return false;
        if (geoLatitude < bounds.getSouthWest().lat) return false;
        if (geoLongitude > bounds.getNorthEast().lng) return false;
        if (geoLongitude < bounds.getSouthWest().lng) return false;
        return true;
    }

    createPopup(label: string): maplibre.Popup {
        return new maplibre.Popup({ offset: 25 })
            .setHTML(`<h3>${label}</h3>`);
    }

    getColor(pin: TopicGroup): string {
        var color = "#FF0000";
        if (this.isHotel(pin)) color = "#00FF00";
        if (this.isStore(pin)) color = "#0000FF";
        if (this.isOther(pin)) color = "#00FFFF";
        return color;
    }


    getMarkerOptions(color: string, restaurantType: string, restaurantName: string): MarkerOptions {
        var el = document.createElement('div');
        el.style.width = '36px';
        el.style.height = '48px';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center center';

        var markerOptions: MarkerOptions = ({ color: color });

        var url = this.getUrlForType(restaurantType);
        if (url != null) {
            el.style.backgroundImage = `url(${url})`;
            markerOptions.element = el;
        }

        var url = this.getUrlForChain(restaurantName);
        if (url != null) {
            el.style.backgroundImage = `url(${url})`;
            markerOptions.element = el;
        }
        return markerOptions;
    }

    getUrlForType(restaurantType: string): string | null {
        if (restaurantType.toLowerCase().includes("sushi")) {
            return `Sushi.png`;
        }

        if (restaurantType.toLowerCase().includes("cake")) {
            return `Cake.png`;
        }

        if (restaurantType.toLowerCase().includes("ice cream")) {
            return `IceCream.png`;
        }
        if (restaurantType.toLowerCase().includes("Cake shop")
            || restaurantType.toLowerCase().includes("dessert shop")) {
            return `Cheesecake.png`;
        }

        if (restaurantType.includes("Donut")) {
            return `Donut.png`;
        }
        if (restaurantType.includes("Mexican")) {
            return `Mexican.png`;
        }
        if (restaurantType.includes("Bubble tea")) {
            return `BubbleTea.png`;
        }
        if (restaurantType.includes("Bottle Shop and Liquor Store")) {
            return `BottleShop.png`;
        }
        if (restaurantType.toLowerCase().includes("cafe")
            || restaurantType.toLowerCase().includes("tea")
            || restaurantType == "Coffee shop") {
            return `Cafe.png`;
        }
        if (restaurantType.includes('Fish & Chips')
            || restaurantType.includes('Fish & Chips')
            || restaurantType.includes('Fish and chips')
            || restaurantType.includes('Fish & chips')
        ) {
            return `FishAndChips.png`;
        }
        if (restaurantType.includes("Pizza")) {
            return `Pizza.png`;
        }
        if (restaurantType.includes("Vegan")
            || restaurantType.toLowerCase().includes("vegetarian")
        ) {
            return `Vegan.png`;
        }
        if (restaurantType.toLowerCase().includes("Bakery".toLowerCase())) {
            return `Bread.png`;
        }
        if (restaurantType.toLowerCase().includes("Thai".toLowerCase())) {
            return `Thai.png`;
        }
        if (restaurantType.includes("Barbecue")) {
            return `BBQ.png`;
        }
        if (restaurantType.includes("Japanese")) {
            return `Japanese.png`;
        }
        if (restaurantType.includes("Italian")) {
            return `Italian.png`;
        }
        if (restaurantType.includes("French")) {
            return `French.png`;
        }
        if (restaurantType.includes("Balinese")) {
            return `Balinese.png`;
        }
        if (restaurantType.includes("Chinese")) {
            return `Chinese.png`;
        }
        if (restaurantType.toLowerCase().includes("burger")) {
            return `Hamburger.png`;
        }
        if (restaurantType.includes("Vietnamese")) {
            return `Vietnamese.png`;
        }
        if (restaurantType.toLowerCase().includes("Steak".toLowerCase())) {
            return `Steak.png`;
        }
        if (restaurantType.toLowerCase().includes("Australian".toLowerCase())) {
            return `Australian.png`;
        }
        if (restaurantType.includes("Wine")) {
            return `WineBar.png`;
        }
        if (restaurantType.includes("Brewery") || restaurantType.includes("Brewpub")
            || restaurantType.includes("Pub") || restaurantType.includes("Sports bar")) {
            return `Brewery.png`;
        }
        if (restaurantType.toLowerCase().includes('chicken')) {
            return `Chicken.png`;
        }
        if (restaurantType.toLowerCase().includes('butcher')) {
            return `Butcher.png`;
        }
        if (restaurantType.toLowerCase().includes('german')) {
            return `German.png`;
        }
        if (restaurantType.toLowerCase().includes('okonomiyaki')) {
            return `Okonomiyaki.png`;
        }
        if (restaurantType.toLowerCase().includes('indian')) {
            return `Indian.png`;
        }
        if (restaurantType.toLowerCase().includes('noodle')) {
            return `Noodle.png`;
        }
        if (restaurantType.toLowerCase().includes('ramen')) {
            return `Ramen.png`;
        }

        return null;
    }



    getUrlForChain(restaurantName: string): string | null {
        if (restaurantName.includes("Pizza")) {
            return `Pizza.png`;
        }
        if (restaurantName.includes("Vegan")
            || restaurantName.toLowerCase().includes("vegetarian")
        ) {
            return `Vegan.png`;
        }

        if (restaurantName.includes("Grill'd")
            || restaurantName.toLowerCase().includes("burger")
        ) {
            return `Hamburger.png`;
        }
        if (restaurantName.includes('Woolworths')) {
            return `Woolworths.png`;
        }
        if (restaurantName.includes('Coles')) {
            return `Coles.png`;
        }
        if (restaurantName.includes('Nando')) {
            return `Nandos.png`;
        }
        if (restaurantName.toLowerCase().includes("McDonald's".toLowerCase())) {
            return `McDonalds.png`;
        }
        if (restaurantName.includes("Subway")) {
            return `Subway.png`;
        }
        if (restaurantName.includes("Domino's")) {
            return `Dominos.png`;
        }
        if (restaurantName.includes("KFC")) {
            return `KFC.png`;
        }
        if (restaurantName.includes("Taco Bell")) {
            return `TacoBell.png`;
        }
        if (restaurantName.includes("Zambrero")) {
            return `Zambrero.png`;
        }
        if (restaurantName.includes("ALDI")) {
            return `ALDI.png`;
        }
        if (restaurantName.includes("IGA")) {
            return `IGA.png`;
        }
        if (restaurantName.includes("7-Eleven")) {
            return `711.png`;
        }
        if (restaurantName.toLowerCase().includes("familymart")) {
            return `FamilyMart.png`;
        }

        return null;
    }

    getMarkerIcon(color: string, restaurantType: string | null, restaurantName: string | null): L.Icon {
        var el = document.createElement('div');
        el.style.width = '36px';
        el.style.height = '48px';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center center';

        var genericUrl = "/Empty.png";
        if (color == "#FF0000") {
            genericUrl = "Red.png";
        }
        else if (color == "#00FF00") {
            genericUrl = "Green.png";
        }
        else if (color == "#0000FF") {
            genericUrl = "Blue.png";
        }
        else if (color == "#00FFFF") {
            genericUrl = "Cyan.png";
        }
        else if (color == "#7f7f7f") {
            genericUrl = "Grey.png";
        }

        var customIcon = L.icon({
            iconUrl: genericUrl,
            iconSize: [30, 40],
            iconAnchor: [15, 40],
        });

        if (restaurantType != null) {
            var url = this.getUrlForType(restaurantType);
            if (url != null) {
                customIcon = L.icon({
                    iconUrl: url,
                    iconSize: [36, 48],
                    iconAnchor: [18, 48],
                });
            }
        }

        if (restaurantName != null) {
            var url = this.getUrlForChain(restaurantName);
            if (url != null) {
                customIcon = L.icon({
                    iconUrl: url,
                    iconSize: [36, 48],
                    iconAnchor: [18, 48],
                });
            }
        }
        return customIcon;
    }


}