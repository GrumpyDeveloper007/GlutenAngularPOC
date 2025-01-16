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
            || pin.restaurantType.includes("Department Store")
            || pin.restaurantType.includes("Bottle Shop")
            || pin.restaurantType.includes("Food bank")
            || pin.restaurantType.includes("Op Shop")
            || pin.restaurantType == "Shop"
            || pin.restaurantType == "Food bank"
            || pin.restaurantType == "Oyster supplier"
            || pin.restaurantType == "Catholic church"
            || pin.restaurantType == "Discount Shop"
            || pin.restaurantType == "Greengrocer"
            || pin.restaurantType == "Wholesale grocer"
            || pin.restaurantType == "Bottled water supplier"
            || pin.restaurantType == "Store"




        );
    }


    isHotel(pin: TopicGroup): boolean {
        return pin.restaurantType.toLowerCase().includes("hotel") || pin.restaurantType == "5-star hotel";
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
        if (restaurantType.toLowerCase().includes('irish pub')) {
            return `Irish.png`;
        }
        if (restaurantType.toLowerCase().includes('yacht')
            || restaurantType.toLowerCase().includes('boat')
            || restaurantType.toLowerCase().includes('sailing')) {
            return `Yacht.png`;
        }



        if (restaurantType.toLowerCase().includes('chilean')) {
            return `Chilean.png`;
        }
        if (restaurantType.toLowerCase().includes('colombian')) {
            return `Colombian.png`;
        }
        if (restaurantType.toLowerCase().includes('moroccan')) {
            return `Moroccan.png`;
        }
        if (restaurantType.toLowerCase().includes('maltese')) {
            return `Maltese.png`;
        }
        if (restaurantType.toLowerCase().includes('swiss')) {
            return `Swiss.png`;
        }
        if (restaurantType.toLowerCase().includes('dutch')) {
            return `Dutch.png`;
        }
        if (restaurantType.toLowerCase().includes('austrian')) {
            return `Austrian.png`;
        }
        if (restaurantType.toLowerCase().includes('danish')) {
            return `Danish.png`;
        }
        if (restaurantType.toLowerCase().includes('polish')) {
            return `Polish.png`;
        }
        if (restaurantType.toLowerCase().includes('romanian')) {
            return `Romanian.png`;
        }
        if (restaurantType.toLowerCase().includes('ethiopian')) {
            return `Ethiopian.png`;
        }
        if (restaurantType.toLowerCase().includes('british')) {
            return `British.png`;
        }
        if (restaurantType.toLowerCase().includes('hawaiian')) {
            return `Hawaiian.png`;
        }
        if (restaurantType.toLowerCase().includes('pakistani')) {
            return `Pakistani.png`;
        }
        if (restaurantType.toLowerCase().includes('bangladeshi')) {
            return `Bangladeshi.png`;
        }
        if (restaurantType.toLowerCase().includes('peruvian')) {
            return `Peruvian.png`;
        }
        if (restaurantType.toLowerCase().includes('burmese')) {
            return `Burmese.png`;
        }
        if (restaurantType.toLowerCase().includes('cambodian')) {
            return `Cambodian.png`;
        }
        if (restaurantType.toLowerCase().includes('sri lankan')) {
            return `SriLankan.png`;
        }
        if (restaurantType.toLowerCase().includes('punjabi')) {
            return `Punjabi.png`;
        }
        if (restaurantType.toLowerCase().includes('cooking school')
            || restaurantType == "Co-ed school"
            || restaurantType == "Community college"
        ) {
            return `CookingSchool.png`;
        }
        if (restaurantType.toLowerCase().includes('taiwanese')) {
            return `Taiwanese.png`;
        }
        if (restaurantType.toLowerCase().includes('european')) {
            return `European.png`;
        }
        if (restaurantType.toLowerCase().includes('soup')) {
            return `Soup.png`;
        }
        if (restaurantType.toLowerCase().includes('western restaurant')) {
            return `Western.png`;
        }
        if (restaurantType.toLowerCase().includes('Açaí')) {
            return `Açaí.png`;
        }
        if (restaurantType.toLowerCase().includes('venezuelan')) {
            return `Venezuelan.png`;
        }
        if (restaurantType.toLowerCase().includes('bagel')) {
            return `Bagel.png`;
        }
        if (restaurantType.toLowerCase().includes('dumpling')) {
            return `Dumpling.png`;
        }
        if (restaurantType.toLowerCase().includes('argentinian')) {
            return `Argentinian.png`;
        }
        if (restaurantType.toLowerCase().includes('stadium')) {
            return `Stadium.png`;
        }
        if (restaurantType.toLowerCase().includes('sandwich')) {
            return `Sandwich.png`;
        }
        if (restaurantType.toLowerCase().includes('cookie')) {
            return `Cookie.png`;
        }
        if (restaurantType.toLowerCase().includes('charcuterie')) {
            return `Charcuterie.png`;
        }
        if (restaurantType.toLowerCase().includes('pasta')) {
            return `Pasta.png`;
        }
        if (restaurantType == 'Wok restaurant') {
            return `Wok.png`;
        }
        if (restaurantType.toLowerCase().includes('brazilian')) {
            return `Brazilian.png`;
        }
        if (restaurantType.toLowerCase().includes('uyghur')) {
            return `Uyghur.png`;
        }
        if (restaurantType.toLowerCase().includes('food court')) {
            return `FoodCourt.png`;
        }
        if (restaurantType.toLowerCase().includes('persian')) {
            return `Persian.png`;
        }
        if (restaurantType.toLowerCase().includes('middle eastern')) {
            return `MiddleEastern.png`;
        }
        if (restaurantType.toLowerCase().includes('afghan')) {
            return `Afghan.png`;
        }
        if (restaurantType.toLowerCase().includes('portuguese')) {
            return `Portuguese.png`;
        }
        if (restaurantType.toLowerCase().includes('cantonese')) {
            return `Cantonese.png`;
        }
        if (restaurantType.toLowerCase().includes('african')) {
            return `African.png`;
        }
        if (restaurantType.toLowerCase().includes('filipino')) {
            return `Filipino.png`;
        }
        if (restaurantType.toLowerCase().includes('distillery')) {
            return `Distillery.png`;
        }
        if (restaurantType.toLowerCase().includes('fine dining')) {
            return `FineDining.png`;
        }
        if (restaurantType.toLowerCase().includes('theater')) {
            return `Theater.png`;
        }
        if (restaurantType.toLowerCase().includes('health food')) {
            return `HealthFood.png`;
        }
        if (restaurantType.toLowerCase().includes('malaysian')) {
            return `Malaysian.png`;
        }
        if (restaurantType.toLowerCase().includes('confectionery')) {
            return `Confectionery.png`;
        }
        if (restaurantType.toLowerCase().includes('mediterranean')) {
            return `Mediterranean.png`;
        }
        if (restaurantType.toLowerCase().includes('carvery')) {
            return `Carvery.png`;
        }
        if (restaurantType.toLowerCase().includes('vineyard')) {
            return `Vineyard.png`;
        }
        if (restaurantType.toLowerCase().includes('south african')) {
            return `SouthAfrican.png`;
        }
        if (restaurantType.toLowerCase().includes('club')) {
            return `Club.png`;
        }

        if (restaurantType.toLowerCase().includes('buffet')) {
            return `Buffet.png`;
        }
        if (restaurantType.toLowerCase().includes('traditional')) {
            return `Traditional.png`;
        }
        if (restaurantType.toLowerCase().includes('diner')) {
            return `Diner.png`;
        }
        if (restaurantType.toLowerCase().includes('caterer')) {
            return `Caterer.png`;
        }
        if (restaurantType.toLowerCase().includes('bistro')) {
            return `Bistro.png`;
        }
        if (restaurantType.toLowerCase().includes('singaporean')) {
            return `Singaporean.png`;
        }

        if (restaurantType.toLowerCase().includes('turkish')) {
            return `Turkish.png`;
        }
        if (restaurantType.toLowerCase().includes('lebanese')) {
            return `Lebanese.png`;
        }
        if (restaurantType.toLowerCase().includes('spanish')) {
            return `Spanish.png`;
        }

        if (restaurantType.toLowerCase().includes('nepalese')) {
            return `Nepalese.png`;
        }
        if (restaurantType.toLowerCase().includes('farm')) {
            return `Farm.png`;
        }
        if (restaurantType.toLowerCase().includes('plant')
            || restaurantType.toLowerCase().includes('garden center')) {
            return `Plant.png`;
        }
        if (restaurantType.toLowerCase().includes('cheese')) {
            return `Cheese.png`;
        }

        if (restaurantType.toLowerCase().includes('zoo')) {
            return `Zoo.png`;
        }

        if (restaurantType.toLowerCase().includes('petrol station')) {
            return `PetrolStation.png`;
        }
        if (restaurantType.toLowerCase().includes('golf club')
            || restaurantType.toLowerCase().includes('golf course')
            || restaurantType.toLowerCase().includes('golf driving range')

        ) {
            return `GolfClub.png`;
        }

        if (restaurantType.toLowerCase().includes('greek')) {
            return `Greek.png`;
        }
        if (restaurantType.toLowerCase().includes('asian')) {
            return `Asian.png`;
        }

        if (restaurantType.toLowerCase().includes('take away')) {
            return `TakeAway.png`;
        }
        if (restaurantType.toLowerCase().includes('juice')) {
            return `Juice.png`;
        }
        if (restaurantType.toLowerCase().includes('breakfast')) {
            return `Breakfast.png`;
        }
        if (restaurantType.toLowerCase().includes('brunch')) {
            return `Brunch.png`;
        }

        if (restaurantType.toLowerCase().includes('organic shop')
            || restaurantType.toLowerCase().includes('organic food')) {
            return `Organic.png`;
        }


        if (restaurantType.toLowerCase().includes('fast food')) {
            return `FastFood.png`;
        }
        if (restaurantType.toLowerCase().includes('sundae')) {
            return `Sundae.png`;
        }
        if (restaurantType.toLowerCase().includes('supermarket')) {
            return `Supermarket.png`;
        }

        if (restaurantType.toLowerCase().includes('grocery')) {
            return `GroceryStore.png`;
        }
        if (restaurantType.toLowerCase().includes('new zealand')) {
            return `Kiwi.png`;
        }
        if (restaurantType.toLowerCase().includes('taco')) {
            return `Taco.png`;
        }
        if (restaurantType.toLowerCase().includes('american')) {
            return `American.png`;
        }
        if (restaurantType.toLowerCase().includes('meat dish')) {
            return `MeatDish.png`;
        }
        if (restaurantType.toLowerCase().includes('kebab')) {
            return `Kebab.png`;
        }
        if (restaurantType.toLowerCase().includes('chocolate')) {
            return `Chocolate.png`;
        }
        if (restaurantType.toLowerCase().includes('fruit')) {
            return `Fruit.png`;
        }
        if (restaurantType.toLowerCase().includes('tempura')) {
            return `Tempura.png`;
        }
        if (restaurantType.toLowerCase().includes('deli')) {
            return `Deli.png`;
        }
        if (restaurantType.toLowerCase().includes('belgian')) {
            return `Belgian.png`;
        }
        if (restaurantType.toLowerCase().includes('kaiseki')) {
            return `Kaiseki.png`;
        }
        if (restaurantType.toLowerCase().includes('gyudon')) {
            return `Gyudon.png`;
        }
        if (restaurantType.toLowerCase().includes('family')) {
            return `Family.png`;
        }
        if (restaurantType.toLowerCase().includes('pastry')) {
            return `Pastry.png`;
        }
        if (restaurantType.toLowerCase().includes('creperie')) {
            return `Creperie.png`;
        }
        if (restaurantType.toLowerCase().includes('izakaya')) {
            return `Izakaya.png`;
        }
        if (restaurantType.toLowerCase().includes('patisserie')) {
            return `Patisserie.png`;
        }
        if (restaurantType.toLowerCase().includes('yakitori')) {
            return `Yakitori.png`;
        }
        if (restaurantType.toLowerCase().includes('seafood')) {
            return `Seafood.png`;
        }
        if (restaurantType.toLowerCase().includes('salad')) {
            return `Salad.png`;
        }
        if (restaurantType.toLowerCase().includes("pie")) {
            return `Pie.png`;
        }
        if (restaurantType.toLowerCase().includes("bar")
            || restaurantType.toLowerCase().includes("tavern")) {
            return `Bar.png`;
        }
        if (restaurantType.toLowerCase().includes("gluten")) {
            return `GF.png`;
        }
        if (restaurantType.toLowerCase().includes("korean")) {
            return `Korean.png`;
        }
        if (restaurantType.toLowerCase().includes("tex-mex")) {
            return `TexMex.png`;
        }
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
            || restaurantType.toLowerCase().includes("dessert")) {
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
            || restaurantType == "Coffee shop"
            || restaurantType == "Coffee roasters"
            || restaurantType == "Coffee stand"
        ) {
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
        if (restaurantType.includes("Barbecue")
            || restaurantType.includes("Grill")) {
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
        if (restaurantType.includes("Balinese")
            || restaurantType.includes("Indonesian")) {
            return `Balinese.png`;
        }
        if (restaurantType.includes("Chinese")) {
            return `Chinese.png`;
        }
        if (restaurantType.toLowerCase().includes("burger")) {
            return `Hamburger.png`;
        }
        if (restaurantType.includes("Vietnamese")
            || restaurantType.includes("Pho restaurant")) {
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
            || restaurantType.includes("Pub") || restaurantType.includes("Sports bar")
            || restaurantType.includes("Beer garden")
            || restaurantType.includes("Gastropub")
            || restaurantType.includes("Beer hall")

        ) {
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
        if (restaurantType.toLowerCase().includes('yakiniku')) {
            return `Yakiniku.png`;
        }
        if (restaurantType.toLowerCase() == 'restaurant') {
            return `Restaurant.png`;
        }


        return null;
    }



    getUrlForChain(restaurantName: string): string | null {

        if (restaurantName.toLowerCase().includes("starbucks")) {
            return `Starbucks.png`;
        }
        if (restaurantName.toLowerCase().includes("cafe")) {
            return `Cafe.png`;
        }
        if (restaurantName.toLowerCase().includes("sushi")) {
            return `Sushi.png`;
        }


        if (restaurantName.toLowerCase().includes("oporto")) {
            return `Oporto.png`;
        }
        if (restaurantName.toLowerCase().includes("don quijote")) {
            return `DonQuijote.png`;
        }

        if (restaurantName.toLowerCase().includes("natural lawson")) {
            return `NaturalLawson.png`;
        }

        if (restaurantName.toLowerCase().includes('indian')) {
            return `Indian.png`;
        }
        if (restaurantName.includes("Chinese")) {
            return `Chinese.png`;
        }


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
        if (restaurantName.toLowerCase().includes("iga")) {
            return `IGA.png`;
        }
        if (restaurantName.toLowerCase().includes("7-eleven")) {
            return `711.png`;
        }
        if (restaurantName.toLowerCase().includes("familymart")) {
            return `FamilyMart.png`;
        }
        if (restaurantName.toLowerCase().includes("rsl")) {
            return `RSL.png`;
        }
        if (restaurantName.toLowerCase().includes('chicken')) {
            return `Chicken.png`;
        }

        return null;
    }

    getMarkerIcon(color: string, restaurantType: string | null, restaurantName: string | null): L.Icon {
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