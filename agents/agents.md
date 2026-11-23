# AI Agent Knowledge Base

This document contains information that is specific to the **Gluten Angular** codebase and may not be obvious from a generic AI perspective. The goal is to provide context for future automated agents or developers so they can make more informed changes.

## 1. Project Overview
- **Framework:** Angular (v15+)
- **Styling:** SCSS with Tailwind CSS integration
- **State Management:** NgRx (or a custom service layer, depending on the module)
- **Testing:** Jasmine/Karma for unit tests, Cypress for end‑to‑end.
- **Build Tool:** Angular CLI + Webpack under the hood.
+## 2. Core Application Component (`AppComponent`)
- **Selector:** `app-root`
- **Standalone component** – imports child components directly: `MapLeafletComponent`, `NavbarComponent`, `SidebarComponent`, `MapfiltersComponent`.
- **Imports & Dependencies**
  - Angular core modules: `Component`, `inject`, `Input`, `Renderer2`, `ViewChild`.
  - Child components: `NavbarComponent`, `MapLeafletComponent`, `MapfiltersComponent`, `SidebarComponent`.
  - Models: `TopicGroup`, `CountryMeta`, `Restaurant`, `FilterOptions`.
  - Angular platform-browser services: `Title`, `Meta`.
  - Services: `SiteApiService`, `GlutenApiService`, `GroupService`, `PinSelectionService`.

- **Properties**
  - `title`: string – page title.
  - `description`: string – meta description.
  - `selectedTopicGroup`: TopicGroup | null – currently selected group.
  - `showOptions`: FilterOptions – default filter options.
  - `restaurants`: Restaurant[] – list of restaurants (currently unused in this file).
  - `country`: string | undefined – current country code.
  - `renderer`: Renderer2 – injected renderer for DOM manipulation.
  - `child`: MapLeafletComponent – reference to child map component via ViewChild.

- **Lifecycle**
  - `ngOnInit()`:
    - Loads country metadata from `SiteApiService`.
    - Determines selected country and sets SEO data accordingly.
    - Calls `pinSelectionService.loadData()`.
    - Subscribes to group data from `GlutenApiService` and stores it in `GroupService`.

- **View Methods**
  - `showListView()` – triggers child component to load details for all pins in the selected country.
  - `showGroupsView()` – triggers child component to reload map pins.

- **Country Change Handler**
  - `countryChanged(country: string)` updates internal `country` property.

- **SEO & Structured Data**
  - `setSEOData(title, description, gf, coeliac)`:
    - Sets page title.
    - Adds meta tags for description, keywords, and Open Graph.
    - Adds a `robots` noindex tag when on `/places/*`.
  - `addStructuredData(title, description)`:
    - Creates a `<script type="application/ld+json">` element with Organization schema.

- **Notes**
  - Uses Angular's dependency injection via constructor and the `inject()` function.
  - The component relies heavily on services for data fetching and state management.

---

## 2. Folder Structure Highlights
```
src/
├─ app/                # Main application modules
│   ├─ core/           # Singleton services, interceptors, guards
│   ├─ shared/         # Reusable components, directives, pipes
│   └─ feature/        # Feature‑specific modules (lazy loaded)
├─ assets/             # Static files (images, fonts, i18n JSONs)
└─ environments/      # Environment configuration files
```
- **Lazy Loading:** Most feature modules are lazy‑loaded via the router.
- **Internationalization:** Uses `@ngx-translate/core` with JSON translation files in `assets/i18n`.

## 3. Naming Conventions
| Type | Convention |
|------|------------|
| Components | `feature-name.component.ts`
| Services   | `feature-name.service.ts`
| Modules    | `feature-name.module.ts`
| State      | `feature-name.state.ts` (NgRx) or `feature-name.store.ts` (custom)

## 4. Common Patterns & Gotchas
- **ChangeDetectionStrategy.OnPush** is used extensively; remember to emit new object references when updating inputs.
- **Observables** are often shared via the `shareReplay(1)` operator to avoid duplicate HTTP requests.
- **Error Handling:** All HTTP calls go through a global interceptor that logs errors and shows user‑friendly messages.
- **Form Validation:** Reactive forms with custom validators; check `src/app/shared/validators` for reusable logic.

## 5. Build & Deployment Notes
- CI pipeline runs `ng build --prod` and deploys to an Azure Blob Storage bucket.

## App Configuration (`app.config.ts`)
- **Purpose:** Provides global application configuration, including router setup, HTTP client, animations, and error handling.
- **Key Features**
  - Uses `ApplicationConfig` to register providers:
    - `HttpClientModule` for HTTP services.
    - Zone change detection with event coalescing.
    - Router configured with component input binding (`withComponentInputBinding()`).
    - Asynchronous animations via `provideAnimationsAsync()`.
    - Custom global error handler `MyErrorHandler` that logs errors to an external API.
  - `ConfigService` is a placeholder injectable service for future configuration retrieval (currently unused but ready for expansion).

- **Custom Error Handler (`MyErrorHandler`)**
  - Implements Angular's `ErrorHandler`.
  - Injects `HttpClient` and posts error messages to `https://thegfshire.azurewebsites.net/api/log`.
  - Logs responses or errors to the console.

- **Notes**
  - The configuration is loaded at bootstrap via `appConfig`.
  - Error handling can be extended by adding more logic in `handleError`.

## Routing Module (`app.router.module.ts`)
- **Purpose:** Defines application routes and lazy loading configuration.
- **Routes**
  - `/main` → `AppComponent`.
  - `/products` → Lazy loads the same component (currently a placeholder; typically would load a feature module).
  - Default redirect to `/main`.
  - Wildcard redirect to `/main`.
- **Configuration Details**
  - Uses `RouterModule.forRoot()` with `{ bindToComponentInputs: true }` to automatically bind route parameters to component inputs.
  - Demonstrates lazy loading via dynamic import syntax (`import('./app.component').then(m => m.AppComponent)`), though in practice this would point to a feature module rather than the root component.
- **Notes**
  - The routing setup is minimal and may need expansion for additional features or authentication guards.

## Routing Configuration (`app.routes.ts`)
- **Purpose:** Defines application routes for the main component.
- **Routes**:
  - `/` → `AppComponent` (default route).
  - `/places/:id` → `AppComponent`, used to display details of a specific place by ID.
  - `/c/:country` → `AppComponent`, used to filter or display content based on country code.
- **Notes**:
  - All routes point to the same component (`AppComponent`) and rely on route parameters to adjust displayed data.
  - The routing configuration is minimal; additional guards, lazy loading, or feature modules can be added as the application grows.

## Highlight Pipe (`highlight.pipe.ts`)
- **Purpose:** Provides a reusable pipe to highlight search terms within text by wrapping matches in `<mark>` tags.
- **Implementation Details**:
  - Implements `PipeTransform` and is declared as a standalone pipe.
  - Uses a regular expression constructed from the provided `searchQuery` with global and case‑insensitive flags (`'gi'`).
  - If no query is supplied or an error occurs during regex creation, it returns the original text unchanged.
- **Usage**:
  ```html
  <p>{{ someText | highlight: searchTerm }}</p>
  ```
  This will wrap all occurrences of `searchTerm` in `<mark>` tags for visual emphasis.
  
## Site API Service (`siteapi.service.ts`)

- Refactored to cache country metadata after the first load.
- Removed unused HTTP options and simplified error handling.
- Added JSDoc comments for better maintainability.
- Exposed `getSelectedCountry()` instead of `getCountryMeta()`.
- Simplified URL parsing logic in `getUrlCountry()`.

## Map Leaflet Component (`map.component.ts`)
- **Selector:** `app-map` (standalone component).
- **Purpose:** Renders an interactive Leaflet map, manages pins, groups, and user interactions.
- **Key Features**:
  - Uses Leaflet with custom tile layers (`openTiles`, `stadiaTiles`) and a locate control plugin.
  - Handles dynamic loading of pin data from the API based on current map bounds and center country.
  - Supports filtering by restaurant type (hotels, stores, others), chain status, open‑now, and temporary closures.
  - Manages selection state: clicking a marker highlights it, updates `selectedTopicGroup`, and triggers detailed view via modal or navigation to `/places/:id`.
  - Integrates with multiple services (`GlutenApiService`, `PinService`, `GroupService`, etc.) for data fetching, caching, analytics, and diagnostics.
  - Implements lazy loading of pin details on demand; caches pins per country to avoid redundant API calls.
  - Provides utility methods for map movement handling, bounds calculation, and marker icon generation.
- **Lifecycle**:
  - `ngAfterViewInit` initializes the map, sets view based on URL or user location, loads initial pins, and starts watching location changes.
  - `loadMapPins()` orchestrates API calls, updates markers, and handles URL‑based pin selection.
  - `showMapPins()` renders markers with appropriate icons and click handlers.
- **Notes**:
  - The component is heavily event‑driven; many inputs trigger reloading of pins (`@Input` setters).
  - Uses a `MarkerGroup` layer to batch marker updates for performance.
  - Handles both regular pins (`TopicGroup`) and Google Maps pins (`GMapsPin`).

## Map Filters Component (`mapfilters.component.ts`)
- **Selector:** `app-mapfilters` (standalone component).
- **Purpose:** Provides UI controls for filtering map pins by restaurant type, pin visibility, and map provider.
- **Key Features**:
  - Emits `optionsChange`, `restaurantChange`, `listViewOpenChange`, `groupViewOpenChange`, and `mapChange` events to inform parent components of user actions.
  - Uses a `FilterOptions` model to track current filter state (show hotels, stores, others, GMPins, chains, open‑now, temporarily closed, selected map).
  - Offers methods to show/hide modal dialogs for restaurant list, pin list view, and group list view via `ModalService`.
  - Tracks user interactions with Google Analytics (`AnalyticsService`).
  - Initializes a default set of restaurants from `restaurantTypes` on `ngOnInit`.
- **Inputs/Outputs**:
  - Inputs: `selectedCountry`, `selectedMap`, various boolean flags for each filter category.
  - Outputs: corresponding event emitters to propagate changes upward.
- **Notes**:
  - The component relies heavily on Angular's change detection; it emits events whenever an input value changes.
  - It uses the modal service to open predefined modals identified by string IDs.

## Navbar Component (`navbar.component.ts`)
- **Selector:** `app-navbar` (standalone component).
- **Purpose:** Displays a navigation bar that reflects the currently selected country.
- **Key Features**:
  - Accepts an input `selectedCountry`; normalizes values starting with "United States" to just "United States" for display purposes.
  - No additional logic or services; primarily used as a presentational component in the layout.
- **Inputs/Outputs**:
  - Input: `selectedCountry` (string | undefined) – triggers internal state update on set.
- **Notes**:
  - The component is minimal and could be expanded to include navigation links, language selection, or branding if needed.

## Sidebar Component (`sidebar.component.ts`)
- **Selector:** `app-sidebar` (standalone component).
- **Purpose:** Displays detailed information about the currently selected pin/topic group, including summary, Facebook links, and analytics tracking.
- **Key Features**:
  - Accepts inputs for `selectedCountry` and `selectedTopicGroup`; updates internal state accordingly.
  - Uses `HighlightPipe` to emphasize search terms in displayed text.
  - Provides methods (`linkClick`, `mapLinkClick`, etc.) that fire Google Analytics events when users interact with links or buttons.
  - Builds Facebook permalink URLs for topics via `buildFbUrl`.
  - Determines whether a summary is available and formats it appropriately (AI‑generated vs. Google‑maps generated).
  - Handles image load errors by falling back to a default `FB.png` asset.
- **Inputs/Outputs**:
  - Inputs: `selectedCountry`, `selectedTopicGroup`; no outputs defined.
- **Notes**:
  - The component relies on services (`AnalyticsService`, `SiteApiService`) for analytics and country metadata.
  - It uses Angular Material's progress spinner to indicate loading states (though not shown in the snippet).

## Modal Component (`modal.component.ts`)
- **Selector:** `jw-modal` (standalone component).
- **Purpose:** Provides a generic modal dialog that can be opened/closed from any component via the shared `ModalService`.
- **Key Features**:
  - Registers itself with `ModalService` on init and deregisters on destroy, enabling global control.
  - Moves its DOM element to the end of `<body>` so it overlays all content.
  - Handles background click to close the modal (checks if clicked target has class `jw-modal`).
  - Exposes `open()` and `close()` methods that toggle visibility and add/remove a CSS class on `<body>` (`jw-modal-open`) for page styling.
- **Inputs/Outputs**:
  - Input: optional `id` string to identify the modal instance (used by `ModalService.open(id)`).
  - No outputs; state is managed internally via `isOpen`.
- **Notes**:
  - Uses `ViewEncapsulation.None` so styles defined in `modal.component.less` apply globally.
  - The component relies on Angular's `ElementRef` to manipulate the DOM directly, which is acceptable for a modal overlay but should be used cautiously in larger applications.

## Filter Options Model (`filterOptions.ts`)
- **Purpose:** Encapsulates all filter settings used by the map and sidebar components.
- **Properties**:
  - `ShowHotels`, `ShowStores`, `ShowOthers`: booleans controlling visibility of each restaurant type.
  - `ShowGMPins`: toggles display of Google‑Maps pins that lack detailed data.
  - `ShowChainPins`: controls whether chain restaurants are shown.
  - `ShowNonGFGroupPins`: indicates if non‑gluten‑free group pins should be displayed.
  - `ShowTemporarilyClosed`: filters out temporarily closed establishments.
  - `SelectedMap`: string identifier for the chosen map provider (e.g., “OpenStreetMap”).
  - `ShowOpenNow`: toggles the “open now” filter based on real‑time opening hours.
- **Usage**: Passed as an input to components and emitted via `optionsChange` events; services may also read it for analytics or API query construction.

## Data Models (`model.ts`)
- **Purpose:** Defines all TypeScript interfaces and classes used throughout the application to represent pins, topics, groups, user location data, and analytics.
- **Key Interfaces/Classes**:
  - `GMapsPin`: Represents a pin sourced from Google Maps with properties like `pinId`, `label`, coordinates, `restaurantType`, etc.
  - `Restaurant`: Simple class holding visibility flag and name for restaurant type filters.
  - `IpAddressData`: Holds geolocation data returned by an IP‑lookup service (city, region, country, coordinates).
  - `GroupData`: Metadata about a group of pins (name, ID, bounding box, pin counts, selection state).
  - `PinHighlight`: Configuration for highlighting a specific pin on the map.
  - `TopicGroup`: Core representation of a pin with detailed fields (`pinId`, location, label, description, topics array, etc.).
  - `Topic`: Individual topic entry linked to a Facebook post (IDs, URL, title, creation date, selection flag).
  - `PinTopicDetailDTO`: DTO returned from the API containing enriched details for a pin.
  - `PinSummary`: Lightweight summary used when exporting or caching pins.
  - `CountryMeta`: Metadata about a country’s gluten‑free status and spoken languages.
  - `DayOpeningTimesDTO` / `PinOpeningTimesDTO` / `PinExtraDTO`: Structures representing opening hours per day and overall pin schedule.
  - `IsOpen` enum: Indicates whether a pin is currently open, closed, or unknown.
- **Usage**: These models are imported by services (`GlutenApiService`, `MapDataService`) and components to type‑check API responses, cache data, and drive UI logic.

## Restaurant Model (`restaurant.ts`)
- **Purpose:** Simple class used by the filter UI to represent a restaurant type (e.g., “Hotel”, “Store”) and whether it is currently selected for display.
- **Properties**:
  - `Show`: boolean flag indicating if this restaurant type should be shown on the map.
  - `Name`: human‑readable label displayed in the filter list.
- **Usage**: Instantiated in `MapfiltersComponent` to populate the filter options; changes are emitted via `optionsChange`.

## Static Data (`staticData.ts`)
- **Purpose:** Provides two exported arrays used throughout the application:
  - `Others`: A list of miscellaneous place types (e.g., “Spring”, “Opera house”) that are not classified as restaurants but may appear on the map.
  - `restaurantTypes`: An extensive catalog of restaurant categories, including generic terms (“All”), cuisine styles, and specific establishments. This array drives the filter UI in `MapfiltersComponent`.
- **Usage**: Imported by components to populate dropdowns or checkboxes for filtering pins. The arrays are static constants; no runtime modification occurs.

## Analytics Service (`analytics.service.ts`)
- **Purpose:** Wraps Google Analytics (gtag) event tracking for the application.
- **Key Method**:
  - `trackEvent(eventName, eventDetails, eventCategory)` – Sends an event to GA if not in preview mode and gtag is available. Parameters map to GA’s standard fields (`event_category`, `event_label`, `value`).
- **Usage**: Injected into components (e.g., Sidebar, Navbar) to log user interactions such as link clicks and map actions.

## Diagnostic Service (`diagnostic.service.ts`)
- **Purpose:** Provides a lightweight timing utility used for debugging or performance measurements during development.
- **Key Method**:
  - `timer()` – Returns an object exposing two getters:
    - `seconds`: Human‑readable elapsed time in seconds (e.g., “2s”).
    - `ms`: Milliseconds elapsed since the timer was created (e.g., “2000ms”).
- **Usage**: Typically called at the start of a code block and logged to console or used in tests; no side effects beyond measuring time.

## Gluten API Service (`glutenapi.service.ts`)
- **Purpose:** Central HTTP client for all backend interactions (pin data, location, logging, groups, etc.).
- **Key Methods**:
  - `getPins(country)` – Retrieves map‑ready pin data.
  - `getPinHightlight(country)` – Fetches pins that should be highlighted on the map.
  - `getPinDetails(pinId, language)` – Returns detailed topic information for a specific pin.
  - `getPinDetailsCountry(country)` – Same as above but for all pins in a country (used by list view).
  - `tryGetPinDetailsCountryFromCache(country)` – Attempts to fetch cached details via the browser cache.
  - `getLocation(country)` – Uses IP‑based geolocation to center the map.
  - `getGMPin(country)` – Pulls Google‑Maps pins for a country.
  - `postLog(message)` – Sends error logs to the backend API.
  - `getGroups()` – Retrieves group metadata (bounding boxes, pin counts).
  - `getPinsExtraInfo()` – Provides opening times and other extra data.
- **Error Handling**: Uses RxJS `catchError` with two helpers:
  - `handleError` – Logs error to console and returns a fallback value.
  - `handleErrorServerLog` – Also posts the error to the server via `postLog`.
- **Configuration**: Base URL is taken from `environment.apiUrl`; commented alternatives show dev/production/local setups.

## Group Service (`group.service.ts`)
- **Purpose:** Manages group metadata (bounding boxes, pin counts) and determines which groups are active based on map location or user selection.
- **Key Properties**:
  - `groups`: Active groups currently displayed on the map.
  - `allGroups`: Full list of groups fetched from the API.
- **Core Methods**:
  - `setAllGroups(data)` – Initializes `allGroups` and marks all as selected.
  - `setGroupsBasedOnLocation(centerCountryNames, mapCenter)` – Populates `groups` by checking each group’s geographic bounds against the current map center.
  - `isGroupSelected(pinTopicGroup)` – Returns whether a pin should be shown based on its topic groups’ membership in active groups and their selection state.
  - `selectTopicsForCurrentlySelectedGroups(pinTopicGroup)` – Syncs each pin’s topic selection flag with the corresponding group’s selected status.
  - `updateGroupLocalPinCount(pinTopicGroup)` – Increments local pin counters for groups that contain a given pin.
  - `sortGroups()` – Orders active groups by descending local pin count (used in the sidebar).
- **Usage**: Injected into components like `MapfiltersComponent` and `SidebarComponent` to filter pins, update UI counts, and maintain group selection state. 

## Location Service (`location.service.ts`)
- **Purpose:** Provides geolocation utilities for the map component.
- **Key Features**:
  - `getUserLocation()` – Returns a Promise resolving to the device’s latitude/longitude using the browser Geolocation API.
  - `setMapToUserLocation()` – Centers the map on the user’s current location and draws a blue circle marker; returns the coordinates.
  - `startLocationWatching()` / `stopLocationWatching()` – Continuously tracks the user’s position, updating the `locationLayer` with a moving circle. Uses high‑accuracy mode and handles errors gracefully.
- **Output**: Exposes an `@Output() locationLayer` (`L.LayerGroup`) that components can add to their Leaflet map layers.
- **Usage**: Injected into `MapComponent` to enable the “My Location” button, which centers the map on the user’s current position and optionally starts continuous tracking.  

## Map Data Service (`mapdata.service.ts`)
- **Purpose:** Provides map tile layers and geographic helper functions for determining which countries or states are visible in the current viewport.
- **Key Features**:
  - Tile layers: `stadiaTiles`, `openTiles`, `mapTilerTiles` – pre‑configured Leaflet tile layers with attribution.
  - `getCentrePointOfCountry(country)` – Uses Turf to compute a country’s centroid from the EEZ GeoJSON and returns an `L.LatLng`.
  - Viewport helpers:
    - `getCountriesInView(bounds)` / `getStatesInView(bounds)` – Return arrays of country or state names that intersect the current map bounds.
    - `getCountriesInViewPoint(point)` / `getStatesInViewPoint(point)` – Similar but for a single point (used when centering on a location).
- **Dependencies**: Relies on MapLibre‑GL types, Turf.js for spatial calculations, and Leaflet for coordinates.
- **Usage**: Injected into components like `MapComponent` to determine which pins to request from the API based on visible regions.  

## Modal Service (`modal.service.ts`)
- **Purpose:** Central registry for modal components, allowing other parts of the app to open or close modals by ID.
- **Key Methods**:
  - `add(modal)` – Registers a modal component; ensures each has a unique `id`.
  - `remove(modal)` – Unregisters a modal from the internal list.
  - `open(id)` – Finds the modal with the given `id` and calls its `open()` method.
  - `close()` – Closes whichever modal is currently open (`isOpen` flag).
- **Implementation Details**:
  - Maintains an array of active `ModalComponent` instances.
  - Throws errors if a duplicate ID is added or an unknown ID is requested.
- **Usage**: Components (e.g., Sidebar, Navbar) call `modalService.open('someId')` to display the modal; the modal component itself handles its visibility state.  

## Pin Service (`pin.service.ts`)
- **Purpose:** Provides utility functions for determining pin characteristics (type, color, icon URL) and filtering logic based on restaurant data.
- **Key Features**:
  - `isStore`, `isHotel`, `isOther` – Boolean checks that classify a restaurant by its type string.
  - `isInBounds` / `isInBoundsLeaflet` – Determine if a coordinate lies within the current map bounds (MapLibre or Leaflet).
  - `getColor(pin)` – Returns a color code based on whether the pin represents a hotel, store, other, or default.
  - `getUrl(...)`, `getUrlForType`, `getUrlForGeneric`, `getUrlForChain` – Resolve an image filename for a pin by matching restaurant type/name against a large lookup table of icons.
  - `getMarkerIcon(color, restaurantType, restaurantName, className)` – Builds a Leaflet icon object using the resolved URL or a generic colored placeholder.
- **Implementation Details**:
  - Maintains a huge `images` array mapping search terms to PNG filenames; used by `getUrlForType`.
  - Uses string matching (case‑insensitive) and fallback logic for chain names, generic keywords, and default icons.
  - Designed to be injected into components that render pins on the map (`MapComponent`, `SidebarComponent`, etc.).  

## Pin Selection Service (`pinSelection.service.ts`)
- **Purpose:** Handles opening hours logic for pins, determining whether a pin (restaurant) is currently open based on its schedule data.
- **Key Features**:
  - `setDayOfWeek()` – Sets the current day abbreviation used to look up opening times.
  - `getMinutesPastMidnight()` – Utility that converts the current time into minutes since midnight for easy comparison.
  - `isPinOpenNow(pin)` – Returns an `IsOpen` enum (`Yes`, `No`, or `Unknown`) by checking business and lunch opening/closing times from the loaded data.
  - `loadData()` – Fetches extra pin information (opening schedules) via `GlutenApiService` and populates internal lookup maps (`dayOpeningTimes`, `pinOpeningTimesDTO`).
- **Implementation Details**:
  - Uses two nested records: one mapping day‑of‑week IDs to opening times, another mapping pin IDs to their schedule references.
  - Handles edge cases where data may be missing by returning `IsOpen.Unknown`.
  - Designed for injection into components that need real‑time open/closed status (e.g., map pins, sidebar listings).  

## 6. Known Issues / TODOs
- Some legacy components still use template‑driven forms; consider refactoring to reactive forms.
- The `FeatureX` module has a known memory leak when navigating away; investigate the subscription cleanup.

---
Feel free to add more sections as you discover new patterns or quirks in the codebase. This file will serve as a living reference for AI agents and developers alike.

## 7. Component Summary
| Component | Path |
|-----------|------|
| AppComponent | src/app/app.component.ts |
| MapComponent | src/app/map.leaflet/map.component.ts |
| MapFiltersComponent | src/app/mapfilters/mapfilters.component.ts |
| NavbarComponent | src/app/navbar/navbar.component.ts |
| SidebarComponent | src/app/sidebar/sidebar.component.ts |
| ModalComponent | src/app/_components/modal.component.ts |

## 8. Service Summary
| Service | Path |
|---------|------|
| AnalyticsService | src/app/_services/analytics.service.ts |
| DiagnosticService | src/app/_services/diagnostic.service.ts |
| GlutenApiService | src/app/_services/glutenapi.service.ts |
| GroupService | src/app/_services/group.service.ts |
| LocationService | src/app/_services/location.service.ts |
| MapDataService | src/app/_services/mapdata.service.ts |
| ModalService | src/app/_services/modal.service.ts |
| PinService | src/app/_services/pin.service.ts |
| PinSelectionService | src/app/_services/pinSelection.service.ts |
| SiteApiService | src/app/_services/siteapi.service.ts |

## 9. Model Summary
| Model | Path |
|-------|------|
| FilterOptions | src/app/_model/filterOptions.ts |
| Model | src/app/_model/model.ts |
| Restaurant | src/app/_model/restaurant.ts |
| StaticData | src/app/_model/staticData.ts |

## 10. Static Data Files
- `statesSimplified.geo.json` (src/app/staticdata)
- `World-EEZ.geo.json` (src/app/staticdata)


