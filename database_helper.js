'use strict';
module.change_code = 1;
var _ = require('lodash');
var CAKEBAKER_DATA_TABLE_NAME = 'cakeBakerData';

var productionCreds = {
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: ''
};

var dynasty = require('dynasty')(productionCreds);

// var localUrl = 'http://localhost:4000';
// var localCredentials = {
//     region: 'us-east-1',
//     accessKeyId: 'fake',
//     secretAccessKey: 'fake'
// };
//
// var localDynasty = require('dynasty')(localCredentials, localUrl);
// var dynasty = localDynasty;

function CakeBakerHelper() {
}
var cakeBakerTable = function () {
    return dynasty.table(CAKEBAKER_DATA_TABLE_NAME);
};

CakeBakerHelper.prototype.createCakeBakerTable = function () {
    return dynasty.describe(CAKEBAKER_DATA_TABLE_NAME)
        .catch(function (error) {
            return dynasty.create(CAKEBAKER_DATA_TABLE_NAME, {
                key_schema: {
                    hash: ['userId', 'string']
                }
            });
        });
};

CakeBakerHelper.prototype.storeCakeBakerData = function (userId, cakeBakerData) {
    return cakeBakerTable().insert({
        userId: userId,
        data: cakeBakerData
    }).catch(function (error) {
        console.log(error);
    });
};

CakeBakerHelper.prototype.readCakeBakerData = function (userId) {
    return cakeBakerTable().find(userId)
        .then(function (result) {
            console.log('cakeBakerTable found: ' + JSON.stringify(result));
            return result;
        })
        .catch(function (error) {
            console.log(error);
        });
};

module.exports = CakeBakerHelper;
