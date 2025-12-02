# Gluten Angular Map

This application presents a map based view of Gluten-free restaurants/hotels and other interesting locations. It provides an efficient way to research relevant 
posts about places close to a specific area. 
The intent is not to provide a fully featured application, it is to provide a search function that provides summary and links to sources (the Google(search) for GF people).

## Features

- Filter by location, just scroll and zoom the map to the area of interest.

- Filter by location category (Hotel, shops etc).

- Filter by restaurant type (BBQ, Sushi, Cafe etc).

- Pin category, low/high confidence this provides some indication to the potential accuracy of the pin info.

- Pin list view, search for key words.

- Group list view, provides a list of relevant FB groups for the area in view.

- link to chatgpt (with search query), allows additional info to be searched.

- link to google maps, allow reading of google pin info and precise directions to the venue.

- links to relevant FB topics.

- Pin summary (when publicly available). A brief summary of the pin.

## Design notes

To maximise UI responsiveness and efficiency, data is loaded for a large region (generally based around countries). This increases initial load times, with the 
trade-off that this data is long term cache-able and the following clicks and map scrolls do not require a server API call. 

### Considerations 

- a single server hosted with no region replication (this would cause long latency for more distant regions).

- the data does not frequently change, so it can be cached client side for long periods of time.

- normal use is expected to generate many clicks and scrolls of the map.

- a single large dataset load will cause the application to have a slow startup time.

## Generic developer info

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.9.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

### Deploy to static website 

swa deploy ./dist/gluten-angular-map/browser --env production --app-name GlutenAngular

(see https://edi.wang/post/2022/11/17/deploy-to-azure-static-web-app-from-local-machine-without-github-action)
