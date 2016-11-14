// Title: Jumpspider
// Description: A simple exercise to explore data crawling with NodeJS and MySQL
// Author: Carlos Westman
// Creation date: Nov 2016
// License: MIT
'use strict';

var request = require('request');               //get files
var cheerio = require('cheerio');               //jquery parser
var URL = require('url-parse');                 //parse URL strings
var q = require('q');                           //promises library for async processing
var express = require("express");               //routing node server
var mysql = require('mysql');                   //mysql connector


var tools = require('./tools.js');               //Some tools
var config = require('./server.config.json');   //Load configuration and private tokens



/// SQL Queries
var checkTableExistsQuery ="show tables like ?";
var createTableRepositoryQuery = "CREATE TABLE `repository` (`id` INT NOT NULL AUTO_INCREMENT, `exectimestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, `jobid` VARCHAR(500) NOT NULL, `url` VARCHAR(500) NOT NULL, `document` text CHARACTER SET utf8, PRIMARY KEY (`id`), UNIQUE INDEX `id_UNIQUE` (`id` ASC));";
var insertTableRepositoryQuery = "INSERT INTO `repository` (`jobid`, `url`, `document`) VALUES ? ";
var createTableDataQuery = "CREATE TABLE `data` (`id` int(11) NOT NULL AUTO_INCREMENT, `jobid` varchar(500) NOT NULL, `row` varchar(100) NOT NULL, `key` varchar(100) NOT NULL, `value` varchar(100) DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `id_UNIQUE` (`id`)) ENGINE=InnoDB AUTO_INCREMENT=1330 DEFAULT CHARSET=latin1;";
var insertTableDataQuery = "INSERT INTO data (jobid, `row`, `key`, `value`) VALUES ?";
var createTableView1Query = "CREATE TABLE ";
var createTableView3Query = " (`id` int(11) NOT NULL AUTO_INCREMENT, `jobid` varchar(500) NOT NULL, `row` varchar(100) NOT NULL " ;
var createTableView5Query =  ", PRIMARY KEY (`id`), UNIQUE KEY `id_UNIQUE` (`id`)) ENGINE=InnoDB AUTO_INCREMENT=1330 DEFAULT CHARSET=latin1;";
var insertTableView1Query = "INSERT INTO ";
var insertTableView3Query = "(jobid, `row`";
var insertTableView5Query = ") VALUES ?";
var selectTable1Query = 'SELECT * from ';
var selectTable3Query = ' LIMIT 500';
var selectRepositoryQuery = 'SELECT `exectimestamp`, `jobid`, `url` from repository LIMIT 1000';
var selectRepositoryDocument1Query = 'SELECT `document` from repository where `jobid =';



//Init Application
var app       =    express();


//Create connection pool
var pool      =    mysql.createPool(config.MySqlConnectionString);


//These functions perform key tasks in the flow
function handleDatabaseCheckTables() {
    //Check if `repository` and `Data tables exit. if not, they are created.

    console.log("handleDatabaseCheckTables Started");

    var deferredRepository = q.defer();
    var deferredData = q.defer();
    var promise = q.all([deferredRepository.promise, deferredData.promise]);

    pool.getConnection(function(err,connection){
        if (err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            deferredRepository.reject(err);
            deferredData.reject(err);
            return;
        }
        console.log('connected as id ' + connection.threadId);

        //Check that table repository exists and create it.
        connection.query(checkTableExistsQuery,[['repository']], function(err,rows,fields){
            if(!err) {
                if(rows == 0)
                {
                    connection.query((createTableRepositoryQuery),function(err,rows,fields) {
                        if (!err) {
                            console.log("Table repository created");
                            deferredRepository.resolve();
                        }
                        else {
                            console.log(err.message);
                            deferredRepository.reject(err);
                        }
                    });
                }
                else
                {
                    console.log('Table repository exists');
                    deferredRepository.resolve();
                }
            }
            else
            {
                console.log(err.message);
                deferredRepository.reject(err);
            }
        });

        //Check that table data exists and create it.
        connection.query(checkTableExistsQuery,[['data']], function(err,rows,fields){
            if(!err) {
                if(rows == 0)
                {
                    connection.query((createTableDataQuery),function(err,rows,fields) {
                        if (!err) {
                            console.log("Table data created");
                            deferredData.resolve();
                        }
                        else {
                            console.log(err.message);
                            deferredData.reject(err);
                        }
                    });
                }
                else
                {
                    console.log('Table data exists');
                    deferredData.resolve();
                }
            }
            else
            {
                console.log(err.message);
                deferredData.reject(err);
            }
        });

        connection.on('error', function(err) {
            //res.json({"code" : 100, "status" : "Error in connection database"});
            //return;
            console.log("handleDatabaseCheckTables promise rejected");
            promise.reject({"code" : 100, "status" : "Error in connection database"});
        });
    });
    console.log("handleDatabaseCheckTables Ended");
    return promise;
}
function fetchUrl(req) {

    console.log("fetchUrl Started");
    var deferred = q.defer();
    request(req.url, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
            deferred.refect(error);
        }
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if (response.statusCode === 200) {
            var response = req;
            response.document = body;
            deferred.resolve(response);
        }
    });
    console.log("fetchUrl Ended");
    return deferred.promise;
}
function handleDatabaseStoreDocument(req){

//jobId, url, document
    var jobId = req.jobId;
    var url = req.url;
    var document = req.document;
    console.log("handleDatabaseStoreDocument Started");
    var deferred = q.defer();

    document.replace("'","\'");
    document.replace('"',"\"");
    var value = [jobId, url, document];
    pool.getConnection(function(err,connection){
        if (err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            return deferred.reject(err);
        }
        console.log('connected as id ' + connection.threadId);

        connection.query(insertTableRepositoryQuery, [[value]], function(err,rows,fields){
            connection.release();
            if(!err) {
                //res.json(rows);
                console.log('Table repository populated');
                var response = req;
                response.document = document;
                deferred.resolve(response);
            }
            else
            {
                console.log(err.message);
                deferred.reject(err);
            }
        });

        connection.on('error', function(err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);

        });
    });
    console.log("handleDatabaseStoreDocument Ended");
    return deferred.promise;
}
function parseTable(req) {

    console.log("parseTables Started");
    var deferred = q.defer();

    var document = req.document;
    var $ = cheerio.load(document); //cheerio is a reduced version of JQuery for parsing html5 DOM

    //Define elements of interest
    var pageTitle = $('title').text();
    var tableOfContents = $('.genStatTable.mainStandings');
    var conferenceHeadings = $('.confTitle');
    var divisionHeadingNames = $('tr.title td.name');
    var teamNames = $('tr td.team');

    // Get a few statistics to ensure page have expected structure
    var pageStatistics = {};
    pageStatistics.pageTitle = pageTitle;
    pageStatistics.NumberTableOfContents = tableOfContents.length; // should be 1
    pageStatistics.numberConferenceHeaddings = conferenceHeadings.length; // must be 2;  Western and Eastern Conferences
    pageStatistics.numberDivisionHeadingNames = divisionHeadingNames.length; // must be 6;
    pageStatistics.numberTeamNames = teamNames.length; // must be 30 teams;

    //Test page statistics
    console.log("Testing Page Structure Started");
    var noTestsFailed = 0;
    var noTestsPassed = 0;
    if(pageStatistics.pageTitle == undefined)
    {
        console.log("Warning: pageTitle is undefined");
    }
    if(pageStatistics.NumberTableOfContents != 1)
    {
        noTestsFailed++;
        console.log("Warning: NumberTableOfContents is not 1");
    }
    else
        noTestsPassed ++;
    if(pageStatistics.numberConferenceHeaddings !=2)
    {
        noTestsFailed++;
        console.log("Warning: numberConferenceHeaddings is not 2");
    }
    else
        noTestsPassed ++;
    if(pageStatistics.numberDivisionHeadingNames != 6) {
        noTestsFailed++;
        console.log("Warning: numberDivisionHeadingNames is not 6");
    }
    else
        noTestsPassed ++;
    if(pageStatistics.numberTeamNames != 30)
    {
        noTestsFailed++;
        console.log("Warning: numberTeamNames is not 30");
    }
    else
        noTestsPassed ++;

    console.log(noTestsPassed + ' tests passed');
    console.log(noTestsFailed + ' tests failed');
    console.log("Testing Page Structure Finished");

    //Get Column Names
    var columnNames = divisionHeadingNames.first().nextAll() ;
    var arrColumnNames = [];
    columnNames.each(function(i,e){ arrColumnNames.push($(e).text())});

    //Get team names and Values
    var arrArrValues = [];
    var teamRows = teamNames.parent();
    teamRows.each( function (i,row)
    {
        var arrValues = [];
        var team = $(row).find('tr td.team a').text();
        var values = $(row).find('tr td.team').nextAll();
        //values = $(values,'td');

        values.each(function (i,val) { arrValues.push($(val).text());});

        arrValues.unshift(team);
        arrArrValues.push(arrValues);


    });


    var arrJsonElements = [];
    // arrColumnNames must be same lengh as arrValues.
    for(var i=0; i < arrArrValues.length; i++)
    {
        var element = {};
        element['NAME']= arrArrValues[i][0];
        for (var j = 0; j < arrColumnNames.length; j++) {

            element[arrColumnNames[j]]= arrArrValues[i][j+1];

        }
        arrJsonElements.push(element);
    }

    console.log("parseTables Ended");

    var response = req;
    response.arrJsonElements = arrJsonElements;
    if(noTestsFailed > 0)
        deferred.reject({"error":"Document structure unknown. NBA Conference data not found"});
    else
        deferred.resolve(response);

    return deferred.promise;
}
function handleDatabaseCreateDictionary(arrArrData) {

    console.log("handleDatabaseCreateDictionary Started");
    var deferred = q.defer();
    pool.getConnection(function(err,connection){
        if (err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);
            return;
        }

        console.log('connected as id ' + connection.threadId);

        //pupulate table, NAME is the chosen Key for the info. (should i change that for a column number??? probably yes...
        var values = [];
        for(var i=0; i < arrArrData.length ; i++ )
        {
            var key = arrArrData[i].NAME;
            for(var k in arrArrData[i])
            {
                if (arrArrData[i].hasOwnProperty(k)) {
                    var value = arrArrData[i][k];
                    values.push([jobId,i, k, value]);
                }


            }
        }

        connection.query(insertTableDataQuery, [values], function(err,rows,fields){
            //console.log(err.message);
            connection.release();
            if(!err) {
                console.log("Table data created");
                deferred.resolve();
                return;
            }
            else {
                console.log(err);
                deferred.reject(err);
                return;
            }
        });

        connection.on('error', function(err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            deferred.reject(error);

        });
    });
    console.log("handleDatabaseCreateDictionary Ended");
    return deferred.promise;
} //Not used
function handleDatabaseCreateViewTable(req){

    console.log("handleDatabaseCreateViewTable Started");
    var deferred = q.defer();

    var uniqueId = req.jobId;
    var arrArrData = req.arrJsonElements;
    //arrColumnNames = req.;

    pool.getConnection(function(err,connection){
        if (err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);
            return;
        }
        console.log('connected as id ' + connection.threadId);

        var columnsString = '';
        if(arrArrData.length > 0)
        {
            var counter = 0;
            for(var k in arrArrData[0])
            {
                if (arrArrData[0].hasOwnProperty(k)) {
                    //clean key from special characters and add correlative
                    k = 'C' + counter.toString() + '_' + k.replace(/[^a-zA-Z0-9]/g, '');
                    columnsString  = columnsString + ', `' + k + '` varchar(100)';
                    counter++;
                }
            }
        }

        var tableName = "table" + uniqueId;
        var createTableViewQuery = createTableView1Query + tableName + createTableView3Query + columnsString + createTableView5Query;

        connection.query(createTableViewQuery, function(err,rows,fields){
            //console.log(err.message);
            connection.release();
            if(!err) {
                //res.json(rows);
                console.log('Table ' + tableName + ' created');
                console.log("handleDatabaseCreateViewTable promise resolved");
                var response = req;
                response.tableName = tableName;
                deferred.resolve(response);
            }
            else
            {
                console.log(err.message);
                console.log("handleDatabaseCreateViewTable promise rejected");
                deferred.reject(err);
                return;
            }
        });

        connection.on('error', function(err) {
            //res.json({"code" : 100, "status" : "Error in connection database"});
            //return;
            console.log("handleDatabaseCreateViewTable promise rejected");
            deferred.reject({"code" : 100, "status" : "Error in connection database"});
        });
    });
    console.log("handleDatabaseCreateViewTable Ended");
    return deferred.promise;
}
function handleDatabasePopulateViewTable(req){


    console.log("handleDatabasePopulateViewTable Started");
    var deferred = q.defer();

    var uniqueId = req.jobId;
    var arrJsonData = req.arrJsonElements;
//, arrColumnNames

    pool.getConnection(function(err,connection){
        if (err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);
            return;
        }
        console.log('connected as id ' + connection.threadId);

        //pupulate table, NAME is the chosen Key for the info. (should i change that for a column number??? probably yes...
        var columnsString = '';
        if(arrJsonData.length > 0)
        {
            var counter = 0;
            for(var k in arrJsonData[0])
            {
                if (arrJsonData[0].hasOwnProperty(k)) {
                    //clean key from special characters and add correlative
                    k = 'C' + counter.toString() + '_' + k.replace(/[^a-zA-Z0-9]/g, '');
                    columnsString  = columnsString + ', `' + k + '` ';
                    counter++;
                }
            }
        }

        var tableName = "table" + uniqueId;
        var insertTableViewQuery = insertTableView1Query + tableName + insertTableView3Query + columnsString + insertTableView5Query;

        var values = [];
        for(var i=0; i < arrJsonData.length ; i++ )
        {
            var value = [uniqueId,i];
            for(var k in arrJsonData[i])
            {
                if (arrJsonData[i].hasOwnProperty(k)) {
                    value.push( arrJsonData[i][k]);
                }
            }
            values.push(value);
        }

        connection.query(insertTableViewQuery, [values], function(err,rows,fields){
            //console.log(err.message);
            connection.release();
            if(!err) {
                console.log('Table ' + tableName + ' populated');
                var response = req;
                deferred.resolve(response);
            }
            else
            {
                console.log(err.message);
                deferred.reject(err);
            }
        });

        connection.on('error', function(err) {
            console.log({"code" : 100, "status" : "Error in connection database"});
            deferred.reject(error);

        });
    });
    console.log("handleDatabasePopulateViewTable Ended");
    return deferred.promise;
}
function processJob(url) {

    var deferred = q.defer();

    var jobId = tools.createUUID();
    var pageStatistics = {};

    console.log("job: " + jobId + " Visiting page " + url);

    var req = {};
    req.url = url;
    req.jobId = jobId;

    fetchUrl(req)  //fectch HTML doc
        .then(handleDatabaseStoreDocument) //Store HTML doc in database for future use
        .then(parseTable)
        .then(handleDatabaseCreateViewTable)
        .then(handleDatabasePopulateViewTable)
        .then( function(res){
            deferred.resolve(res); })
        .catch(function (error) {
               // Handle any error from all above steps
                console.log("Job processing error");
                console.log(error);
                deferred.reject(error);
             })
        .done();

    console.log("processJob Ended");
    return deferred.promise;
};



//main program routine

var pagesToCrawl = [];
pagesToCrawl.push("http://www.nba.com/standings/2014/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav");
pagesToCrawl.push("http://www.nba.com/standings/2013/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav");
pagesToCrawl.push("http://www.nba.com/standings/2012/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav");

handleDatabaseCheckTables()
    .then(function(){
        var urlCount = 0;
        for (var i=0; i < pagesToCrawl.length; i++) {
            processJob(pagesToCrawl[i]);
            urlCount++;
        }
        console.log("Jobs processed: " + urlCount);
    });

app.route('/api/table/:jobId')
    .get(function(req,res){
        console.log('GET /api/table');

        //get URL params
        var jobId = req.params.jobId; //("name");
        var table = 'table' + jobId;
        table = table.replace(';','');

        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            console.log('connected as id ' + connection.threadId);

            var selectTableQuery = selectTable1Query + table + selectTable3Query;
            connection.query(selectTableQuery, function(err,rows,fields){
                connection.release();
                if(!err) {
                    //res.json(rows);
                    res.status(200).send(JSON.stringify(rows));
                    res.end();
                }
                else
                {
                    res.status(400).send(err);
                    res.end();
                }
            });

            connection.on('error', function(err) {
                res.status(400).send(err);
                res.end();
            });
        });
});

app.route('/api/repository')
    .get(function(req,res){
        console.log('GET /api/repository');


        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            console.log('connected as id ' + connection.threadId);

            connection.query(selectRepositoryQuery, function(err,rows,fields){
                connection.release();
                if(!err) {
                    //res.json(rows);
                    res.status(200).send(JSON.stringify(rows));
                    res.end();
                }
                else
                {
                    res.status(400).send(err);
                    res.end();
                }
            });

            connection.on('error', function(err) {
                res.status(400).send(err);
                res.end();
            });
        });
    });

app.route('/api/repository')
    .get(function(req,res){
        console.log('GET /api/repository');


        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            console.log('connected as id ' + connection.threadId);

            connection.query(selectRepositoryQuery, function(err,rows,fields){
                connection.release();
                if(!err) {
                    //res.json(rows);
                    res.status(200).send(JSON.stringify(rows));
                    res.end();
                }
                else
                {
                    res.status(400).send(err);
                    res.end();
                }
            });

            connection.on('error', function(err) {
                res.status(400).send(err);
                res.end();
            });
        });
    })
    .post(function(req,res){
        console.log('POST /api/repository');


        //get URL params
        var url = req.param('url');
        url = url.replace(';','');

        processJob(url)
            .then( function (req) {
                res.status(200).send(JSON.stringify(req));
                res.end();
            })
            .catch(function (error) {
                // Handle any error from all above steps
                res.status(400).send(error);
                res.end();
            })
            .done();



    });

app.route('/api/document/:jobId')
    .get(function(req,res){
        console.log('GET /api/repository/:jobId');

        //get URL params
        var jobId = req.params.jobId;
        jobId = jobId.replace(';','');

        var selectRepositoryDocumentQuery = selectRepositoryDocument1Query+ "'" + jobId + "'";

        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            console.log('connected as id ' + connection.threadId);

            connection.query(selectRepositoryDocumentQuery, function(err,rows,fields){
                connection.release();
                if(!err) {
                    res.status(200).send(JSON.stringify(rows));
                    res.end();
                }
                else
                {
                    res.status(400).send(err);
                    res.end();
                }
            });

            connection.on('error', function(err) {
                res.status(400).send(err);
                res.end();
            });
        });
    });

app.listen(8080);


