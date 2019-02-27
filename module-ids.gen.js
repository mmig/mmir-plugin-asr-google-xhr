
/*********************************************************************
 * This file is automatically generated by mmir-plugins-export tools *
 *         Do not modify: ANY CHANGES WILL GET DISCARED              *
 *********************************************************************/

var _id = "mmir-plugin-asr-google-xhr";
var _paths = {
  "mmir-plugin-asr-google-xhr/asrGoogleXhr": "www/asrGoogleXhr.js",
  "mmir-plugin-asr-google-xhr/asrGoogleXhrCompat": "www/alt/asrGoogleXhrCompat.js",
  "mmir-plugin-asr-google-xhr": "www/asrGoogleXhr.js"
};
var _workers = [];
var _exportedModules = [
  "mmir-plugin-asr-google-xhr"
];
var _dependencies = [
  "mmir-plugin-encoder-flac",
  "mmir-plugin-encoder-core"
];
var _exportedFiles = [];
var _modes = {};
function _join(source, target, dict){
  source.forEach(function(item){
    if(!dict[item]){
      dict[item] = true;
      target.push(item);
    }
  });
};
function _getAll(type, mode, isResolve){

  if(typeof mode === 'boolean'){
    isResolve = mode;
    mode = void(0);
  }

  var data = this[type];
  var isArray = Array.isArray(data);
  var result = isArray? [] : Object.assign({}, data);
  var dupl = result;
  var mod = mode && this.modes[mode];
  if(isArray){
    dupl = {};
    if(mod && mod[type]){
      _join(this.modes[mode][type], result, dupl);
    }
    _join(data, result, dupl);
  } else if(isResolve){
    var root = __dirname;
    Object.keys(result).forEach(function(field){
      var val = result[field];
      if(mod && mod[field]){
        val = _paths[mod[field]];
      }
      result[field] = root + '/' + val;
    });
  }
  this.dependencies.forEach(function(dep){
    var depExports = require(dep + '/module-ids.gen.js');
    var depData = depExports.getAll(type, mode, isResolve);
    if(isArray){
      _join(depData, result, dupl);
    } else {
      Object.assign(result, depData)
    }
  });

  return result;
};
module.exports = {id: _id, paths: _paths, workers: _workers, modules: _exportedModules, files: _exportedFiles, dependencies: _dependencies, modes: _modes, getAll: _getAll};
