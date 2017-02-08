var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var cheerio = require('cheerio');
var searchUrl = 'https://de.wikipedia.org/w/index.php?title=Spezial:Suche&profile=default&fulltext=1&search=';
var wikiUrl = 'https://de.m.wikipedia.org';
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', new builder.SimpleDialog(function (session, results) {
    var searchString = session.message.text,
        url = searchUrl+searchString;
    session.send("Ich suche nach einem passenden Wikipedia Eintrag... ");
    request(url, function(err, resp, body){
        $ = cheerio.load(body);
        var link = $('.searchresults .mw-search-exists a').attr('href'); //use your CSS selector here
        url = wikiUrl+link;
        request(url, function(err, resp, body) {
            $ = cheerio.load(body);
            var text = $('#mf-section-0 p').text();
            session.send(text);
        });
    });
}));
