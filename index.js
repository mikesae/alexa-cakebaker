'use strict';
module.change_code = 1;

const Skill = require('alexa-app');
const CAKE_BAKER_SESSION_KEY = 'cake_baker';
const skillService = new Skill.app('cakebaker');
const CakeBakerHelper = require('./cakebaker_helper');
const DatabaseHelper = require('./database_helper');
const databaseHelper = new DatabaseHelper();

skillService.pre = () => {
    databaseHelper.createCakeBakerTable();
};

const getCakeBakerHelper = cakeBakerHelperData => {
    if (cakeBakerHelperData === undefined) {
        cakeBakerHelperData = {};
    }
    return new CakeBakerHelper(cakeBakerHelperData);
};

const getCakeBakerHelperFromRequest = request => {
    let cakeBakerHelperData = request.session(CAKE_BAKER_SESSION_KEY);
    return getCakeBakerHelper(cakeBakerHelperData);
};

const cakeBakerIntentFunction = (cakeBakerHelper, request, response) => {
    console.log(cakeBakerHelper);
    if (cakeBakerHelper.completed()) {
        response.say('Congratulations! Your cake is complete!');
        response.shouldEndSession(true);
    } else {
        response.say(cakeBakerHelper.getPrompt());
        response.reprompt("I didnt hear you. " + cakeBakerHelper.getPrompt());
        response.shouldEndSession(false);
    }
    response.session(CAKE_BAKER_SESSION_KEY, cakeBakerHelper);
    response.send();
};

skillService.intent('advanceStepIntent', {
        'utterances': ['{next|advance|continue}']
    }, (request, response) => {
        let cakeBakerHelper = getCakeBakerHelperFromRequest(request);
        cakeBakerHelper.currentStep++;
        saveCake(cakeBakerHelper, request);
        cakeBakerIntentFunction(cakeBakerHelper, request, response);
    }
);

skillService.launch(function (request, response) {
    let prompt = 'Welcome to Cakebaker! To start baking, say bake a cake';
    response.say(prompt).shouldEndSession(false);
});

skillService.intent('cakeBakeIntent', {
        'utterances': ['{new|start|create|begin|build} {|a|the} cake']
    }, (request, response) => {
        let cakeBakerHelper = new CakeBakerHelper({});
        cakeBakerIntentFunction(cakeBakerHelper, request, response);
    }
);

skillService.intent('saveCakeIntent', {
    'utterances': ['{save} {|a|the|my} cake']
}, (request, response) => {
    let cakeBakerHelper = getCakeBakerHelperFromRequest(request);
    saveCake(cakeBakerHelper, request);
    response.say('Your cake progress has been saved!');
    response.shouldEndSession(true).send();
    return false;
});

skillService.intent('loadCakeIntent', {
    'utterances': ['{load|resume} {|a|the} {|last} cake']
}, (request, response) => {
    //let userId = request.userId;
    let userId = request['data']['session']['user']['userId'];
    databaseHelper.readCakeBakerData(userId).then(function(result) {
        return (result === undefined ? {} : JSON.parse(result['data']));
    }).then(function(data) {
        let helper = new CakeBakerHelper(data);
        return cakeBakerIntentFunction(helper, request, response);
    });
    return false;
});

const saveCake = (cakeBakerHelper, request) =>{
    //let userId = request.userId;
    let userId = request['data']['session']['user']['userId'];
    databaseHelper.storeCakeBakerData(userId, JSON.stringify(cakeBakerHelper))
        .then(function (result) {
            return result;
        }).catch(function (error) {
        console.log(error);
    })
};

module.exports = skillService;
