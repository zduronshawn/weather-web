# Weather-web

---

## install

1. install the node.js and npm
2. clone the project from [https://github.com/zduronshawn/weather-web](https://github.com/zduronshawn/weather-web) and install the dependencies

    git clone https://github.com/zduronshawn/weather-web
    npm install

4. run the app

    npm start

# weather

---

## install

1. get grib2json commandline tool from  [https://github.com/cambecc/grib2json](https://github.com/cambecc/grib2json), beacause we need to convert the grib file we donwload form NCEP into JSON format.
    1. install JAVA
    2. install Maven [https://maven.apache.org/install.html](https://maven.apache.org/install.html)
    3. install grib2json,after installing ,you need to add it to the PATH

        git clone [https://github.com/cambecc/grib2json](https://github.com/cambecc/grib2json)
        mvn package

2. install the node.js and npm
3. clone the project from [https://github.com/zduronshawn/Weather](https://github.com/zduronshawn/Weather) and install the dependencies

    git clone [https://github.com/zduronshawn/Weather](https://github.com/zduronshawn/Weather)
    npm install

4. run the app

    npm start