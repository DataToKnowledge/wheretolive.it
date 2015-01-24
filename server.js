var express = require('express');
var app = express();
app.use(express.static(__dirname + '/app'));
app.listen(process.env.PORT || 5000);

app.listen(app.get('port'), function() {
  console.log("Node app is running")
})
