const Twit = require('twit');
const fs = require('fs');
const responses = require('./responses.json');


const bot = new Twit({
  consumer_key:         '',
  consumer_secret:      '',
  access_token:         '',
  access_token_secret:  '',
})

// collects all US names in an array
const data = fs.readFileSync(__dirname + "/names.txt", 'utf8');
const names = data.split('\n').sort();

// replies to tweets that mention @GrackBot with a random name
function genRandomName() {
  // searches for any mentions of @GrackBot
  bot.get('statuses/mentions_timeline', {screen_name: '@GrackBot'}, function(err, data, response) {
    // for each mention of @GrackBot, replies with a random name
    for (let i = 0; i < data.length; i++) {
      const tweet = data[i];
      const id = tweet.id_str;
      const screenName = '@' + tweet.user.screen_name;
      // checks if tweet has been replied to
      // if it has, don't reply
      //if it hasn't, reply and add id to data storage
      if (responses.idList[id] === undefined) {
        addResponse(id);
        // generates a random name and posts it
        const randomName = names[Math.floor(Math.random() * 95026)];
        bot.post('statuses/update', {status: screenName + " Here's a name suggestion: " +
          randomName, in_reply_to_status_id: id}, function(err, data, response) {
            // makes sure GrackBot doesn't reply to own tweets
            addResponse(data.id_str);
          });
        console.log("Tweeted to " + screenName);
      }
    }
  });
}

// adds ids to data storage
function addResponse(id) {
  responses.idList[id] = "";
  fs.writeFile('./responses.json', JSON.stringify(responses), function (err) {
    if (err) return console.log(err);
  });
}

// checks for bot mentions every 10 seconds
setInterval(function() {
  try {
    genRandomName();
  }
  catch (e) {
    console.log(e);
  }
}, 1000 * 10);
