echo "Updating Production - press a key to continue"
pause 
ng build
#swa deploy ./dist/gluten-angular-map/browser --env production --app-name glutendev 
swa deploy ./dist/gluten-angular-map/browser --env production --app-name GlutenAngular 
#swa deploy ./dist/gluten-angular-map/browser --env production --app-name glutendev 
