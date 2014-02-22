stl format serializer for USCO project, based on THREE.js


General information
-------------------
This repository contains both the:
- node.js version:
stl-serializer.js at the root of the project
- polymer.js/browser version which is a combo of
lib/stl-serializer.js (browserified version of the above)
stl-serializer.html


How to generate browser/polymer.js version (with require support):
------------------------------------------------------------------
Type: 

    browserify stl-serializer.js -r ./stl-serializer.js:stl-serializer -o lib/stl-serializer.js -x composite-detect -x three

then replace (manually for now) all following entries in the generated file:

  "composite-detect":"awZPbp","three":"Wor+Zu"

with the correct module names, ie:

   "composite-detect":"composite-detect","three":"three"
