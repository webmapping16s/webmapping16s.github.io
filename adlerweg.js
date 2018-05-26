/***
* Visualisierung von drei Etappen des Adlerwegs auf einer Leaflet Karte
*
* Datengrundlage: https://www.tirol.gv.at/data/datenkatalog/sport-und-freizeit/adlerweg-tirol/
*
* Grundkarte: Kartenlayer Open Street Map und basemap.at mit Etappen und Links zu den Etappen als Pop-up Fenster
* Erweiterung 1: Live Panoramio Photos im aktuellen Ausschnitt über die Panoramio API
* Erweiterung 2: Live Wikipedia Artikel im aktuellen Ausschnitt über die geonames.org Wikipedia API
* Erweiterung 3: Interaktives Höhenprofil für die erste Etappe mit Hilfe des Leaflet.Elevation plugins
*
***/

window.onload = function() {

    // Basis layer definieren
    var layers = {
        osmlayer: L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap contributors</a>'
        }),
        geolandbasemap: L.tileLayer("http://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
            subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
            attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
        }),
        bmapoverlay: L.tileLayer("http://{s}.wien.gv.at/basemap/bmapoverlay/normal/google3857/{z}/{y}/{x}.png", {
            subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
            attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
        }),
        bmapgrau: L.tileLayer("http://{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png", {
            subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
            attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
        }),
        bmaphidpi: L.tileLayer("http://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", {
            subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
            attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
        }),
        bmaporthofoto30cm: L.tileLayer("http://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {
            subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
            attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
        })
    };

    // Karte initialisieren
    var adlerkarte = L.map('adlermap', {
        layers: [layers.osmlayer]
    });

    // Etappen über GeoJSON laden und Po-pups hinzufügen
    var etappe01 = L.geoJson(window.AdlerwegEtappe01, {
        style: {
            color: "yellow",
            weight: 10
        }
    });
    etappe01.bindPopup("<a href='http://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-1-st-johann-gaudeamushuette'><img src='http://www.tirol.at/images/d/5/w/s/q/t/w/a/w/v/w/-/374x210xacde9ec1bf3d4d4690c5be6578e1b8c2.jpg.pagespeed.ic.2-Prvy1tHR.jpg' style='width:300px;' />Etappe 01: St. Johann - Gaudeamushütte</a>");

    var etappe02 = L.geoJson(window.AdlerwegEtappe02, {
        style: {
            color: "red",
            weight: 10
        }
    });
    etappe02.bindPopup("<a href='http://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-2-gaudeamushuette-hintersteiner-see'><img src='http://www.tirol.at/images/5/w/z/b/e/o/m/w/f/z/k/-/374x210xeagle-walk-stage-2.jpg.pagespeed.ic.GmASm3FIDE.jpg' style='width:300px;' />Etappe 02: Gaudeamushütte - Hintersteiner See</a>");

    var etappe03 = L.geoJson(window.AdlerwegEtappe03, {
        style: {
            color: "orange",
            weight: 10
        }
    });
    etappe03.bindPopup("<a href='http://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-3-hintersteiner-see-kufstein'><img src='http://www.tirol.at/images/h/x/s/i/v/n/v/g/h/q/e/-/374x210x0279094cb4d385c87ba3675b4c7290f5.jpg.pagespeed.ic.rUa4cw3EvM.jpg' style='width:300px;' />Etappe 03: Hintersteiner See - Kufstein</a>");

    // Etappen als Gruppe anhängen
    var etappenGruppe = L.featureGroup([etappe01, etappe02, etappe03]);
    adlerkarte.addLayer(etappenGruppe);

    // Ausschnitt anpassen
    var etappenBounds = etappenGruppe.getBounds()
    adlerkarte.fitBounds(etappenBounds);

    // Layer Menü mit Basislayern und Adlwerweg Overlay zum Ein-, Ausschalten hinzufügen
    var layerControl = L.control.layers(
        {
            "Open Street Map": layers.osmlayer,
            "Geoland Basemap": layers.geolandbasemap,
            "Geoland Basemap Overlay": layers.bmapoverlay,
            "Geoland Basemap Grau": layers.bmapgrau,
            "Geoland Basemap High DPI": layers.bmaphidpi,
            "Geoland Basemap Orthofoto": layers.bmaporthofoto30cm
        },
        {
        "Adlerweg Etappen": etappenGruppe
        }
    ).addTo(adlerkarte);

    // Maßstabsleiste hinzufügen
    L.control.scale({
        'imperial': false
    }).addTo(adlerkarte);


    // Erweiterung 1: Panoramio Photos im aktuellen Ausschnitt als overlay hinzufügen
    var panoramioOverlay = L.featureGroup();
    layerControl.addOverlay(panoramioOverlay, "Panoramio Bilder");

    // URL für den Aufruf der Panoramio-API erzeugen
    var url = 'http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=20' +
        '&minx=' + etappenBounds.getWest() +
        '&miny=' + etappenBounds.getSouth() +
        '&maxx=' + etappenBounds.getEast() +
        '&maxy=' + etappenBounds.getNorth() +
        '&size=mini_square&mapfilter=true&callback=zeigeBilder';

    // API-Aufruf als Skript einhängen
    var script = document.createElement("script");
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);

    // Callback-Funktion zur Visualisierung der Bilder als Marker mit Pop-up
    window.zeigeBilder = function(data) {
        for (var i = 0; i < data.photos.length; i++) {
            L.marker(
                    [data.photos[i].latitude, data.photos[i].longitude], {
                        icon: L.icon({
                            iconUrl: data.photos[i].photo_file_url
                        })
                    }).bindPopup("<h2>" + data.photos[i].photo_title + "</h2>" +
                    "<a href='" + data.photos[i].photo_url + "'>Link zum Bild</a>")
                .addTo(panoramioOverlay);
        }
        panoramioOverlay.addTo(adlerkarte);
    }


    // Erweiterung 2: Wikipedia Artikel im aktuellen Ausschnitt als overlay hinzufügen
    var wikiOverlay = L.featureGroup();
    layerControl.addOverlay(wikiOverlay, "Wikipedia Artikel");

    // URL für den Aufruf der geonames.org Wikipedia-API erzeugen
    var url = 'http://api.geonames.org/wikipediaBoundingBoxJSON?' +
        'username=oeggl' +
        '&west=' + etappenBounds.getWest() +
        '&south=' + etappenBounds.getSouth() +
        '&east=' + etappenBounds.getEast() +
        '&north=' + etappenBounds.getNorth() +
        '&callback=zeigeWikiArtikel';

    // API-Aufruf als Skript einhängen
    var script = document.createElement("script");
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);

    // Callback-Funktion zur Visualisierung der Wikipedia Artikel als Marker mit Pop-up
    window.zeigeWikiArtikel = function(data2) {
        for (var i = 0; i < data2.geonames.length; i++) {
            var p = data2.geonames[i];
            L.marker([p.lat, p.lng], {
                    icon: L.icon({
                        iconUrl: "icons/wikipedia.png",
                        iconSize: [30, 30],
                    })

                })
                .bindPopup("<h2>" + p.title + "</h2>" +
                    "<a href='http://" + p.wikipediaUrl + "'>Link zum Wikipedia Artikel</a>")
                .addTo(wikiOverlay);
        }
    }
    wikiOverlay.addTo(adlerkarte);


    // Erweiterung 3: interaktives Höhenprofil für die erste Etappe mit Leaflet.Elevation
    var elevationProfile = L.control.elevation({
        collapsed: true
    });

    L.geoJson(window.AdlerwegEtappe01,{
        onEachFeature: elevationProfile.addData.bind(elevationProfile)
    }).addTo(adlerkarte);

    elevationProfile.addTo(adlerkarte);

}