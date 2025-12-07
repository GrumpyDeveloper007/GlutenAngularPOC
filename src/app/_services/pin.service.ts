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

    private images = [{ fileName: "Bakso.png", search: "bakso" },
    { fileName: "Catalonian.png", search: "catalonian" },
    { fileName: "Nyonya.png", search: "nyonya" },
    { fileName: "Taco.png", search: "Taco" },
    { fileName: "Satay.png", search: "Satay" },
    { fileName: "Mandarin.png", search: "Mandarin" },
    { fileName: "Pan-Latin.png", search: "Pan-Latin" },
    { fileName: "Teppanyaki.png", search: "Teppanyaki" },
    { fileName: "Greyhound.png", search: "Greyhound" },
    { fileName: "Racecourse.png", search: "Racecourse" },
    { fileName: "Retirement.png", search: "Retirement" },
    { fileName: "Halal.png", search: "Halal" },
    { fileName: "Whale.png", search: "Whale" },
    { fileName: "Fusion.png", search: "Fusion" },
    { fileName: "Organic.png", search: "organic restaurant" },
    { fileName: "NasiGoreng.png", search: "nasi goreng" },
    { fileName: "Spa.png", search: "Spa " },
    { fileName: "Art.png", search: "Art " },
    { fileName: "Ski.png", search: "Ski " },
    { fileName: "DimSum.png", search: "dim sum" },
    { fileName: "BeachPavillion.png", search: "beach pavillion" },
    { fileName: "Laotian.png", search: "Laotian" },
    { fileName: "Continental.png", search: "Continental" },
    { fileName: "VideoArcade.png", search: "video arcade" },
    { fileName: "Park.png", search: "Park" },
    { fileName: "Louisiana.png", search: "Louisiana" },
    { fileName: "FoodAndDrink.png", search: "food and drink" },
    { fileName: "LiveMusic.png", search: "live music" },
    { fileName: "Churreria.png", search: "Churreria" },
    { fileName: "Icelandic.png", search: "Icelandic" },
    { fileName: "Irish.png", search: "Irish" },
    { fileName: "Canadian.png", search: "Canadian" },
    { fileName: "Scottish.png", search: "Scottish" },
    { fileName: "Caribbean.png", search: "Caribbean" },
    { fileName: "Kosher.png", search: "Kosher" },
    { fileName: "Fish.png", search: "Fish" },
    { fileName: "Lounge.png", search: "Lounge" },
    { fileName: "Hawker.png", search: "Hawker" },
    { fileName: "Tapas.png", search: "Tapas" },
    { fileName: "HotPot.png", search: "hot pot" },
    { fileName: "HotPot.png", search: "Shabu" },
    { fileName: "FrozenYogurt.png", search: "frozen yogurt" },
    { fileName: "Casino.png", search: "Casino" },
    { fileName: "Chilean.png", search: "Chilean" },
    { fileName: "Colombian.png", search: "Colombian" },
    { fileName: "Moroccan.png", search: "Moroccan" },
    { fileName: "Maltese.png", search: "Maltese" },
    { fileName: "Swiss.png", search: "Swiss" },
    { fileName: "Dutch.png", search: "Dutch" },
    { fileName: "Austrian.png", search: "Austrian" },
    { fileName: "Danish.png", search: "Danish" },
    { fileName: "Polish.png", search: "Polish" },
    { fileName: "Romanian.png", search: "Romanian" },
    { fileName: "Ethiopian.png", search: "Ethiopian" },
    { fileName: "British.png", search: "british" },
    { fileName: "British.png", search: "english" },
    { fileName: "Hawaiian.png", search: "Hawaiian" },
    { fileName: "Pakistani.png", search: "Pakistani" },
    { fileName: "Bangladeshi.png", search: "Bangladeshi" },
    { fileName: "Peruvian.png", search: "Peruvian" },
    { fileName: "Burmese.png", search: "Burmese" },
    { fileName: "Cambodian.png", search: "Cambodian" },
    { fileName: "SriLankan.png", search: "sri lankan" },
    { fileName: "Punjabi.png", search: "Punjabi" },
    { fileName: "Taiwanese.png", search: "Taiwanese" },
    { fileName: "European.png", search: "European" },
    { fileName: "Soup.png", search: "Soup" },
    { fileName: "Soup.png", search: "Samgyetang" },
    { fileName: "Western.png", search: "western restaurant" },
    { fileName: "Açaí.png", search: "açaí" },
    { fileName: "Venezuelan.png", search: "Venezuelan" },
    { fileName: "Bagel.png", search: "Bagel" },
    { fileName: "Dumpling.png", search: "Dumpling" },
    { fileName: "Argentinian.png", search: "Argentinian" },
    { fileName: "Stadium.png", search: "Stadium" },
    { fileName: "Stadium.png", search: "arena" },
    { fileName: "Stadium.png", search: "sports complex" },
    { fileName: "Sandwich.png", search: "Sandwich" },
    { fileName: "Cookie.png", search: "Cookie" },
    { fileName: "Charcuterie.png", search: "Charcuterie" },
    { fileName: "Pasta.png", search: "Pasta" },
    { fileName: "Brazilian.png", search: "Brazilian" },
    { fileName: "Uyghur.png", search: "Uyghur" },
    { fileName: "FoodCourt.png", search: "food court" },
    { fileName: "Persian.png", search: "Persian" },
    { fileName: "MiddleEastern.png", search: "middle eastern" },
    { fileName: "Afghan.png", search: "Afghan" },
    { fileName: "Portuguese.png", search: "Portuguese" },
    { fileName: "Cantonese.png", search: "Cantonese" },
    { fileName: "African.png", search: "African" },
    { fileName: "Filipino.png", search: "Filipino" },
    { fileName: "Distillery.png", search: "Distillery" },
    { fileName: "FineDining.png", search: "fine dining" },
    { fileName: "Theater.png", search: "Theater" },
    { fileName: "HealthFood.png", search: "health food" },
    { fileName: "Malaysian.png", search: "Malaysian" },
    { fileName: "Malaysian.png", search: "Ikan bakar" },
    { fileName: "Mediterranean.png", search: "Mediterranean" },
    { fileName: "Carvery.png", search: "Carvery" },
    { fileName: "Vineyard.png", search: "Vineyard" },
    { fileName: "SouthAfrican.png", search: "south african" },
    { fileName: "Club.png", search: "Club" },
    { fileName: "Buffet.png", search: "Buffet" },
    { fileName: "Traditional.png", search: "Traditional" },
    { fileName: "Diner.png", search: "Diner" },
    { fileName: "Caterer.png", search: "Caterer" },
    { fileName: "Bistro.png", search: "Bistro" },
    { fileName: "Singaporean.png", search: "Singaporean" },
    { fileName: "Turkish.png", search: "Turkish" },
    { fileName: "Lebanese.png", search: "Lebanese" },
    { fileName: "Spanish.png", search: "Spanish" },
    { fileName: "Spanish.png", search: "Majorcan" },
    { fileName: "Nepalese.png", search: "Nepalese" },
    { fileName: "Farm.png", search: "Farm" },
    { fileName: "Plant.png", search: "Plant" },
    { fileName: "Plant.png", search: "garden center" },
    { fileName: "Cheese.png", search: "Cheese" },
    { fileName: "Greek.png", search: "Greek" },
    { fileName: "Asian.png", search: "Asian" },
    { fileName: "Asian.png", search: "Pacific Rim" },

    { fileName: "TakeAway.png", search: "Takeaway" },
    { fileName: "TakeAway.png", search: "Takeout" },
    { fileName: "TakeAway.png", search: "Take-out" },
    { fileName: "TakeAway.png", search: "Take Away" },
    { fileName: "TakeAway.png", search: "Takeout restaurant" },
    { fileName: "Juice.png", search: "Juice" },
    { fileName: "Breakfast.png", search: "Breakfast" },
    { fileName: "Brunch.png", search: "brunch" },
    { fileName: "Brunch.png", search: "lunch" },
    { fileName: "Sundae.png", search: "Sundae" },
    { fileName: "Kiwi.png", search: "New Zealand" },
    { fileName: "Kiwi.png", search: "Tegal" },
    { fileName: "Taco.png", search: "Taco" },
    { fileName: "Taco.png", search: "Mexican torta restaurant" },
    { fileName: "American.png", search: "American" },
    { fileName: "MeatDish.png", search: "Meat Dish" },
    { fileName: "Kebab.png", search: "Kebab" },
    { fileName: "Chocolate.png", search: "Chocolate" },
    { fileName: "Fruit.png", search: "Fruit" },
    { fileName: "Tempura.png", search: "Tempura" },
    { fileName: "Deli.png", search: "Deli" },
    { fileName: "Belgian.png", search: "Belgian" },
    { fileName: "Kaiseki.png", search: "Kaiseki" },
    { fileName: "Gyudon.png", search: "Gyudon" },
    { fileName: "Family.png", search: "Family" },
    { fileName: "Pastry.png", search: "Pastry" },
    { fileName: "Pastry.png", search: "Konditorei" },
    { fileName: "Creperie.png", search: "Creperie" },
    { fileName: "Izakaya.png", search: "Izakaya" },
    { fileName: "Patisserie.png", search: "Patisserie" },
    { fileName: "Yakitori.png", search: "Yakitori" },
    { fileName: "Seafood.png", search: "Seafood" },
    { fileName: "Salad.png", search: "Salad" },
    { fileName: "Pie.png", search: "Pie" },
    { fileName: "Bar.png", search: "Bar" },
    { fileName: "Bar.png", search: "tavern" },
    { fileName: "GF.png", search: "gluten" },
    { fileName: "Korean.png", search: "Korean" },
    { fileName: "TexMex.png", search: "Tex-Mex" },
    { fileName: "Sushi.png", search: "Sushi" },
    { fileName: "Cake.png", search: "Cake" },
    { fileName: "IceCream.png", search: "Ice cream" },
    { fileName: "Cheesecake.png", search: "Cake shop" },
    { fileName: "Cheesecake.png", search: "dessert" },
    { fileName: "Bread.png", search: "Bakery" },
    { fileName: "Thai.png", search: "Thai" },
    { fileName: "Hamburger.png", search: "Hamburger" },
    { fileName: "Steak.png", search: "Steak" },
    { fileName: "Australian.png", search: "Australian" },
    { fileName: "Chicken.png", search: "Chicken" },
    { fileName: "German.png", search: "German" },
    { fileName: "Okonomiyaki.png", search: "Okonomiyaki" },
    { fileName: "Indian.png", search: "Indian" },
    { fileName: "Indian.png", search: "curryplace" },
    { fileName: "Noodle.png", search: "Noodle" },
    { fileName: "Ramen.png", search: "Ramen" },
    { fileName: "Yakiniku.png", search: "Yakiniku" },
    { fileName: "Donut.png", search: "Donut" },
    { fileName: "Mexican.png", search: "Mexican R" },
    { fileName: "BubbleTea.png", search: "Bubble tea" },
    { fileName: "FishAndChips.png", search: "Fish & Chips" },
    { fileName: "FishAndChips.png", search: "Fish and chips" },
    { fileName: "Pizza.png", search: "Pizza" },
    { fileName: "Vegan.png", search: "Vegan" },
    { fileName: "Vegan.png", search: "vegetarian" },
    { fileName: "WineBar.png", search: "Wine" },
    { fileName: "Brewery.png", search: "Brewery" },
    { fileName: "Brewery.png", search: "Brewpub" },
    { fileName: "Brewery.png", search: "Pub" },
    { fileName: "Brewery.png", search: "Sports bar" },
    { fileName: "Brewery.png", search: "Beer garden" },
    { fileName: "Brewery.png", search: "Gastropub" },
    { fileName: "Brewery.png", search: "Beverages" },

    { fileName: "Brewery.png", search: "Beer hall" },
    { fileName: "Brewery.png", search: "Microbrewery" },
    { fileName: "Brewery.png", search: "Tavern" },
    { fileName: "Brewery.png", search: "Brasserie" },
    { fileName: "BBQ.png", search: "Barbecue" },
    { fileName: "BBQ.png", search: "Grill" },
    { fileName: "Japanese.png", search: "Japanese" },
    { fileName: "Italian.png", search: "Italian" },
    { fileName: "French.png", search: "French" },
    { fileName: "Balinese.png", search: "Balinese" },
    { fileName: "Balinese.png", search: "Indonesian" },
    { fileName: "Chinese.png", search: "Chinese" },
    { fileName: "Chinese.png", search: "中餐馆" },
    { fileName: "Chinese.png", search: "Sichuan" },
    { fileName: "Chinese.png", search: "Hunan" },
    { fileName: "Vietnamese.png", search: "Vietnamese" },
    { fileName: "Vietnamese.png", search: "Pho restaurant" },
    { fileName: "Cafe.png", search: "cafe" },
    { fileName: "Cafe.png", search: "tea" },
    { fileName: "Cafe.png", search: "Coffee shop" },
    { fileName: "Cafe.png", search: "Coffee roasters" },
    { fileName: "Cafe.png", search: "Coffee stand" },
    { fileName: "Wok.png", search: "Wok restaurant" },
    { fileName: "FastFood.png", search: "fast food" },
    { fileName: "Tonkatsu.png", search: "Tonkatsu" },
    { fileName: "Padang.png", search: "Padang" },
    { fileName: "Chophouse.png", search: "Chophouse" },
    { fileName: "Burrito.png", search: "Burrito" },
    { fileName: "Unagi.png", search: "Unagi" },//eel
    { fileName: "Unagi.png", search: "eel" },
    { fileName: "Ryotei.png", search: "Ryotei" },
    { fileName: "Syokudo.png", search: "Syokudo" },
    { fileName: "Kushiyaki.png", search: "Kushiyaki" },
    { fileName: "Falafel.png", search: "Falafel" },
    { fileName: "Exhibition.png", search: "Exhibition" },
    { fileName: "Kitchen.png", search: "Shared-use commercial kitchen" },
    { fileName: "Popcorn.png", search: "Popcorn" },
    { fileName: "Swedish.png", search: "Swedish" },
    { fileName: "Israeli.png", search: "Israeli" },
    { fileName: "Ecuadorian.png", search: "Ecuadorian" },
    { fileName: "Armenian.png", search: "Armenian" },
    { fileName: "Betawi.png", search: "Betawi" },
    { fileName: "Curry.png", search: "Curry" },
    { fileName: "Obanzai.png", search: "Obanzai" },
    { fileName: "Rice.png", search: "Pilaf" },
    { fileName: "Rice.png", search: "Rice" },
    { fileName: "Sicilian.png", search: "Sicilian" },
    { fileName: "Roman.png", search: "Roman" },
    { fileName: "Tuscan.png", search: "Tuscan" },
    { fileName: "Neapolitan.png", search: "Neapolitan" },
    { fileName: "Paraguayan.png", search: "Paraguayan" },
    { fileName: "Norwegian.png", search: "Norwegian" },
    { fileName: "Southern.png", search: "Southern" },
    { fileName: "Floridian.png", search: "Floridian" },
    { fileName: "Fondue.png", search: "Fondue" },
    { fileName: "SoulFood.png", search: "Soul food" },
    { fileName: "Andalusian.png", search: "Andalusian" },
    { fileName: "Gyro.png", search: "Gyro" },
    { fileName: "Syrian.png", search: "Syrian" },
    { fileName: "Motorway.png", search: "Motorway" },
    { fileName: "Motorway.png", search: "Rest stop" },

    { fileName: "CountryFood.png", search: "Country food" },
    { fileName: "Salvadoran.png", search: "Salvadoran" },
    { fileName: "Crab.png", search: "Crab" },
    { fileName: "HotDog.png", search: "Hot Dog" },



    { fileName: "GolfClub.png", search: "golf club" },
    { fileName: "GolfClub.png", search: "golf course" },
    { fileName: "GolfClub.png", search: "golf driving range" },
    { fileName: "Cruise.png", search: "Cruise" },

    { fileName: "Zoo.png", search: "Zoo" },
    { fileName: "PetrolStation.png", search: "petrol station" },
    { fileName: "WildlifeSanctuary.png", search: "Wildlife Sanctuary" },
    { fileName: "CookingSchool.png", search: "cooking school" },
    { fileName: "CookingSchool.png", search: "Co-ed school" },
    { fileName: "CookingSchool.png", search: "Community college" },//TODO: maybe?
    { fileName: "CookingSchool.png", search: "Cooking class" },
    { fileName: "Bowling.png", search: "Bowling" },
    { fileName: "Lodge.png", search: "Lodge" },
    { fileName: "Mountain.png", search: "Mountain" },
    { fileName: "Amusement.png", search: "Amusement" },
    { fileName: "Museum.png", search: "Museum" },
    { fileName: "Temple.png", search: "Temple" },
    { fileName: "Wedding.png", search: "Wedding" },
    { fileName: "Horse.png", search: "Horse" },
    { fileName: "Chef.png", search: "Personal Chef" },
    { fileName: "CiderMill.png", search: "Cider Mill" },
    { fileName: "Orchard.png", search: "Orchard" },
    { fileName: "Aquarium.png", search: "Aquarium" },
    { fileName: "SurfShop.png", search: "Surf shop" },
    { fileName: "SoftDrink.png", search: "Soft drinks" },









    // Stores -
    { fileName: "Confectionery.png", search: "Confectionery" },
    { fileName: "Confectionery.png", search: "Biscuit Shop" },

    { fileName: "Butcher.png", search: "Butcher" },
    { fileName: "Butcher.png", search: "Poultry store" },
    { fileName: "Butcher.png", search: "Meat products store" },
    { fileName: "BottleShop.png", search: "Bottle Shop and Liquor Store" },
    { fileName: "BottleShop.png", search: "Bottle Shop" },
    { fileName: "BottleShop.png", search: "Beer store" },

    { fileName: "BottleShop.png", search: "Off Licence" },
    { fileName: "BottleShop.png", search: "Liquor store" },
    { fileName: "BottleShop.png", search: "Alcohol retail monopoly" },
    { fileName: "BottleShop.png", search: "Beer shop" },
    { fileName: "BottleShop.png", search: "Alcoholic beverage wholesaler" },


    { fileName: "OrganicShop.png", search: "organic shop" },
    { fileName: "OrganicShop.png", search: "organic food" },
    { fileName: "Supermarket.png", search: "Supermarket" },
    { fileName: "Supermarket.png", search: "Greengrocer" },
    { fileName: "Supermarket.png", search: "Wholesale food store" },
    { fileName: "Supermarket.png", search: "Frozen food store" },
    { fileName: "Supermarket.png", search: "General store" },
    { fileName: "Supermarket.png", search: "Wholesale grocer" },
    { fileName: "Supermarket.png", search: "Cash and carry wholesaler" },


    { fileName: "GroceryStore.png", search: "Grocery Store" },
    { fileName: "GroceryStore.png", search: "Natural goods store" },

    { fileName: "Market.png", search: "Market" },
    { fileName: "Mall.png", search: "Mall" },
    { fileName: "DepartmentStore.png", search: "Department store" },
    { fileName: "HobbyStore.png", search: "Hobby Store" },
    { fileName: "WarehouseStore.png", search: "Warehouse store" },
    { fileName: "ConvenienceStore.png", search: "Convenience store" },
    { fileName: "CoffeeStore.png", search: "Coffee store" },
    { fileName: "DiscountStore.png", search: "Discount store" },
    { fileName: "DiscountStore.png", search: "Discount shop" },
    { fileName: "VitaminStore.png", search: "Vitamin & supplements store" },
    { fileName: "VitaminStore.png", search: "Vitamin & Supplements Shop" },

    { fileName: "CandyStore.png", search: "Candy Store" },
    { fileName: "CandyStore.png", search: "Sweet shop" },

    // others -
    { fileName: "TouristAttraction.png", search: "Tourist Attraction" },
    { fileName: "TouristAttraction.png", search: "Landmark" },
    { fileName: "TouristAttraction.png", search: "Reef" },



    ];

    isStore(restaurantType: string): boolean {
        return restaurantType != null && (restaurantType.includes("store")
            || restaurantType.includes("Supermarket")
            //Donut shop, Ice cream shop .... || pin.restaurantType.includes("shop"))
            || restaurantType.includes("market")
            || restaurantType.includes("Market")
            || restaurantType.includes("mall")
            || restaurantType.includes("Hypermarket")
            || restaurantType.includes("Grocery store")
            || restaurantType.includes("Food products supplier")
            || restaurantType.includes("Condiments supplier")
            || restaurantType.includes("Catering food and drink supplier")
            || restaurantType.includes("Department Store")
            || restaurantType.includes("Bottle Shop")
            || restaurantType.includes("Food bank")
            || restaurantType.includes("Op Shop")
            || restaurantType == "Shop"
            || restaurantType == "Food bank"
            || restaurantType == "Oyster supplier"
            || restaurantType == "Catholic church"
            || restaurantType == "Discount Shop"
            || restaurantType == "Greengrocer"
            || restaurantType == "Wholesale grocer"
            || restaurantType == "Bottled water supplier"
            || restaurantType == "Store"
            || restaurantType == "Ham shop"
            || restaurantType == "Alcohol retail monopoly"
            || restaurantType == "Cash and carry wholesaler"
            || restaurantType == "Convenience Store"
            || restaurantType == "Beer shop"
            || restaurantType == "Alcoholic beverage wholesaler"
            || restaurantType == "Stationery Shop"
            || restaurantType == "生鲜市场" //fresh market
            || restaurantType == "美食杂货店"//gourmet grocery store
            || restaurantType == "General Store"
            || restaurantType == "Vegetable wholesaler"
            || restaurantType == "Discount Store"
            || restaurantType == "Gourmet Grocery Shop"
            || restaurantType == "Shopping Centre"
            || restaurantType == "Produce wholesaler"
            || restaurantType == "Stores and shopping"
            || restaurantType == "Vitamin & Supplements Shop"
            || restaurantType == "Baking Supply Shop"
            || restaurantType == "Biscuit Shop"


        );
    }


    isHotel(restaurantType: string): boolean {
        if (restaurantType == null) return false;
        return restaurantType.toLowerCase().includes("hotel")
            || restaurantType == "5-star hotel"
            || restaurantType == "Guest house"
            || restaurantType == "Accommodation"
            || restaurantType == "Holiday apartment rental"
            || restaurantType == "Homestay"
            || restaurantType == "Self-catering accommodation"
            || restaurantType == "Holiday home"
            || restaurantType == "Serviced accommodation"
            || restaurantType == "Hostel"
            || restaurantType == "Lodging"
            || restaurantType == "Guesthouse"
            || restaurantType == "Health resort"

            ;
    }
    isOther(restaurantType: string): boolean {
        return restaurantType == null || Others.includes(restaurantType);
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
        if (this.isHotel(pin.restaurantType)) color = "#00FF00";
        if (this.isStore(pin.restaurantType)) color = "#0000FF";
        if (this.isOther(pin.restaurantType)) color = "#00FFFF";
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
            return `IrishPub.png`;
        }
        if (restaurantType.toLowerCase().includes('yacht')
            || restaurantType.toLowerCase().includes('boat')
            || restaurantType.toLowerCase().includes('sailing')) {
            return `Yacht.png`;
        }

        var fileName = null;
        this.images.forEach(item => {
            if (restaurantType.toLowerCase().includes(item.search.toLowerCase())) {
                fileName = `${item.fileName}`;
            }
        });
        if (fileName != null) return fileName;

        if (restaurantType.toLowerCase() == 'restaurant'
            || restaurantType.toLowerCase() == 'fixed-price restaurant') {
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
        if (restaurantName.toLowerCase().startsWith("lawson")) {
            return `Lawson.png`;
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