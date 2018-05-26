#!/bin/bash
#
# convert .gpx to GeoJSON .js
#
# see http://gis.stackexchange.com/questions/68757/ogr2ogr-workaround-for-gpx-json-conversion-bug
#

# unzip .gpx files
unzip TW_Adlerweg_-_gpx-Daten1.zip -x Verwendungshinweis.pdf

# convert .gpx to .geojson
for file in AdlerwegEtappe[012]*.gpx ; do 
    for layer in routes tracks ; do 
        echo -n "$file $layer " &&
        ogr2ogr -q -f csv /dev/stdout $file -sql "select count(*) from $layer" |
        awk 'NR>1'
    done
done | awk '$3' |
while read f l j ; do ogr2ogr --config GPX_ELE_AS_25D YES -f GeoJSON "${f%.gpx}.geojson" "$f" $l ; done

# add variable declaration and store as .geojson.js
echo "creating geojson.js files ..."
for file in AdlerwegEtappe*.geojson ; do
    etappe=$(echo $file | cut -f 1 -d '.')
    echo "window.$etappe = $(cat $file)" > $file.js

done

# remove temporary files
rm -f *.gpx
rm -f *.geojson
rm -f AdlerwegEtappeO*

