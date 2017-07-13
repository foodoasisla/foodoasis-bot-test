// server.js
// where your node app starts

const username = 'jimthoburn';

const repositoryName = 'site';

const getGitHubApp = require('github-app');
 
const githubApp = getGitHubApp({
  // Your app id 
  id: process.env.APP_ID,
  // The private key for your app, which can be downloaded from the 
  // app's settings: https://github.com/settings/apps 
  cert: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
});

// Set up a GitHub app
var github;
githubApp.asInstallation(process.env.APP_INSTALLATION).then(gh => {
  github = gh;
});


/*
githubApp.asInstallation(process.env.APP_INSTALLATION).then(github => {
  github.issues.createComment({
    owner: 'jimthoburn',
    repo: 'foodoasis-bot-test',
    number: 1,
    body: 'hello world!'
  });
});
*/

/*
To find out the installation ID (APP_INSTALLATION)
githubApp.asApp().then(github => {
  console.log("Installations:")
  github.integrations.getInstallations({}).then(console.log);
});
*/

// init project
var express = require('express');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  const title = request.query.dream;
  
  // Create a branch
  var branchName = `location-${Math.random().toString(36).substr(2,5)}`;

  
  // Create a unique file within that branch
  var filename = `location-${Math.random().toString(36).substr(2,5)}.md`;

  // Get hash of the current commit
  github.gitdata.getReference({
    owner: 'jimthoburn',
    repo: 'foodoasis-bot-test',
    ref: 'heads/master'
  }).then(result => {
    console.log('***********');
    console.log('get reference');
    console.log('***********');
    console.dir(result);
    return github.gitdata.createReference({
      owner: 'jimthoburn',
      repo: 'foodoasis-bot-test',
      ref: `refs/heads/${branchName}`,
      sha: result.data.object.sha
    });

  }).then(result => {
    console.log('***********');
    console.log('create reference');
    console.log('***********');
    console.dir(result);
    return github.repos.createFile({
      owner: 'jimthoburn',
      repo: 'foodoasis-bot-test',
      path: filename,
      branch: branchName,
      content: 'SGVsbG8gV29ybGQ=', // Hello World
      message: `Added a new file: ${filename}`
    })
  }).then(result => {
    return github.pullRequests.create({
      owner: 'jimthoburn',
      repo: 'foodoasis-bot-test',
      title: `Suggested a new location ${title}`,
      head: branchName,
      base: 'master',
      body: 'Neat!'
    })
  }).then(result => {
    //console.dir(result);
    //console.log(result.data.content.html_url);
  }).catch(error => {
    console.log(error);
  });


  // Create a pull request

  //dreams.push(request.query.dream);
  response.sendStatus(200);
});


// Simple in-memory store for now
var dreams = [
  "Gregor suggested a new location: The Best French Bread Bakery"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
