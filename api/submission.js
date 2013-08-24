var superagent = require('superagent'),
base = 'http://127.0.0.1:8082',
request = superagent.agent();

function Submission(context) {
  this.data = {
    context_gus: context.context_gus,
    files: '',
    finalize: false,
    receivers: context.receivers,
    wb_fields: {}
  };
  this.fields = context.fields;
  this.id = null;
}

Submission.prototype.create = function(cb) {
  var self = this;
  request
  .post(base + '/submission')
  .send(self.data)
  .set('Cookie', 'XSRF-TOKEN=antani;')
  .set('X-XSRF-TOKEN', 'antani')
  .end(function(err, res){
    var receivers = self.data.receivers;
    self.id = res.body.id;
    self.data = res.body;
    self.data.receivers = receivers;
    cb(res);
  });
}

Submission.prototype.randomFill = function() {
  for (var i in this.fields) {
    this.data['wb_fields'][this.fields[i].key] = "I am an evil stress tester...";
  }
}

Submission.prototype.finalize = function(cb) {
  this.data.finalize = true;

  request
  .put(base + '/submission/' + this.id)
  .set('Cookie', 'XSRF-TOKEN=antani;')
  .set('X-XSRF-TOKEN', 'antani')
  .send(this.data)
  .end(function(err, res){
    cb(res.body);
  });
}

function listContexts(cb) {
  request
  .get(base + '/contexts')
  .end(function(err, res){
    cb(res.body);
  });
}

function listReceivers(cb) {
  request
  .get(base + '/receivers')
  .end(function(err, res){
    cb(res.body);
  });
}

listContexts(function(contexts){
  sub = new Submission(contexts[0]);
  sub.create(function(res){
    sub.randomFill();
    sub.finalize(function(submission){
      console.log("Receipt: " + submission.receipt);
    });
  });

});

// createSubmission(function(submission){
//   console.log("CREATED A SUBMISSION");
//   console.log(submission);
// });

// listContexts(function(contexts){
//   console.log("These are the contexts");
//   console.log(contexts);
// });
// 
// listReceivers(function(receivers){
//   console.log("These are the receivers");
//   console.log(receivers);
// });
// 
