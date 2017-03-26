var builder = require("botbuilder");
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);


exports.beginDialog = function (session, options) {
    session.beginDialog('genrePrompt', options || {});
}

exports.create = function (bot) {
    var prompt = new builder.IntentDialog({ recognizers: [recognizer] })
        .onBegin(function (session, args) {
            // Save args passed to prompt
            session.dialogData.retryPrompt = args.retryPrompt || "Sorry I didnt catch that. What would you like to watch?  (Or do you give up?)";

            // Send initial prompt
            // - This isn't a waterfall so you shouldn't call any of the built-in Prompts.
            session.send(args.prompt || "What type of movie do you want to watch?");
        })
        .matches(/(give up|quit|skip|yes)/i, function (session) {
            // Return 'false' to indicate they gave up
            session.endDialogWithResult({ response: false });
        })
        .matches('genre',function(session,args){
            //session.send(args);
            session.send('found a genre');
            
            var myGenre = builder.EntityRecognizer.findEntity(args.entities, 'genre');
            session.send('that genre is %s',myGenre.entity);
            if(!myGenre){
                session.send(session.dialogData.retryPrompt);
            } 
            //session.userData.Genre = myGenre;
            session.endDialogWithResult({response: myGenre.entity});
        })
        .onDefault(function (session) {
            
                // Re-prompt user
                session.send(session.dialogData.retryPrompt);
            
        });
    bot.dialog('genrePrompt', prompt);
}