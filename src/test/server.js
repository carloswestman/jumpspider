'use strict';
//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var request = require('request');
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('jumpSpider', function () {

    var url = "http://localhost:8080";
    var firstJobId;
    var secondJobId;
    var thirdJobId;

    describe('/DELETE api/dropalltables', function () {

        it('it deletes tables with pattern "table%"', function(done) {
            chai.request(url)
                .delete('/api/dropalltables')
                .end(function(err, res){
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('droppedtables');
                    done();
                });
        });
    });

    describe('/POST api/repository?url=', function () {

        it('it adds a first job to the repository', function(done) {
            chai.request(url)
                .post('/api/repository?url=http://www.nba.com/standings/2014/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('url');
                    res.body.should.have.property('jobId');
                    res.body.should.have.property('document');
                    res.body.should.have.property('arrJsonElements');
                    res.body.should.have.property('tableName');
                    res.body.url.should.equal('http://www.nba.com/standings/2014/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav');
                    res.body.tableName.should.equal( 'table' + res.body.jobId);
                    res.body.arrJsonElements.should.be.a('array');
                    res.body.arrJsonElements[0].NAME.should.equal('Toronto');
                    res.body.arrJsonElements[0].W.should.equal('49');
                    res.body.arrJsonElements[0].L.should.equal('33');
                    res.body.arrJsonElements[0].PCT.should.equal('0.598');
                    res.body.arrJsonElements[0].STREAK.should.equal('W 1');

                    firstJobId = res.body.jobId;
                    done();
                });
        });

        it('it adds a second job to the repository', function(done) {
            chai.request(url)
                .post('/api/repository?url=http://www.nba.com/standings/2013/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('url');
                    res.body.should.have.property('jobId');
                    res.body.should.have.property('document');
                    res.body.should.have.property('arrJsonElements');
                    res.body.should.have.property('tableName');
                    res.body.url.should.equal('http://www.nba.com/standings/2013/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav');
                    res.body.tableName.should.equal( 'table' + res.body.jobId);
                    res.body.arrJsonElements.should.be.a('array');
                    res.body.arrJsonElements[0].NAME.should.equal('Toronto');
                    res.body.arrJsonElements[0].W.should.equal('48');
                    res.body.arrJsonElements[0].L.should.equal('34');
                    res.body.arrJsonElements[0].PCT.should.equal('0.585');
                    res.body.arrJsonElements[0].STREAK.should.equal('L 1');

                    secondJobId = res.body.jobId;
                    done();
                });
        });
        it('it adds a third job to the repository', function(done) {
            chai.request(url)
                .post('/api/repository?url=http://www.nba.com/standings/2012/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav')
                .end(function(err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.have.property('url');
                    res.body.should.have.property('jobId');
                    res.body.should.have.property('document');
                    res.body.should.have.property('arrJsonElements');
                    res.body.should.have.property('tableName');
                    res.body.url.should.equal('http://www.nba.com/standings/2012/team_record_comparison/conferenceNew_Std_Div.html?ls=iref:nba:gnav');
                    res.body.tableName.should.equal( 'table' + res.body.jobId);
                    res.body.arrJsonElements.should.be.a('array');
                    res.body.arrJsonElements[0].NAME.should.equal('New York');
                    res.body.arrJsonElements[0].W.should.equal('54');
                    res.body.arrJsonElements[0].L.should.equal('28');
                    res.body.arrJsonElements[0].PCT.should.equal('0.659');
                    res.body.arrJsonElements[0].STREAK.should.equal('W 1');

                    thirdJobId = res.body.jobId;
                    done();
                });
        });
    });

    describe('/GET api/repository', function () {

        it('it lists the repository', function (done) {
            chai.request(url)
                .get('/api/repository')
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    res.body[0].should.have.property('exectimestamp');
                    res.body[0].should.have.property('jobid');
                    res.body[0].should.have.property('url');
                    done();
                });

        });
    });

        describe('/GET api/document/:jobId', function () {

            it('it retrieves first job document', function(done) {
                chai.request(url)
                    .get('/api/document/' + firstJobId)
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.should.be.html;

                        done();
                    });
            });

            it('it retrieves second job document', function(done) {
                chai.request(url)
                    .get('/api/document/' + secondJobId)
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.should.be.html;

                        done();
                    });
            });

            it('it retrieves third job document', function(done) {
                chai.request(url)
                    .get('/api/document/' + thirdJobId)
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.should.be.html;

                        done();
                    });
            });
        });

        describe('/GET api/table/:jobId', function () {

            it('it retrieves the first job\'s parsed table', function(done) {
                chai.request(url)
                    .get('/api/table/' + firstJobId)
                    .end(function(err, res) {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.should.be.a('array');
                        res.body[0].C0_NAME.should.equal('Toronto');
                        res.body[0].C1_W.should.equal('49');
                        res.body[0].C2_L.should.equal('33');
                        res.body[0].C3_PCT.should.equal('0.598');
                        res.body[0].C10_STREAK.should.equal('W 1');
                        done();
                    });
            });

                it('it retrieves the second job\'s parsed table', function(done) {
                    chai.request(url)
                        .get('/api/table/' + secondJobId)
                        .end(function(err, res) {
                            res.should.have.status(200);
                            res.should.be.json;
                            res.body.should.be.a('array');
                            res.body[0].C0_NAME.should.equal('Toronto');
                            res.body[0].C1_W.should.equal('48');
                            res.body[0].C2_L.should.equal('34');
                            res.body[0].C3_PCT.should.equal('0.585');
                            res.body[0].C10_STREAK.should.equal('L 1');
                            done();
                        });
                });

                    it('it retrieves the third job\'s parsed table', function(done) {
                        chai.request(url)
                            .get('/api/table/' + thirdJobId)
                            .end(function(err, res) {
                                res.should.have.status(200);
                                res.should.be.json;
                                res.body.should.be.a('array');
                                res.body[0].C0_NAME.should.equal('New York');
                                res.body[0].C1_W.should.equal('54');
                                res.body[0].C2_L.should.equal('28');
                                res.body[0].C3_PCT.should.equal('0.659');
                                res.body[0].C10_STREAK.should.equal('W 1');
                                done();
                            });
                    });
        });

});

