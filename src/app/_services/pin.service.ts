import { Injectable } from '@angular/core';
import { MarkerOptions } from 'maplibre-gl';
import { TopicGroup } from '../_model/model';
import { Others } from "../_model/staticData";


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
        );
    }


    isHotel(pin: TopicGroup): boolean {
        return pin.restaurantType == "Hotel";
    }
    isOther(pin: TopicGroup): boolean {
        return pin.restaurantType == null || Others.includes(pin.restaurantType);
    }

    getMarkerOptions(color: string, restaurantType: string, restaurantName: string): MarkerOptions {
        var el = document.createElement('div');
        el.style.width = '36px';
        el.style.height = '48px';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center center';

        var markerOptions: MarkerOptions = ({ color: color });

        var url = this.getUrlForType(restaurantType, restaurantName);
        if (url != null) {
            el.style.backgroundImage = url;
            markerOptions.element = el;
        }

        var url = this.getUrlForChain(restaurantName);
        if (url != null) {
            el.style.backgroundImage = url;
            markerOptions.element = el;
        }
        return markerOptions;
    }

    getUrlForType(restaurantType: string, restaurantName: string): string | null {
        if (restaurantType.includes("Sushi")) {
            return `url(Sushi.png)`;
        }

        if (restaurantType.toLowerCase().includes("ice cream")) {
            return `url(IceCream.png)`;
        }
        if (restaurantType.toLowerCase().includes("Cake shop")
            || restaurantType.toLowerCase().includes("dessert shop")) {
            return `url(Cheesecake.png)`;
        }

        if (restaurantType.includes("Donut")) {
            return `url(Donut.png)`;
        }
        if (restaurantType.includes("Bubble tea")) {
            return `url(BubbleTea.png)`;
        }
        if (restaurantType.includes("Bottle Shop and Liquor Store")) {
            return `url(BottleShop.png)`;
        }
        if (restaurantType == "Cafe" || restaurantType == "Coffee shop") {
            return `url(Cafe.png)`;
        }
        if (restaurantType.includes('Fish & Chips')
            || restaurantType.includes('Fish & Chips')
            || restaurantType.includes('Fish and chips')
            || restaurantType.includes('Fish & chips')
        ) {
            return `url(FishAndChips.png)`;
        }
        if (restaurantType.includes("Pizza")
            || restaurantName.includes("Pizza")) {
            return `url(Pizza.png)`;
        }
        if (restaurantType.includes("Vegan")
            || restaurantName.includes("Vegan")) {
            return `url(Vegan.png)`;
        }
        if (restaurantType.toLowerCase().includes("Bakery".toLowerCase())) {
            return `url(Bread.png)`;
        }
        if (restaurantType.toLowerCase().includes("Thai".toLowerCase())) {
            return `url(Thai.png)`;
        }
        if (restaurantType.includes("Barbecue")) {
            return `url(BBQ.png)`;
        }
        if (restaurantType.includes("Japanese")) {
            return `url(Japanese.png)`;
        }
        if (restaurantType.includes("Italian")) {
            return `url(Italian.png)`;
        }
        if (restaurantType.includes("French")) {
            return `url(French.png)`;
        }
        if (restaurantType.includes("Balinese")) {
            return `url(Balinese.png)`;
        }
        if (restaurantType.includes("Chinese")) {
            return `url(Chinese.png)`;
        }
        if (restaurantType.includes("Hamburger")) {
            return `url(Hamburger.png)`;
        }
        if (restaurantType.includes("Vietnamese")) {
            return `url(Vietnamese.png)`;
        }
        if (restaurantType.toLowerCase().includes("Steak".toLowerCase())) {
            return `url(Steak.png)`;
        }
        if (restaurantType.toLowerCase().includes("Australian".toLowerCase())) {
            return `url(Australian.png)`;
        }
        if (restaurantType.includes("Wine")) {
            return `url(WineBar.png)`;
        }
        if (restaurantType.includes("Brewery") || restaurantType.includes("Brewpub")
            || restaurantType.includes("Pub") || restaurantType.includes("Sports bar")) {
            return `url(Bar.png)`;
        }
        if (restaurantType.toLowerCase().includes('chicken')) {
            return `url(Chicken.png)`;
        }

        return null;
    }



    getUrlForChain(restaurantName: string): string | null {
        if (restaurantName.includes('Woolworths')) {
            return `url(Woolworths.png)`;
        }
        if (restaurantName.includes('Coles')) {
            return `url(Coles.png)`;
        }
        if (restaurantName.includes('Nando')) {
            return `url(Nandos.png)`;
        }
        if (restaurantName.toLowerCase().includes("McDonald's".toLowerCase())) {
            return `url(McDonalds.png)`;
        }
        if (restaurantName.includes("Subway")) {
            return `url(Subway.png)`;
        }
        if (restaurantName.includes("Domino's")) {
            return `url(Dominos.png)`;
        }
        if (restaurantName.includes("KFC")) {
            return `url(KFC.png)`;
        }
        if (restaurantName.includes("Taco Bell")) {
            return `url(TacoBell.png)`;
        }
        if (restaurantName.includes("Zambrero")) {
            return `url(Zambrero.png)`;
        }
        if (restaurantName.includes("ALDI")) {
            return `url(ALDI.png)`;
        }

        return null;
    }


}