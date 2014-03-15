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

      grunt build-browser-lib

This will generate the correct browser(ified) version of the source in the lib folder

