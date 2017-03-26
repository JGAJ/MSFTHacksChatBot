var restify = require('restify');
var builder = require('botbuilder');

var port = 3978;
var appId = null;
var appPassword = null;

var server = restify.createServer();
server.listen(port, function() {
  console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
  appId: appId,
  appPassword: appPassword
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.dialog('/', function(session) {
  session.send('Hello World');
});
