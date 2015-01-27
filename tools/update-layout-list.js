'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var LAYOUTS_DIR =
  path.normalize(__dirname + '/../gaia/apps/keyboard/js/layouts/');
var filenames = fs.readdirSync(LAYOUTS_DIR);

var layoutDefs = [
  '\'use strict\';',
  '',
  '\/\/This list is automatic generated with a script by inspecting',
  '\/\/the available layouts in the gaia repo.',
  'var LAYOUTS = new Map();',
  ''
];

filenames.forEach(function(filename) {
  var id = path.basename(filename, '.js');

  var sandbox = {
    Keyboards: {},
    KeyEvent: {},
    KeyboardEvent: {}
  };

  var code = fs.readFileSync(
    LAYOUTS_DIR + '/' + filename,
    { encoding: 'utf8' }
  );

  vm.runInNewContext(code, sandbox, filename);

  var label = sandbox.Keyboards[id].menuLabel;

  layoutDefs.push('LAYOUTS.set(\'' + id + '\', \'' + label + '\');');
});

layoutDefs.push('');

fs.writeFileSync(
  __dirname + '/../assets/demo/layouts_list.js',
  layoutDefs.join('\n'),
  { encoding: 'utf8' }
);
