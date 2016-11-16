<img src="./assets/logo.png" align="right" style="float:right" />
# Boulderer 
>Hybrid mobile application for sharing boulder problems within the climbing community 

<img src="https://img.shields.io/badge/LICENCE-GNU AGPL V3-0000ff.svg">
<img src="https://img.shields.io/badge/VERSION-0.1.0-lightgray.svg">
<img src="https://img.shields.io/badge/Frontend Platform-iOS/Android-lightgray.svg">

I started Boulderer with two goals in mind, one social and the other one personal:

- <b>A social vision:</b> To provide a useful tool to the climbing community. Climbers can use their phones to discover, create and share boulder problems in the climbing gym and in the outdoors. Finding and sharing boulder problems in the gym and the outdoors is a common problem between climbers. The application should enable friends to share boulder problems with the help of a social network, be easy to use, and free if you are not making a profit with it.
- <b>A challenge:</b> This is my first open source project where I can test and improve my skills designing and developing Mobile App technology. In this first round I have implemented the solution using an Ionic MEAN stack (MongoDB, Express, AngularJS, NodeJS), and Cordova to test the development of Hybrid Mobile Apps.

<div align="center">
<img src="./assets/map.jpg" width="30%" border="4">
<img src="./assets/B new boulder HM 3.jpg" width="30%" border="4">
<img src="./assets/boulder list.jpg" width="30%" border="4">
</div>




## Features

Features are focused on essential functionality to make the application useful while keeping it simple. Current support with examples:

###Discover boulders in the outdoors

The easiest way to search for boulders is in the Map tab.
Double-tap markers to open the boulder.

<div align="center">	
<img src="./assets/B general boulder map.jpg" width="25%" border="4">
<img src="./assets/B general boulder detail.jpg" width="25%" border="4">
<img src="./assets/B general boulder.jpg" width="25%" border="4">
</div>

###Discover Boulder Problems in climbing gym:
When you are in the climbing gym, there are too many boulders, and they are usually in the same place so the map won't be useful. The easiest way to browse through boulders is in the Boulder Tab. You can setup filters to only view the boulders you are interested in.

<div align="center">	
<img src="./assets/search filter options.jpg" width="25%" border="4">
<img src="./assets/boulder list.jpg" width="25%" border="4">
<img src="./assets/paper tree detail.jpg" width="25%" border="4">
</div>

### Social Networking
To identify yourself on a social network you need first to sign in with your Facebook user.
<div align="center">	
<img src="./assets/auth.jpg" width="25%" border="4">
</div>


###Create your own boulders and share them:
 You can create your own boulder problems with your phone camera and share them with the community. Just take a picture, tap on the holds, and share.

<div align="center">	
<img src="./assets/create boulder 1.jpg" width="25%" border="4">
<img src="./assets/B new boulder HM 2.jpg" width="25%" border="4">
<img src="./assets/B new boulder HM 3.jpg" width="25%" border="4">
</div>

## Roadmap

There is so much work to do, but it's exciting. Here there is a list with some of the roadmap activities:

1. Create the GitHub repository with a MVP version *[DONE]*
2. Continuous Software Development *[Check the issue list for details]*
4. Business Model to maintain the service
5. Marketing strategy
4. Improve UX *[Designers needed]*
4. Develop the product Branding *[Designers needed]*
4. Distribute in the stores.


## Architecture

The architecture stack relies heavily on <b>JavaScript</b>. and lightweight frameworks aimed to develop scalable web solutions. I think performance of the backend is pretty solid. I am still wondering if I should follow a native approach for the frontends:

<table>
  <tr>
   <td>Back-end @AWS</td>
   <td>Web API: <b>NodeJS</b></td>
  </tr>
  <tr>
   <td></td>
   <td>Document storage: <b>MongoDB</b></td>
  </tr>
   <tr>
   <td></td>
   <td>Data Model: <b>Express</b></td>
  </tr>
  <tr>
    <td>Front-End @PhoneGap</td>
    <td>Framework: <b>AngularJS</b></td> 
  </tr>
    <tr>
    <td></td>
    <td>UX components: <b>Ionic</b></td> 
  </tr>
</table>

##API

A RESTful API has been implemented. At the moment there is not support for DELETE or UPDATE actions:

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

<tr>
<td>
/api/boulders<br>
`GET`
</td>
<td>
Description
</td>
<td>
Gets a JSON array of boulders<br>
Call example:<br>
<pre style="url">
/api/boulders?fromDate=2016-10-26T01:44:29.000Zlatitude=49.699&longitude=-123.152&radius=5000
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

* <b>fromDate (optional):</b> String in ISO Date format. Retrieves boulders updated more recently than fromDate
* <b>longitude (optional):</b> Geoposition longitude coordenate. When used together with latitude and radius parameters, it retrieves boulders contained in a box of +/+ radius meters arround the specified coordinates
* <b>latitude (optional):</b> Geoposition longitude coordenate
* <b>radius (optional):</b> radius from position specified in meters
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
[  {    "_id": "5805a71ea10ff6e414d37bdf",    "updatedAt": "2016-10-18T04:37:49.830Z",    "createdAt": "2016-10-18T04:37:49.830Z",    "grade": 6,    "accuracy": 1979,    "latitude": 49.73310552199455,    "longitude": -123.1416806450711,    "pictureNaturalHeight": 4032,    "pictureNaturalWidth": 3024,    "pictureId": "5805a71ca10ff6e414d77bdc",    "svgData": `"<circle id=\"0\" cx=\"60\" cy=\"376\" r=\"17\" style=\"stroke: rgb(255, 0, 0); stroke-width: 2px; fill: rgba(0, 0, 0, 0);\">"`,    "svgViewPortHeight": 427,    "svgViewPortWidth": 320,    "ownerId": "carloswestman",    "name": "Half Moon",    "__v": 0  }]
</pre>
</td>
</tr>

<tr>
<td>
/api/boulders<br>
`POST`
</td>
<td>
Description
</td>
<td>
Posts a boulder
</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters
</td>
<td>
The body request should include the following parameters:

* <b>name:</b> Boulder name
* <b>grade:</b> Boulder grade
* <b>ownerID:</b> Id of the user
* <b>pictureID:</b> Id of the picture stored in the database
* <b>pirctureNaturalWidth:</b> Natural width of the picture
* <b>pictureNaturalHeight:</b> Natural height of the picture
* <b>svgData:</b> SVG data containing the sketch for the boulder
* <b>svgViewPortWidth:</b> svgViewPortWidth property when the boulder was created
* <b>svgViewPortHeight:</b> svgViewPortHeight property when the boluder was created
* <b>longitud:</b> GPS longitude
* <b>latitude:</b> GPS latitude
* <b>accuracy:</b> GPS accuracy
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
{ message: 'Boulder created, go for it and crush it man!' }
</pre>
</td>
</tr>

<tr>
<td>
/api/pictures/:_id<br>
`GET`
</td>
<td>
Description
</td>
<td>
Gets a picture associated with an inline parameter :_id, which can be found in a boulder document.<br>
Call example:<br>
<pre style="url">
/api/pictures/5805a71ca10ff6e414d77bdc
</pre>
</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters
</td>
<td>
The request should include the following parameters:

* <b>_id:</b> picture id, should be included in the URL
</td>
</tr>

<tr>
<td>
</td>
<td>
Response
</td>
<td>
A successful response will generate a 200 http status. If an error occurs, an http error status code will be generated.<br>
Succesful result will retrieve a data file image</td>
</tr>

<tr>
<td>
/api/pictures<br>
`POST`
</td>
<td>
Description
</td>
<td>
Posts a picture and retrieves an :_id for the storaged image</td>
</tr>

<tr>
<td>
</td>
<td>
Parameters
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
A successful response will generate a 200 http status. If an error occurs, an http error status code will be generated.<br>
The important property is "id", it is the key asigned in the database to the uploaded picture.
Successful response example:<br>
<pre style="json">
`{
"message":"File uploaded successfully",
"id":"58069137a10ff6e414d77be4",
"filenamedest":
	{
	"_id":"58069137a10ff6e414d77be4","filename":"myimage","contentType":"image/jpeg","length":356480,"chunkSize":261120,"uploadDate":"2016-10-18T21:16:40.104Z","md5":"5d99caf94651b697295cace54edcc442"
	},
}`
</pre>
</td>
</tr>
<table>


## Contribute

If you are interested in contributing to Boulderer, please send an email to <carloswestman@gmail.com>

## License

Carlos Westman – <carloswestman@gmail.com>

Distributed under the GNU APGL V3 license. See ``LICENSE`` for more information.

[https://github.com/carloswestman/boulderer](https://github.com/carloswestman/boulderer)

