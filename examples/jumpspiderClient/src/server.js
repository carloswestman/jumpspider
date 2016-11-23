// Title: JumpspiderClient
// Description: A client that consumes data from Jumpspider
// Author: Carlos Westman
// Creation date: Nov 2016
// License: MIT
'use strict';

var request = require('request');               //get files
var URL = require('url-parse');                 //parse URL strings
var config = require('config');                 //Configuration control for production node deployments
var winston = require('winston');               //message logging library

winston.level = config.logLevel;

//main program routine

var crawlCount = 0;
var arrResults = [];
var pagesToCrawl = [];
pagesToCrawl.push("http://www.nba.com/standings/2014/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav");
pagesToCrawl.push("http://www.nba.com/standings/2013/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav");
pagesToCrawl.push("http://www.nba.com/standings/2012/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav");

// This function excecutes when all URL parsed data is retrieved
function doCalculations()
{

    //Organize data by year in data object
    var data = {};
    for(var i=0; i < arrResults.length ; i++)
    {
        var year = arrResults[i].url.substr(29,4);
        data[year]= arrResults[i].arrJsonElements;
    }

    //Find team with most wins on 2014
    var wins = 0;
    var index = 0;
    var record2014;
    var record2013;
    var record2012;
    for(var i = 0; i < data[2014].length; i++)
    {
        if (data[2014][i].W > wins)
        {
            wins = data[2014][i].W;
            index = i;
            record2014 = data[2014][i];
        }
    }
    var team = data[2014][index].NAME;

    //find records for team in 2013 and 2012
    for(var i = 0; i < data[2013].length; i++)
    {
        if(data[2013][i].NAME == team) record2013 = data[2013][i];
    }
    for(var i = 0; i < data[2012].length; i++)
    {
        if(data[2012][i].NAME == team) record2012 = data[2012][i];
    }


    console.log('Team with most wins on 2014 is ' + team + ' with ' + wins + ' wins.');
    console.log(team + 'movement 2014-2014 is ' + (wins - record2014.W ));
    console.log(team + 'movement 2014-2013 is ' + (wins - record2013.W ));
    console.log(team + 'movement 2014-2012 is ' + (wins - record2012.W ));

}

for(var i = 0; i < pagesToCrawl.length ; i++)
{
var url  = 'http://localhost:8080/api/repository?url=' + pagesToCrawl[i];
request.post(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
         var jsonBody = JSON.parse(body);
        arrResults.push(jsonBody);
        crawlCount ++;
        if(crawlCount === pagesToCrawl.length) doCalculations();
        //console.log(arrJsonElements);
    }
    else
    {
        winston.log('info', error);
    }
});
}
