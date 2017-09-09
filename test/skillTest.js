var assert = require('assert');
var bst = require('bespoken-tools');
var _ = require('lodash');
var yaml = require('js-yaml');
var fs   = require('fs');

try {
  var tests = yaml.safeLoad(fs.readFileSync('./test/dialogs.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

describe('Skill test', function () {
  _.each(tests, (test) => {
    describe(test.scenario, () => {
      var server = null;
      var alexa = null;
    
      before(function (done) {
        server = new bst.LambdaServer('./src/index.js', 10000, true);
        alexa = new bst.BSTAlexa('http://localhost:10000?disableSignatureCheck=true',
          './speechAssets/IntentSchema.json',
          './speechAssets/Utterances.txt',
          'JPK');
        server.start(function () {
          alexa.start(function (error) {
            if (error !== undefined) {
              console.error("Error: " + error);
            } else {
              done();
            }
          })
        });
      });
    
      after(function (done) {
        alexa.stop(function () {
          server.stop(function () {
            done();
          });
        });
      });

      it(`on lunch - alexa: ${test.lunchSpeech}`, (done) => {
        this.timeout(10000);
        alexa.launched(function (error, payload) {
          assert.equal(payload.response.outputSpeech.ssml, `<speak> ${test.lunchSpeech} </speak>`);
          done();
        });
      })
      _.each(test.dialog, (pair) => {
        it(`user: ${pair.userSpeech} - alexa: ${pair.alexaSpeech}`, (done) => {
          this.timeout(10000);
          alexa.spoken(pair.userSpeech, function (error, payload) {
            assert.equal(payload.response.outputSpeech.ssml, `<speak> ${pair.alexaSpeech} </speak>`);
            done();
          });
        })
      });
    })
  });
});
