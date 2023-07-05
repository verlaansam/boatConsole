

window.onload = (event) => {
  console.log("Loaded!")
    
  var speedPointer = document.getElementById("speedPointer")
  var speed = document.getElementById("speed")
  var depth = document.getElementById("depth")
  var depthPointer = document.getElementById("depthPointer");
  var depthAlarm = document.getElementById("depthAlarm")
  var courseHeading = document.getElementById("courseHeading")
  var lineHeading = document.getElementById("headingLine")
  
  var map = document.getElementById("map")
  var centerButton = document.getElementById("centerMap");
  var clicked = true; 

  let interval;
    
  var velocity;
  var lat;
  var long;
  var heading
  var deep;
    

  async function getData() {
    const responseSpeed = await fetch("./speed.json");
    const jsonDataSpeed = await responseSpeed.json();
    velocity = jsonDataSpeed.spdKn
    const responsePos = await fetch("./pos.json");
    const jsonDataPos = await responsePos.json();
    lat = Number(jsonDataPos.lat)
    long = Number(jsonDataPos.long)
    const responseHead = await fetch("./heading.json");
    const jsonDataHead = await responseHead.json();
    heading = jsonDataHead.heading
    deep = 0.6 //jsonData.deep
  }

  function headingConsole(heading){
    courseHeading.innerHTML = heading + "°"
    lineHeading.style.transform = `rotate(${heading}deg)`
  }
  
  function speedConsole(velocity){
    let velocityAngle = 0;
    let angle = 0;
          
    if(velocity > 10){
      velocityAngle = 10;
    }
    else{
      velocityAngle = velocity;
    }

    angle = velocityAngle*18;
    speedPointer.style.rotate = `${angle}deg`;
    speed.innerHTML = velocity
  };

  function depthConsole(deep){
    let pointerpos = 15;

    if(deep > 10){
        pointerpos = 180;
    }
    else{
      pointerpos = 15 + 18*deep;
    }

    depth.innerHTML = deep;
    depthPointer.style.top = `${pointerpos}px`;
  }

  function depthAlarmSound(){
    depthAlarm.src="/img/volumeOff.svg"
  }

  var map;
  var layer_mapnik;
  var layer_tah;
  var layer_seamark;
  var marker;
              
  var linkTextSkipperGuide = "Beschreibung auf SkipperGuide";
  var linkTextWeatherHarbour = "Meteogramm";
  var language = 'de';

			
  async function jumpTo() {
    var zoom = 14;
    const responsePos = await fetch("./pos.json");
    const jsonDataPos = await responsePos.json();
    lat = Number(jsonDataPos.lat)
    lon = Number(jsonDataPos.long)
    var x = Lon2Merc(lon);
    var y = Lat2Merc(lat);
    map.setCenter(new OpenLayers.LonLat(x, y), zoom);
      return false;
    }

	function Lon2Merc(lon) {
		return 20037508.34 * lon / 180;
	}

	function Lat2Merc(lat) {
		var PI = 3.14159265358979323846;
		lat = Math.log(Math.tan( (90 + lat) * PI / 360)) / (PI / 180);
		return 20037508.34 * lat / 180;
	}

	

	function getTileURL(bounds) {
		var res = this.map.getResolution();
		var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
		var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
		var z = this.map.getZoom();
		var limit = Math.pow(2, z);
		if (y < 0 || y >= limit) {
			return null;
		} else {
			x = ((x % limit) + limit) % limit;
			url = this.url;
			path= z + "/" + x + "/" + y + "." + this.type;
			if (url instanceof Array) {
				url = this.selectUrl(path, url);
			}
			return url+path;
		}
	}

	function drawmap() {
		map = new OpenLayers.Map('map', {
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		eventListeners: {
			"moveend": mapEventMove,
			//"zoomend": mapEventZoom
		},
		controls: [
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.ScaleLine({topOutUnits : "nmi", bottomOutUnits: "km", topInUnits: 'nmi', bottomInUnits: 'km', maxWidth: '40'}),
			new OpenLayers.Control.LayerSwitcher(),
			new OpenLayers.Control.MousePosition(),
			new OpenLayers.Control.PanZoomBar()],
			maxExtent:
			new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
			numZoomLevels: 18,
			maxResolution: 156543,
			units: 'meters'
		});

		// Add Layers to map-------------------------------------------------------------------------------------------------------
		// Mapnik
		layer_mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik");
	    // Seamark
		layer_seamark = new OpenLayers.Layer.TMS("Seezeichen", "http://tiles.openseamap.org/seamark/", { numZoomLevels: 18, type: 'png', getURL: getTileURL, isBaseLayer: false, displayOutsideMaxExtent: true});
		// Harbours
		layer_pois = new OpenLayers.Layer.Vector("Häfen", { projection: new OpenLayers.Projection("EPSG:4326"), visibility: true, displayOutsideMaxExtent:true});
		layer_pois.setOpacity(0.8);
				
		map.addLayers([layer_mapnik, layer_seamark, layer_pois]);
		jumpTo();

		// Update harbour layer
                
		}

  // Map event listener moved
  function mapEventMove(event) {
    // Update harbour layer
  }

  centerButton.addEventListener("click", function(){
    if(clicked){
      centerButton.style.backgroundColor = "green"
      clicked = false;
    } else{
      centerButton.style.backgroundColor = "red"
      clicked = true
    }
  })
  


  function main(){
    getData()
    speedConsole(velocity)
    depthConsole(deep)  
    headingConsole(heading)
    if(clicked){
      jumpTo()
    }
    
  }
  drawmap()

  if (!interval) { interval = setInterval(main ,500); }

};