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
var config = require('config');                 //Configuration control for production node deployments
var winston = require('winston')                //message logging library

var tools = require('./tools.js');               //Some tools

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
var selectRepositoryDocument1Query = 'SELECT `document` from repository where `jobid` =';
var dropAllTablesQuery = "SELECT (concat(table_schema , '.' , table_name)) as val FROM information_schema.tables WHERE table_schema = '" + config.mySqlConnectionString.database + "' AND (table_name LIKE 'table%')";


//Init Application
var app       =    express();


//Create connection pool
var pool      =    mysql.createPool(config.mySqlConnectionString);
//Verbosity of the logger
winston.level = config.logLevel;


//These functions perform key tasks in the flow
function handleDatabaseCheckTables() {
    //Check if `repository` and `Data tables exit. if not, they are created.

    winston.log('info', "handleDatabaseCheckTables Started");

    var deferredRepository = q.defer();
    var deferredData = q.defer();
    var promise = q.all([deferredRepository.promise, deferredData.promise]);

    pool.getConnection(function(err,connection){
        if (err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            deferredRepository.reject(err);
            deferredData.reject(err);
            return;
        }
        winston.log('info', 'connected as id ' + connection.threadId);

        //Check that table repository exists and create it.
        connection.query(checkTableExistsQuery,[['repository']], function(err,rows,fields){
            if(!err) {
                if(rows == 0)
                {
                    connection.query((createTableRepositoryQuery),function(err,rows,fields) {
                        if (!err) {
                            winston.log('info', "Table repository created");
                            deferredRepository.resolve();
                        }
                        else {
                            winston.log('info', err.message);
                            deferredRepository.reject(err);
                        }
                    });
                }
                else
                {
                    winston.log('info', 'Table repository exists');
                    deferredRepository.resolve();
                }
            }
            else
            {
                winston.log('info', err.message);
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
                            winston.log('info', "Table data created");
                            deferredData.resolve();
                        }
                        else {
                            winston.log('info', err.message);
                            deferredData.reject(err);
                        }
                    });
                }
                else
                {
                    winston.log('info', 'Table data exists');
                    deferredData.resolve();
                }
            }
            else
            {
                winston.log('info', err.message);
                deferredData.reject(err);
            }
        });

        connection.on('error', function(err) {
            //res.json({"code" : 100, "status" : "Error in connection database"});
            //return;
            winston.log('info', "handleDatabaseCheckTables promise rejected");
            promise.reject({"code" : 100, "status" : "Error in connection database"});
        });
    });
    winston.log('info', "handleDatabaseCheckTables Ended");
    return promise;
}
function fetchUrl(req) {

    winston.log('info', "fetchUrl Started");
    var deferred = q.defer();
    request(req.url, function (error, response, body) {
        if (error) {
            winston.log('info', "Error: " + error);
            deferred.refect(error);
        }
        // Check status code (200 is HTTP OK)
        winston.log('info', "Status code: " + response.statusCode);
        if (response.statusCode === 200) {
            var response = req;
            response.document = body;
            deferred.resolve(response);
        }
    });
    winston.log('info', "fetchUrl Ended");
    return deferred.promise;
}
function handleDatabaseStoreDocument(req){

//jobId, url, document
    var jobId = req.jobId;
    var url = req.url;
    var document = req.document;
    winston.log('info', "handleDatabaseStoreDocument Started");
    var deferred = q.defer();

    document.replace("'","\'");
    document.replace('"',"\"");
    var value = [jobId, url, document];
    pool.getConnection(function(err,connection){
        if (err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            return deferred.reject(err);
        }
        winston.log('info', 'connected as id ' + connection.threadId);

        connection.query(insertTableRepositoryQuery, [[value]], function(err,rows,fields){
            connection.release();
            if(!err) {
                //res.json(rows);
                winston.log('info', 'Table repository populated');
                var response = req;
                response.document = document;
                deferred.resolve(response);
            }
            else
            {
                winston.log('info', err.message);
                deferred.reject(err);
            }
        });

        connection.on('error', function(err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);

        });
    });
    winston.log('info', "handleDatabaseStoreDocument Ended");
    return deferred.promise;
}
function parseTable(req) {

    winston.log('info', "parseTables Started");
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
    winston.log('info', "Testing Page Structure Started");
    var noTestsFailed = 0;
    var noTestsPassed = 0;
    if(pageStatistics.pageTitle == undefined)
    {
        winston.log('info', "Warning: pageTitle is undefined");
    }
    if(pageStatistics.NumberTableOfContents != 1)
    {
        noTestsFailed++;
        winston.log('info', "Warning: NumberTableOfContents is not 1");
    }
    else
        noTestsPassed ++;
    if(pageStatistics.numberConferenceHeaddings !=2)
    {
        noTestsFailed++;
        winston.log('info', "Warning: numberConferenceHeaddings is not 2");
    }
    else
        noTestsPassed ++;
    if(pageStatistics.numberDivisionHeadingNames != 6) {
        noTestsFailed++;
        winston.log('info', "Warning: numberDivisionHeadingNames is not 6");
    }
    else
        noTestsPassed ++;
    if(pageStatistics.numberTeamNames != 30)
    {
        noTestsFailed++;
        winston.log('info', "Warning: numberTeamNames is not 30");
    }
    else
        noTestsPassed ++;

    winston.log('info', noTestsPassed + ' tests passed');
    winston.log('info', noTestsFailed + ' tests failed');
    winston.log('info', "Testing Page Structure Finished");

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

    winston.log('info', "parseTables Ended");

    var response = req;
    response.arrJsonElements = arrJsonElements;
    if(noTestsFailed > 0)
        deferred.reject({"error":"Document structure unknown. NBA Conference data not found"});
    else
        deferred.resolve(response);

    return deferred.promise;
}
function handleDatabaseCreateDictionary(arrArrData) {

    winston.log('info', "handleDatabaseCreateDictionary Started");
    var deferred = q.defer();
    pool.getConnection(function(err,connection){
        if (err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);
            return;
        }

        winston.log('info', 'connected as id ' + connection.threadId);

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
            //winston.log('info', err.message);
            connection.release();
            if(!err) {
                winston.log('info', "Table data created");
                deferred.resolve();
                return;
            }
            else {
                winston.log('info', err);
                deferred.reject(err);
                return;
            }
        });

        connection.on('error', function(err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            deferred.reject(error);

        });
    });
    winston.log('info', "handleDatabaseCreateDictionary Ended");
    return deferred.promise;
} //Not used
function handleDatabaseCreateViewTable(req){

    winston.log('info', "handleDatabaseCreateViewTable Started");
    var deferred = q.defer();

    var uniqueId = req.jobId;
    var arrArrData = req.arrJsonElements;
    //arrColumnNames = req.;

    pool.getConnection(function(err,connection){
        if (err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);
            return;
        }
        winston.log('info', 'connected as id ' + connection.threadId);

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
            //winston.log('info', err.message);
            connection.release();
            if(!err) {
                //res.json(rows);
                winston.log('info', 'Table ' + tableName + ' created');
                winston.log('info', "handleDatabaseCreateViewTable promise resolved");
                var response = req;
                response.tableName = tableName;
                deferred.resolve(response);
            }
            else
            {
                winston.log('info', err.message);
                winston.log('info', "handleDatabaseCreateViewTable promise rejected");
                deferred.reject(err);
                return;
            }
        });

        connection.on('error', function(err) {
            //res.json({"code" : 100, "status" : "Error in connection database"});
            //return;
            winston.log('info', "handleDatabaseCreateViewTable promise rejected");
            deferred.reject({"code" : 100, "status" : "Error in connection database"});
        });
    });
    winston.log('info', "handleDatabaseCreateViewTable Ended");
    return deferred.promise;
}
function handleDatabasePopulateViewTable(req){


    winston.log('info', "handleDatabasePopulateViewTable Started");
    var deferred = q.defer();

    var uniqueId = req.jobId;
    var arrJsonData = req.arrJsonElements;
//, arrColumnNames

    pool.getConnection(function(err,connection){
        if (err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            deferred.reject(err);
            return;
        }
        winston.log('info', 'connected as id ' + connection.threadId);

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
            //winston.log('info', err.message);
            connection.release();
            if(!err) {
                winston.log('info', 'Table ' + tableName + ' populated');
                var response = req;
                deferred.resolve(response);
            }
            else
            {
                winston.log('info', err.message);
                deferred.reject(err);
            }
        });

        connection.on('error', function(err) {
            winston.log('info', {"code" : 100, "status" : "Error in connection database"});
            deferred.reject(error);

        });
    });
    winston.log('info', "handleDatabasePopulateViewTable Ended");
    return deferred.promise;
}
function processJob(url) {

    var deferred = q.defer();

    var jobId = tools.createUUID();
    var pageStatistics = {};

    winston.log('info', "job: " + jobId + " Visiting page " + url);

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
                winston.log('info', "Job processing error");
                winston.log('info', error);
                deferred.reject(error);
             })
        .done();

    winston.log('info', "processJob Ended");
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
        winston.log('info', "Jobs processed: " + urlCount);
    });

app.route('/api/table/:jobId')
    .get(function(req,res){
        winston.log('info', 'GET /api/table');

        //get URL params
        var jobId = req.params.jobId; //("name");
        var table = 'table' + jobId;
        table = table.replace(';','');

        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            winston.log('info', 'connected as id ' + connection.threadId);

            var selectTableQuery = selectTable1Query + table + selectTable3Query;
            connection.query(selectTableQuery, function(err,rows,fields){
                connection.release();
                if(!err) {
                    //res.json(rows);
                    res.contentType('application/json');
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
        winston.log('info', 'GET /api/repository');


        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            winston.log('info', 'connected as id ' + connection.threadId);

            connection.query(selectRepositoryQuery, function(err,rows,fields){
                connection.release();
                if(!err) {
                    //res.json(rows);
                    res.contentType('application/JSON')
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
        winston.log('info', 'POST /api/repository');


        //get URL params
        var url = req.query.url;
        url = url.replace(';','');

        processJob(url)
            .then( function (req) {
                res.status(200).send(req);
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
        winston.log('info', 'GET /api/document/:jobId');

        //get URL params
        var jobId = req.params.jobId;
        jobId = jobId.replace(';','');

        var selectRepositoryDocumentQuery = selectRepositoryDocument1Query+ "'" + jobId + "'";

        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            winston.log('info', 'connected as id ' + connection.threadId);

            connection.query(selectRepositoryDocumentQuery, function(err,rows,fields){
                connection.release();
                if(!err) {
                    res.contentType('text/html')
                    res.status(200).send(rows);
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

app.route('/api/dropalltables')
    .delete(function(req,res){
        winston.log('info', 'DELETE /api/dropalltables');

        pool.getConnection(function(err,connection){
            if (err) {
                res.status(100).send(err);
                res.end();
            }
            winston.log('info', 'connected as id ' + connection.threadId);

            connection.query(dropAllTablesQuery, function(err,rows,fields){
                if(!err) {
                    if(rows.length == 0){
                        res.status(200).send({"droppedtables": rows.length});
                        res.end();
                        connection.release();
                        return;
                    }
                    var dropQuery = '';
                    for(var i=0; i < rows.length ; i++){
                        dropQuery = 'DROP TABLE ' + rows[i].val + ';' + dropQuery;
                    }
                    connection.query( dropQuery, function (err, rows, fields){
                        connection.release();
                        if(!err) {
                            res.status(200).send({"droppedtables": rows.length});
                            res.end();
                        }
                        else
                        {
                            res.status(200).send({"droppedtables": 0});
                            res.end();
                        }
                    } )
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

app.listen(config.port);

winston.log('info', 'Listening on port ' + config.port);

module.exports = app; // for testing

