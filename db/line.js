var models = require('../models');
var dbStation = require('../db/station');

function deleteLine(id)
{
    return Promise.resolve(
        models.Line.destroy
        ({
            where:{
                id:id
            }
        })
    )
}

function insertLine(number, zone, departure, arrival)
{
    return Promise.resolve().then(function () {

        var promises = [];

        promises.push(dbStation.getStationIdByName(departure));
        promises.push(dbStation.getStationIdByName(arrival));

        return Promise.all(promises).then(function (results) {

            // Test if the arrival don't exist yet in db
            if(results[1] === null)
                return dbStation.getStationIdByNameFromAPI(arrival).then(function (id) {
                    return createLine(number, zone, results[0].id, id);
                })
            else
                return createLine(number, zone, results[0].id, results[1].id);
        })
    })
}

function createLine(id, idZone, idStartStation, idEndStation)
{
    return Promise.resolve(
        models.Line.findOrCreate
        ({
            where:{
                id:id
            },
            defaults:{
                idZone: idZone,
                idStartStation: idStartStation,
                idEndStation: idEndStation
            }

        }).then(function (line) {
            //IF LINE ALREAY CREATED REJECT
            if(!line[1])
                return Promise.reject(line[1]);
        })
    )
}

function insertLineInDatabase(stationsArray, idZone)
{
    return Promise.resolve().then(function () {

        var stops = stationsArray;
        var stationsAndLinesArray = [];
        var promises = [];

        for (let i = 0; i < stops.length; i++)
        {
            var stop = stops[i];
            if(stop.line != null)
            {
                stationsAndLinesArray.push({'idLine':stop.line,'idStop':stop.stopid});

                for(let j = i+1; j < stops.length-1; j++)
                {
                    if(stops[j].line == null)
                        stationsAndLinesArray.push({'idLine':stop.line,'idStop':stops[j].stopid});
                }
                console.log(stop.line + " "+ idZone + " "+ stop.name+" "+ stop.terminal+" fdp");
                promises.push(insertLine(stop.line, idZone, stop.name, stop.terminal));

            }
        }

        return Promise.all(promises).then(function () {
            return stationsAndLinesArray;
        });
    })
}

function getAllLines()
{
    return Promise.resolve(
        models.Line.findAll()
    )
}

module.exports.insertLine = insertLine;
module.exports.createLine = createLine;
module.exports.insertLineInDatabase = insertLineInDatabase;
module.exports.getAllLines = getAllLines;
module.exports.deleteLine = deleteLine;


