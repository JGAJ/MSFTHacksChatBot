/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add
natural language support to a bot.
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

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

//bot.dialog('/', intents);


bot.dialog('/', intents);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.Genre) {
            session.beginDialog('/setgenre');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('I\'ll look up %s movies!', session.userData.Genre);
    }
]);

intents.matches('start', [
  function (session) {
    session.beginDialog('/setgenre');
  }
]);

intents.matches('change', [
  function (session) {
    session.beginDialog('/changegenre');
  }
]);

intents.matches('test', [
  function (session) {
    session.send('test intent');
    session.send('url: %s',LuisModelUrl);
  }
]);

intents.matches('End', [
  function (session) {
    session.perUserInConversationData = {};
    session.userData = {};
    session.conversationData = {};
  }
]);


bot.dialog('/settopic', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What would you like to watch today?');
    },
    function (session, results) {
        session.userData.Genre = results.response;
        session.endDialog();
    }
]);

bot.dialog('/changetopic', [
    function (session) {
        builder.Prompts.text(session, 'Want to watch something else?');
    },
    function (session, results) {
        session.userData.Genre = results.response;
        session.endDialog();
    }
]);

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
