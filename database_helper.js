'use strict';
module.change_code = 1;
const CAKEBAKER_DATA_TABLE_NAME = 'cakeBakerData';

// var productionCreds = {
//     region: 'us-east-1',
//     accessKeyId: '',
//     secretAccessKey: ''
// };
//
// var dynasty = require('dynasty')(productionCreds);

const localUrl = 'http://localhost:4000';
const localCredentials = {
    region: 'us-east-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake'
};

const localDynasty = require('dynasty')(localCredentials, localUrl);
const dynasty = localDynasty;

function DatabaseHelper() {
    const cakeBakerTable = dynasty.table(CAKEBAKER_DATA_TABLE_NAME);

    this.createCakeBakerTable = () => {
        return dynasty.describe(CAKEBAKER_DATA_TABLE_NAME)
            .catch(function (error) {
                return dynasty.create(CAKEBAKER_DATA_TABLE_NAME, {
                    key_schema: {
                        hash: ['userId', 'string']
                    }
                });
            });
    };

    this.storeCakeBakerData = (userId, cakeBakerData) => {
        return cakeBakerTable.insert({
            userId: userId,
            data: cakeBakerData
        }).catch(function (error) {
            console.log(error);
        });
    };

    this.readCakeBakerData = userId => {
        return cakeBakerTable.find(userId)
            .then(function (result) {
                console.log('cakeBakerTable found: ' + JSON.stringify(result));
                return result;
            })
            .catch(function (error) {
                console.log(error);
            });
    };
}

module.exports = DatabaseHelper;
