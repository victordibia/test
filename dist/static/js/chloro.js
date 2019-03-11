mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY3eGYyMGYxdzN5cGF1YnV6MWZqMSJ9.VxJJ0x_xhXRmBt4u5WciDQ'
// mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY2OWp4MGYwaTQ0cXBkaHFsc2hueiJ9.JdZVrIDyHkAsnuXqAxycsg';
mapCenter = [-73.991251, 40.7272];
mapZoom = 11.719523956300254 //11.094530301157375
var initialRadius = 5;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    zoom: mapZoom,
    center: mapDefault.center,
    pitch: 45
});



let taxiZones = []
let shuffleTaxiIndex = []
let numClosest = 5;
let newSetDelay = 5000
let monteCarloAnimationPaused = true;
let monteCarloIntervalVar = null

let setCounter = 0;
let fadeDuration = 0
let displayDuration = 3000

let cycleSequence = []
cycleTimePeriods()
cycleIndex = 0
let cycleInterval = displayDuration + fadeDuration * 2

numRoutes = 9;
map.on('load', function () {

    // showTraderJoes()

    // loadOutlierdata("bike", bikeOutlierFilePath) 

});




let timeBox = document.getElementById("timebox")
let timeBinBox = document.getElementById("timeofday")
let sourceZoneBox = document.getElementById("sourcezone")
let topinfobox = document.getElementById("topinfobox")
let floatHoverBox = document.getElementById("floatboxhover")
let todRadioButton = document.getElementById("todradiobutton")
let loadingOverlay = document.getElementById("loadingoverlay")
let outlierlegendBox =  document.getElementById("outlierlegend")
// topinfobox.addEventListener("mouseenter", function () {
//     monteCarloAnimationPaused = true
// })

// topinfobox.addEventListener("mouseleave", function () {
//     
// })


// timeCounter = 0
// setInterval(() => {

//     timeCounter++
// }, displayDuration);





function startMonteCarloCycle() {
    monteCarloCycleFunction()
    monteCarloIntervalVar = setInterval(() => {
        console.log("interval firing") 
        monteCarloCycleFunction()
    }, cycleInterval);
}

function monteCarloCycleFunction(){
    // console.log("Source:", cycleSequence[cycleIndex].startZone, taxiHolder[cycleSequence[cycleIndex].startZone].properties.zone)
    currentSelectedTaxiZone = cycleSequence[cycleIndex].startZone
    updateLabels(cycleSequence[cycleIndex].timeOfDay, cycleSequence[cycleIndex].startZone)
    targetRoutes = getCorrelation(cycleSequence[cycleIndex].timeOfDay, cycleSequence[cycleIndex].startZone)
    addSourceTargets(cycleSequence[cycleIndex].startZone, targetRoutes)

    cycleIndex++
    if (cycleIndex >= cycleSequence.length) {
        cycleIndex = 0
    }
}

function updateLabels(tod, sz) {
    timeBinBox.innerHTML = tod.toUpperCase()
    sourceZoneBox.innerHTML = taxiHolder[sz].properties.zone
    timeBox.innerHTML = timesOfDayRange[tod]

}


// Event listeners

// Pause/Unpause when spacebar pressed

document.addEventListener("keydown", keyPressFunction, false);

function keyPressFunction(e) {
    var keyCode = e.keyCode;
    if (keyCode == 32) {
        toggleMonteCarloPause()
    }else if(keyCode == 84){
        toggleOutlierPause()
    }
}

function toggleOutlierPause(){
 
    // console.log("outlier toggle", traderOutlierAnimationisPaused)
    if(traderOutlierAnimationisPaused){
       
        launchTraderRouteAnimation()
        traderOutlierAnimationisPaused = false
        flushTraderRoute()
        map.easeTo(mapTraderViz)
        todRadioButton.classList.add("hidden")
        outlierlegendBox.classList.remove("hidden")
        
        // add3DBuildings()
    }else{
        traderOutlierAnimationisPaused  = true
        flushTraderRoute()
        flushZoneHolder()
        clearInterval(traderAddRoutesIntervalVar)
        clearInterval(traderRouteAnimationIntervalVar)
        map.easeTo(mapDefault)
        todRadioButton.classList.remove("hidden")
        outlierlegendBox.classList.add("hidden")
       
        // remove3DBuilding()
    }
}

function toggleMonteCarloPause() {
    if (monteCarloAnimationPaused) {
        startMonteCarloCycle() 
        flushZoneHolder()
        monteCarloAnimationPaused = false

        todRadioButton.classList.add("hidden")
        floatHoverBox.classList.add("hidden")
        document.getElementById("pausetext").innerText = "PAUSE"

        // pause outlier animation is in progress
        if(!traderOutlierAnimationisPaused){
            toggleOutlierPause();
        }
        
    } else {
        clearInterval(monteCarloIntervalVar)
        monteCarloAnimationPaused = true
        todRadioButton.classList.remove("hidden")
        document.getElementById("pausetext").innerText = "START"
        // if (traderOutlierAnimationisPaused) {
            // setTimeout(() => {
                handleClickZone(currentSelectedTOD, currentSelectedTaxiZone)
            // }, 1000);
        // }
       
    }
}


todRadioButton.addEventListener("change", function (e) {
    // console.log("changed ..", e.target.value)
    // flushZoneHolder()
    currentSelectedTOD = e.target.value
    handleClickZone(e.target.value, currentSelectedTaxiZone)
    // console.log("zoon level", map.getZoom(), map.getCenter(), map.getPitch())
    // map.zoomTo(15)
})


// Pause on window hidden
document.addEventListener('visibilitychange', function () {
    if (document.hidden && !monteCarloAnimationPaused) {
        flushZoneHolder()
        toggleMonteCarloPause()
        console.log("Windown out of focus  .. pausing")
    } else {
        // monteCarloAnimationPaused = false
        // console.log("Windown back in focus  .. resuming")
    }

    if (document.hidden && !traderOutlierAnimationisPaused){
        console.log("Windown out of focus bike trans  .. pausing")
        toggleOutlierPause()
    }
}, false);