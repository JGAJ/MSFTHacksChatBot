/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add
natural language support to a bot.
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var genrePrompt = require('./genrePrompt');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.onDefault((session) => {
    session.send('Please type again, I didnt understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);

intents.onDefault([
    function (session) {
        if (!session.userData.Genre) {
            session.send('Hello!')
            session.beginDialog('/setgenre');
        } else {
            session.send('I dont know what you want');
        }
    }
]);

intents.matches('start', [
  function (session, args, next) {
        if (!session.userData.Genre) {
            session.send('Hi!');
            session.beginDialog('/setgenre');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('I\'ll look up %s movies!', session.userData.Genre);
    }
]);

intents.matches('change', [
  function (session) {
    builder.Prompts.choice(session, 'Change your mind?',['Yes','No']);
  },
  function (session,results,args,next){
    if(results.response.entity=='Yes'){
        session.beginDialog('/setgenre');
    } else {
        next()
    }
  },
  function (session, results) {
        session.send('I\'ll look up %s movies!', session.userData.Genre);
    }
]);

intents.matches('recommend', [
  function (session) {
    session.beginDialog('/recmovie');
  }
]);

intents.matches('test', [
  function (session) {
    session.send('test intent');
  }
]);

intents.matches('End', [
  function (session) {
    session.send('Bye!');
    session.userData = {};
    session.perUserInConversationData = {};
    session.userData = {};
    session.conversationData = {};
  }
]);


// bot.dialog('/setgenre', [
//     function (session) {
//         builder.Prompts.text(session, 'What would you like to watch today?');
//     },
//     function (session, results) {
//         session.userData.Genre = results.response;
//         session.endDialog();
//     }
// ]);

bot.dialog('/setgenre',[
    function(session){
        genrePrompt.beginDialog(session);
    },
    function(session,results){
        if(!results.result){
            session.send('Sorry!');
        }

        session.endDialog();
        
    }
]);


bot.dialog('/recmovie', [
    function (session) {
        session.send('I think you should watch a %s movie',session.userData.Genre);
        session.endDialog();
    },
]);

genrePrompt.create(bot);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
