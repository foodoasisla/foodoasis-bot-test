// server.js
// where your node app starts

const owner = 'foodoasisla';
const repo = 'site';
const getGitHubApp = require('github-app');
const bodyParser = require('body-parser');
const yaml = require('js-yaml');

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
// To find out the installation ID (APP_INSTALLATION)
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
app.use(bodyParser.urlencoded({ extended: true }));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/add", function (request, response) {
  const title = request.body.title;
  
  // Create a branch
  var branchName = `location-${Math.random().toString(36).substr(2,5)}`;

  
  // Create a unique file within that branch
  var filename = `location-${Math.random().toString(36).substr(2,5)}.md`;

  // Get hash of the current commit
  github.gitdata.getReference({
    owner: owner,
    repo: repo,
    ref: 'heads/master'
  }).then(result => {
    /*
    console.log('***********');
    console.log('get reference');
    console.log('***********');
    console.dir(result);
    */
    return github.gitdata.createReference({
      owner: owner,
      repo: repo,
      ref: `refs/heads/${branchName}`,
      sha: result.data.object.sha
    });

  }).then(result => {
    /*
    console.log('***********');
    console.log('create reference');
    console.log('***********');
    console.dir(result);
    */

      // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let content =
`---
${yaml.safeDump(request.body)}
---
`
    content = new Buffer(content).toString('base64');

    return github.repos.createFile({
      owner: owner,
      repo: repo,
      path: filename,
      branch: branchName,
      content: content,
      message: `Added a new file: ${filename}`
    })
  }).then(result => {
    return github.pullRequests.create({
      owner: owner,
      repo: repo,
      title: `Suggested a new location ${title}`,
      head: branchName,
      base: 'master',
      body: 'Neat!'
    })
  }).then(result => {
    console.dir(result);
    response.redirect('https://staging.foodoasis.la/add-confirm?pr_link=');
    //console.log(result.data.content.html_url);
  }).catch(error => {
    console.log(error);
    response.redirect('https://staging.foodoasis.la/add?error=1');
  });

  // Create a pull request

  //dreams.push(request.query.dream);
  //response.sendStatus(200);
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
