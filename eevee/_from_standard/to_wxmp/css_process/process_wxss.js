module.exports = {
  process: process
}

const fs = require("fs");

function process(wxssContent, wxssPath) {

  var styleObject = require('./wxss_to_style.js')({
    wxss: wxssContent,
    from: wxssPath,
    to: wxssPath,
    readFile: function(filePath) {
      return fs.readFileSync(filePath, 'utf8');
    }
  });

  return styleObject;

}
