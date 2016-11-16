<img width="100%" src="./assets/jumpspider2.jpg" align="right" style="float:right" />
# jumpspider
A Data crawling exercise with NodeJS, MySql, Mocha and Chai

<img src="https://img.shields.io/badge/VERSION-1.0.0-lightgray.svg">
<img src="https://img.shields.io/badge/PLATFORM-Node.js-lightgray.svg">
<img src="https://img.shields.io/badge/LICENCE-MIT-lightgray.svg">
<img src="https://img.shields.io/badge/BUILD-passing-green.svg">
<img src="https://img.shields.io/badge/TEST-passing-green.svg">


<b>Jumpspider</b> is an exercise for crawling and parsing HTML content while testing technology and software development practices. It is implemented with Node.js and MySQL. It also uses Mocha and Chai test libraries to implement BDD at a basic degree that should be extensible during a CI process. 

As an initial exercise, the parsing is specificly taylored to get HTML tables with NBA division results that comply with a very specific structure. This could be extended and generalized in the future to other purposes. 

Jumpspider is developed with the following goals in mind:

- Extensibility: There is support for evolvi....
- Scalability: 
 - 	The Node.js server was developed for asyncronous processing.
 - Steps try to cover atomic functions and run asyncronoulsy
 - Results are stored in the database (Jobs, HTML , Parsing results) thinking in a future implementation with diferent microservices performing tasks at a bigger scale.
- CI: A basic Integration testing baslined is delivered with Mocha and Chai to support code growth.


## Architecture

The architecture stack relies heavily on <b>JavaScript</b>. and lightweight frameworks aimed to develop scalable web solutions. I think performance of the backend is pretty solid. I am still wondering if I should follow a native approach for the frontends:

<table>
  <tr>
   <th>Environment</th>
   <th>Component</th>
   <th>Role</th>
  </tr>
  <tr>
   <td><b>Node.js</b></td>
   <td>URL fetch</td>
  </tr>
  <tr>
   <td></td>
   <td>Parsing</b></td>
  </tr>
  <tr>
  <tr>
   <td></td>
   <td>Web API</b></td>
  </tr>
  <tr>
    <td><b>MySQL</b> storage</td>
    <td>document repository</td> 
  </tr>
  <tr>
    <td></td>
    <td>table results</td> 
  </tr>
  <tr>
    <td></td>
    <td>parsing results</td> 
  </tr>
</table>

## Prerequisites

Before starting you will need:

- An instance of <b>Node.js</b> installed 
- An instance of MySql server
 - A dev and a test databases 
 - A user with admin privileges for both databases
- Internet access to perform some mindful HTML crawling

It is also recommended to use tools like Postman to experiment with Web API methods and MySQLWorkbench to review the databases.

Also tools like GitHub Desktop and the IDE Webstorm can make your development experience more pleasant.

## Installation

First get a copy of the project from the GitHub repository <a href="https://github.com/carloswestman/jumpspider"> https://github.com/carloswestman/jumpspider</a>

From where you downloaded the project, go to the src folder '''jumpspider/src''' and run the command:

```npm install ```

This will install the Module dependencies described in the file ```package.json``` into the folder ```jumpspider/src/node_modules```.

The project has two environments, Development and Test. Each environment uses a separate database. Create two databases for instance, 'jumpspider' and 'jumpspider_test' and a user with admin access to them.

Then make sure that the configuration files for each environment match your settings:

Default
'''
a
'''

Development
'''
a
'''

Test
'''
a
'''




## Run

The server can be run with the command:

```
node server.js
```

## Testing

The server can be run with the command:

``` 
npm test 
```

This should return the following output:

```
jumpSpider@0.0.0 test /Users/carloswestman/Documents/dev/jumpspider/jumpspider/src
> mocha --timeout 10000



  jumpSpider
    /DELETE api/dropalltables
      ✓ it deletes tables with pattern "table%" (92ms)
    /POST api/repository?url=
      ✓ it adds a first job to the repository (760ms)
      ✓ it adds a second job to the repository (285ms)
      ✓ it adds a third job to the repository (294ms)
    /GET api/repository
      ✓ it lists the repository
    /GET api/document/:jobId
      ✓ it retrieves first job document (225ms)
      ✓ it retrieves second job document
      ✓ it retrieves third job document
    /GET api/table/:jobId
      ✓ it retrieves the first job's parsed table
      ✓ it retrieves the second job's parsed table
      ✓ it retrieves the third job's parsed table


  11 passing (2s)
```


## API

A Web API implements some minimal methods to test the application. You can create new jobs, and return HTML, and parsing results from the repository:

<table>
<tr>
<th>
Resource
</th>
<th>
Item
</th>
<th>
Description
</th>
</tr>

<tr>
<td>
/api/repository<br>
`GET`
</td>
<td>
Description
</td>
<td>
Gets a JSON array of jobs from the repository<br>
Call example:<br>
<pre style="url">
http://localhost:8080/api/repository
</pre>
</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters<br>
`URL`
</td>
<td>
None
</td>
</tr>

<tr>
<td>
</td>
<td>
Response
</td>
<td>
A successful response will generate a 200 http status. If an error ocurs, an http error status code will be generated.<br>
Successful response Example:<br>
<pre style="json">
[
  {
    "exectimestamp": "2016-11-15T01:49:23.000Z",
    "jobid": "a3b9fc6ef74d4280a89f14f905de3d54",
    "url": "http://www.nba.com/standings/2014/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav"
  },
  {
    "exectimestamp": "2016-11-15T01:49:23.000Z",
    "jobid": "3432dde2c892480ebb90731b8592bbd4",
    "url": "http://www.nba.com/standings/2013/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav"
  }
]
</pre>
</td>
</tr>

<tr>
<td>
/api/repository<br>
`POST`
</td>
<td>
Description
</td>
<td>
Posts a new crawl job<br>
At the moment the methods waits for the job to finnish to return the outputs of each step of the crawler. This could be modified to enqueue jobs and have a separate method for listing the results<br>
Call example:<br>
<pre style="url">
http://localhost:8080/api/repository?url=http://www.nba.com/standings/2012/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav
</pre>
</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters<br>
`URL`
</td>
<td>

* <b>url:</b> URL address to crawl

</td>
</tr>

<tr>
<td>
</td>
<td>
Response
</td>
<td>
A successful response will generate a 200 http status. If an error ocurs, an http error status code will be generated.<br>
Successful response Example:<br>
<pre style="json">
````
{ 
"url": "http://www.nba.com/standings/2012/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav",
"jobId": "b41075920de64561a68201c1280a184e",
"document": "<!DOCTYPE html>\n<html lang=\"en\">\n\n   <head>\n   <title>NBA.com - 2012-2013 Division Standings</titl...",
"arrJsonElements": [
    {
      "NAME": "New York",
      "W": "54",
      "L": "28",
      "PCT": "0.659",
      "GB": "0.0",
      "CONF": "37-15",
      "DIV": "10-6",
      "HOME": "31-10",
      "ROAD": "23-18",
      "L 10": "8-2",
      "STREAK": "W 1"
    },... 
    ],
"tableName":"tableb41075920de64561a68201c1280a184e" }
```
</pre>
</td>
</tr>

<tr>
<td>
/api/document/:jobid<br>
`GET`
</td>
<td>
Description
</td>
<td>
Gets an HTML document stored at the repository<br>
Call example:<br>
<pre style="url">
http://localhost:8080/api/document/b41075920de64561a68201c1280a184e
</pre>
</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters<br>
`in line`
</td>
<td>

* <b>jobId:</b> The job Id for the document to retrieve

</td>
</tr>

<tr>
<td>
</td>
<td>
Response
</td>
<td>
A successful response will generate a 200 http status. If an error ocurs, an http error status code will be generated.<br>
Successful response Example:<br>
<pre style="json">
```
[{"document": "
<!DOCTYPE html>\n
<html lang=\"en\">\n\n   
    <head>\n   
        <title>NBA.com - 2012-2013 Division Standings</title>\n
        <!-- Testing that ESI is working as expected. -->\n
        <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n
...}
]
```
</pre>
</td>
</tr>

<tr>
<td>
/api/table/:jobid<br>
`GET`
</td>
<td>
Description
</td>
<td>
Gets an Json object with table parsing results<br>
Note that an individual table actually exists in the SQL server, available for analysis purposes<br>
Call example:<br>
<pre style="url">
http://localhost:8080/api/table/b41075920de64561a68201c1280a184e
</pre>
</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters<br>
`in line`
</td>
<td>

* <b>jobId:</b> The job Id for the table to retrieve

</td>
</tr>

<tr>
<td>
</td>
<td>
Response
</td>
<td>
A successful response will generate a 200 http status. If an error ocurs, an http error status code will be generated.<br>
Successful response Example:<br>
<pre style="json">
```
[
  {
    "id": 1330,
    "jobid": "b41075920de64561a68201c1280a184e",
    "row": "0",
    "C0_NAME": "New York",
    "C1_W": "54",
    "C2_L": "28",
    "C3_PCT": "0.659",
    "C4_GB": "0.0",
    "C5_CONF": "37-15",
    "C6_DIV": "10-6",
    "C7_HOME": "31-10",
    "C8_ROAD": "23-18",
    "C9_L10": "8-2",
    "C10_STREAK": "W 1"
  },
  {
	...
  },
  ...
]
```
</pre>
</td>
</tr>

<tr>
<td>
/api/dropalltables<br>
`DELETE`
</td>
<td>
Description
</td>
<td>
Deletes all the tables with a name pattern like 'table%'<br>
It is a maintenance method used when testing. It doensn't deletes the repository where the HTML documents and the job info is stored<br>
Call example:<br>
<pre style="url">
http://localhost:8080/api/dropalltables
</pre>
</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters<br>
`URL`
</td>
<td>
None
</td>
</tr>

<tr>
<td>
</td>
<td>
Response
</td>
<td>
A successful response will generate a 200 http status. If an error ocurs, an http error status code will be generated.<br>
Successful response Example:<br>
<pre style="json">
{
  "droppedtables": 10
}
</pre>
</td>
</tr>

<table>

## Conslusions and future work

To test an automated API documentation tool. The effort could make sense for mantaining a bigger code base.

To test the crawler under load with Siege.

## Furhter links and reading

Here there is some interesting reading that I found during this exercise:

 - "The Anatomy of a Large-Scale Hypertextual Web Search Engine": <a href="http://infolab.stanford.edu/~backrub/google.html"> http://infolab.stanford.edu/~backrub/google.html</a>
 - "The beginners guide to SEO: <a href="https://moz.com/beginners-guide-to-seo">https://moz.com/beginners-guide-to-seo</a>
- "Common Crawl, An open repository of web crawled data": <a href="http://commoncrawl.org/"> http://commoncrawl.org/</a>
 
## Contribute

If you are interested in contributing to jumpspider, please send an email to <carloswestman@gmail.com>

## License

Carlos Westman – <carloswestman@gmail.com>

Distributed under the MIT license. See ``LICENSE`` for more information.

[https://github.com/carloswestman/boulderer](https://github.com/carloswestman/jumpspider)

## Apendix A: Furhter testing


