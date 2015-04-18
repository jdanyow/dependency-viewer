System.register(['aurelia-framework', 'fzaninotto/DependencyWheel/js/d3.min', 'fzaninotto/DependencyWheel/js/d3.dependencyWheel', 'aurelia-http-client'], function (_export) {
  var inject, ObserverLocator, d3, dw, HttpClient, _classCallCheck, _createClass, App, testData;

  function buildPackageNames(map, data) {
    var names = Object.keys(map),
        name,
        i;
    for (i = 0; i < names.length; i++) {
      name = names[i];
      key = map[name];
      if (typeof key === 'string') {
        if (data.packageNames.indexOf(key) !== -1) {
          continue;
        }
        data.packageNames.push(key);
      } else {
        buildPackageNames(key, data);
      }
    }
  }

  function buildDepArray(map, data) {
    var deps = [0],
        key,
        index = {};
    Object.keys(map).forEach(function (key) {
      return index[map[key]] = true;
    });
    for (var i = 1; i < data.packageNames.length; i++) {
      key = data.packageNames[i];
      deps.push(index[key] ? 1 : 0);
    }
    return deps;
  }

  function buildMatrix(map, data) {
    var name, key;
    data.matrix.push(buildDepArray(map, data));
    for (var i = 1; i < data.packageNames.length; i++) {
      key = data.packageNames[i];
      data.matrix.push(buildDepArray(map[key] || {}, data));
    }
  }

  function buildDataFromSystemJSMap(map) {
    var data = {
      packageNames: [],
      matrix: []
    };

    buildPackageNames(map, data);

    data.packageNames.splice(0, 0, 'root');

    buildMatrix(map, data);

    data.packageNames = data.packageNames.map(function (name) {
      var i = name.indexOf(':');
      if (i === -1) {
        return name;
      }
      return name.substring(i + 1);
    });
    data.packageNames.slice(1).sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }).splice(0, 0, 'root');
    return data;
  }

  return {
    setters: [function (_aureliaFramework) {
      inject = _aureliaFramework.inject;
      ObserverLocator = _aureliaFramework.ObserverLocator;
    }, function (_fzaninottoDependencyWheelJsD3Min) {
      d3 = _fzaninottoDependencyWheelJsD3Min['default'];
    }, function (_fzaninottoDependencyWheelJsD3DependencyWheel) {
      dw = _fzaninottoDependencyWheelJsD3DependencyWheel['default'];
    }, function (_aureliaHttpClient) {
      HttpClient = _aureliaHttpClient.HttpClient;
    }],
    execute: function () {
      'use strict';

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

      _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

      inject(ObserverLocator);

      App = (function () {
        function App(observerLocator) {
          _classCallCheck(this, App);

          this.__initializeProperties();

          this.observerLocator = observerLocator;
          this.readConfig();
          observerLocator.getObserver(this, 'config').subscribe(this.configChanged.bind(this));
        }

        _createClass(App, [{
          key: 'config',
          value: undefined,
          enumerable: true
        }, {
          key: 'data',
          value: undefined,
          enumerable: true
        }, {
          key: 'allPackages',
          value: undefined,
          enumerable: true
        }, {
          key: 'selectedPackages',
          value: undefined,
          enumerable: true
        }, {
          key: 'dispose',
          value: undefined,
          enumerable: true
        }, {
          key: 'observerLocator',
          value: undefined,
          enumerable: true
        }, {
          key: 'readConfig',
          value: function readConfig() {
            var configRegex = /System\.config\(([^\)]+)\);/g,
                matches,
                json,
                map;
            if (this.dispose) {
              this.dispose();
            }

            while ((matches = configRegex.exec(this.config)) && !map) {
              json = matches[1];
              map = JSON.parse(json).map;
            }

            if (!map) {
              return;
            }

            this.data = buildDataFromSystemJSMap(map);
            this.allPackages = this.data.packageNames;
            this.selectedPackages = this.data.packageNames.filter(function (name) {
              return !/jspm\/nodelibs/.test(name);
            });
            this.dispose = this.observerLocator.getArrayObserver(this.selectedPackages).subscribe(this.selectedPackagesChanged.bind(this));
          }
        }, {
          key: 'configChanged',
          value: function configChanged(newValue) {
            this.readConfig();
            this.render();
          }
        }, {
          key: 'selectedPackagesChanged',
          value: function selectedPackagesChanged() {
            var data = buildDataFromSystemJSMap(System.map),
                i = data.packageNames.length,
                name,
                j;
            while (i--) {
              name = data.packageNames[i];
              if (this.selectedPackages.indexOf(name) !== -1) {
                continue;
              }
              data.packageNames.splice(i, 1);
              data.matrix.splice(i, 1);
              j = data.matrix.length;
              while (j--) {
                data.matrix[j].splice(i, 1);
              }
            }
            this.data = data;
            this.render();
          }
        }, {
          key: 'attached',
          value: function attached() {
            this.render();
          }
        }, {
          key: 'render',
          value: function render() {
            var chart = d3.chart.dependencyWheel().width(window.innerHeight).margin(200).padding(0.02);

            document.getElementById('chart_placeholder').innerHTML = '';
            d3.select('#chart_placeholder').datum(this.data).call(chart);
          }
        }, {
          key: 'detached',
          value: function detached() {
            this.dispose();
          }
        }, {
          key: '__initializeProperties',
          value: function __initializeProperties() {
            this.config = testData;
          }
        }], [{
          key: 'inject',
          value: function inject() {
            return [ObserverLocator];
          }
        }]);

        return App;
      })();

      _export('App', App);

      testData = 'System.config({\n  "paths": {\n    "*": "*.js",\n    "github:*": "jspm_packages/github/*.js",\n    "npm:*": "jspm_packages/npm/*.js",\n    "aurelia-skeleton-navigation/*": "lib/*.js"\n  }\n});\n\nSystem.config({\n  "map": {\n    "aurelia-animator-css": "github:aurelia/animator-css@0.1.0",\n    "aurelia-bootstrapper": "github:aurelia/bootstrapper@0.11.0",\n    "aurelia-dependency-injection": "github:aurelia/dependency-injection@0.6.0",\n    "aurelia-framework": "github:aurelia/framework@0.10.0",\n    "aurelia-http-client": "github:aurelia/http-client@0.7.0",\n    "aurelia-router": "github:aurelia/router@0.7.0",\n    "bootstrap": "github:twbs/bootstrap@3.3.4",\n    "css": "github:systemjs/plugin-css@0.1.9",\n    "font-awesome": "npm:font-awesome@4.3.0",\n    "github:aurelia/animator-css@0.1.0": {\n      "aurelia-templating": "github:aurelia/templating@0.10.3"\n    },\n    "github:aurelia/binding@0.5.0": {\n      "aurelia-dependency-injection": "github:aurelia/dependency-injection@0.6.0",\n      "aurelia-metadata": "github:aurelia/metadata@0.4.0",\n      "aurelia-task-queue": "github:aurelia/task-queue@0.3.0",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/bootstrapper@0.11.0": {\n      "aurelia-event-aggregator": "github:aurelia/event-aggregator@0.3.0",\n      "aurelia-framework": "github:aurelia/framework@0.10.0",\n      "aurelia-history": "github:aurelia/history@0.3.0",\n      "aurelia-history-browser": "github:aurelia/history-browser@0.3.0",\n      "aurelia-loader-default": "github:aurelia/loader-default@0.6.0",\n      "aurelia-logging-console": "github:aurelia/logging-console@0.3.0",\n      "aurelia-router": "github:aurelia/router@0.7.0",\n      "aurelia-templating": "github:aurelia/templating@0.10.3",\n      "aurelia-templating-binding": "github:aurelia/templating-binding@0.10.0",\n      "aurelia-templating-resources": "github:aurelia/templating-resources@0.10.0",\n      "aurelia-templating-router": "github:aurelia/templating-router@0.11.0",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/dependency-injection@0.6.0": {\n      "aurelia-logging": "github:aurelia/logging@0.3.0",\n      "aurelia-metadata": "github:aurelia/metadata@0.4.0",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/framework@0.10.0": {\n      "aurelia-binding": "github:aurelia/binding@0.5.0",\n      "aurelia-dependency-injection": "github:aurelia/dependency-injection@0.6.0",\n      "aurelia-loader": "github:aurelia/loader@0.5.0",\n      "aurelia-logging": "github:aurelia/logging@0.3.0",\n      "aurelia-metadata": "github:aurelia/metadata@0.4.0",\n      "aurelia-path": "github:aurelia/path@0.5.0",\n      "aurelia-task-queue": "github:aurelia/task-queue@0.3.0",\n      "aurelia-templating": "github:aurelia/templating@0.10.3",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/history-browser@0.3.0": {\n      "aurelia-history": "github:aurelia/history@0.3.0",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/http-client@0.7.0": {\n      "aurelia-path": "github:aurelia/path@0.5.0",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/loader-default@0.6.0": {\n      "aurelia-loader": "github:aurelia/loader@0.5.0",\n      "aurelia-metadata": "github:aurelia/metadata@0.4.0"\n    },\n    "github:aurelia/loader@0.5.0": {\n      "aurelia-html-template-element": "github:aurelia/html-template-element@0.2.0",\n      "aurelia-path": "github:aurelia/path@0.5.0",\n      "core-js": "github:zloirock/core-js@0.8.3",\n      "webcomponentsjs": "github:webcomponents/webcomponentsjs@0.5.5"\n    },\n    "github:aurelia/metadata@0.4.0": {\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/route-recognizer@0.3.0": {\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/router@0.7.0": {\n      "aurelia-dependency-injection": "github:aurelia/dependency-injection@0.6.0",\n      "aurelia-event-aggregator": "github:aurelia/event-aggregator@0.3.0",\n      "aurelia-history": "github:aurelia/history@0.3.0",\n      "aurelia-path": "github:aurelia/path@0.5.0",\n      "aurelia-route-recognizer": "github:aurelia/route-recognizer@0.3.0",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/templating-binding@0.10.0": {\n      "aurelia-binding": "github:aurelia/binding@0.5.0",\n      "aurelia-logging": "github:aurelia/logging@0.3.0",\n      "aurelia-templating": "github:aurelia/templating@0.10.3"\n    },\n    "github:aurelia/templating-resources@0.10.0": {\n      "aurelia-binding": "github:aurelia/binding@0.5.0",\n      "aurelia-dependency-injection": "github:aurelia/dependency-injection@0.6.0",\n      "aurelia-logging": "github:aurelia/logging@0.3.0",\n      "aurelia-templating": "github:aurelia/templating@0.10.3",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:aurelia/templating-router@0.11.0": {\n      "aurelia-dependency-injection": "github:aurelia/dependency-injection@0.6.0",\n      "aurelia-metadata": "github:aurelia/metadata@0.4.0",\n      "aurelia-path": "github:aurelia/path@0.5.0",\n      "aurelia-router": "github:aurelia/router@0.7.0",\n      "aurelia-templating": "github:aurelia/templating@0.10.3"\n    },\n    "github:aurelia/templating@0.10.3": {\n      "aurelia-binding": "github:aurelia/binding@0.5.0",\n      "aurelia-dependency-injection": "github:aurelia/dependency-injection@0.6.0",\n      "aurelia-html-template-element": "github:aurelia/html-template-element@0.2.0",\n      "aurelia-loader": "github:aurelia/loader@0.5.0",\n      "aurelia-logging": "github:aurelia/logging@0.3.0",\n      "aurelia-metadata": "github:aurelia/metadata@0.4.0",\n      "aurelia-path": "github:aurelia/path@0.5.0",\n      "aurelia-task-queue": "github:aurelia/task-queue@0.3.0",\n      "core-js": "github:zloirock/core-js@0.8.3"\n    },\n    "github:jspm/nodelibs-assert@0.1.0": {\n      "assert": "npm:assert@1.3.0"\n    },\n    "github:jspm/nodelibs-buffer@0.1.0": {\n      "buffer": "npm:buffer@3.1.2"\n    },\n    "github:jspm/nodelibs-events@0.1.0": {\n      "events-browserify": "npm:events-browserify@0.0.1"\n    },\n    "github:jspm/nodelibs-http@1.7.1": {\n      "Base64": "npm:Base64@0.2.1",\n      "events": "github:jspm/nodelibs-events@0.1.0",\n      "inherits": "npm:inherits@2.0.1",\n      "stream": "github:jspm/nodelibs-stream@0.1.0",\n      "url": "github:jspm/nodelibs-url@0.1.0",\n      "util": "github:jspm/nodelibs-util@0.1.0"\n    },\n    "github:jspm/nodelibs-https@0.1.0": {\n      "https-browserify": "npm:https-browserify@0.0.0"\n    },\n    "github:jspm/nodelibs-os@0.1.0": {\n      "os-browserify": "npm:os-browserify@0.1.2"\n    },\n    "github:jspm/nodelibs-path@0.1.0": {\n      "path-browserify": "npm:path-browserify@0.0.0"\n    },\n    "github:jspm/nodelibs-process@0.1.1": {\n      "process": "npm:process@0.10.1"\n    },\n    "github:jspm/nodelibs-stream@0.1.0": {\n      "stream-browserify": "npm:stream-browserify@1.0.0"\n    },\n    "github:jspm/nodelibs-url@0.1.0": {\n      "url": "npm:url@0.10.3"\n    },\n    "github:jspm/nodelibs-util@0.1.0": {\n      "util": "npm:util@0.10.3"\n    },\n    "github:systemjs/plugin-css@0.1.9": {\n      "clean-css": "npm:clean-css@3.1.9",\n      "fs": "github:jspm/nodelibs-fs@0.1.2",\n      "path": "github:jspm/nodelibs-path@0.1.0"\n    },\n    "github:twbs/bootstrap@3.3.4": {\n      "jquery": "github:components/jquery@2.1.3"\n    },\n    "npm:amdefine@0.1.0": {\n      "fs": "github:jspm/nodelibs-fs@0.1.2",\n      "path": "github:jspm/nodelibs-path@0.1.0",\n      "process": "github:jspm/nodelibs-process@0.1.1"\n    },\n    "npm:assert@1.3.0": {\n      "util": "npm:util@0.10.3"\n    },\n    "npm:buffer@3.1.2": {\n      "base64-js": "npm:base64-js@0.0.8",\n      "ieee754": "npm:ieee754@1.1.4",\n      "is-array": "npm:is-array@1.0.1"\n    },\n    "npm:clean-css@3.1.9": {\n      "buffer": "github:jspm/nodelibs-buffer@0.1.0",\n      "commander": "npm:commander@2.6.0",\n      "fs": "github:jspm/nodelibs-fs@0.1.2",\n      "http": "github:jspm/nodelibs-http@1.7.1",\n      "https": "github:jspm/nodelibs-https@0.1.0",\n      "os": "github:jspm/nodelibs-os@0.1.0",\n      "path": "github:jspm/nodelibs-path@0.1.0",\n      "process": "github:jspm/nodelibs-process@0.1.1",\n      "source-map": "npm:source-map@0.1.43",\n      "url": "github:jspm/nodelibs-url@0.1.0",\n      "util": "github:jspm/nodelibs-util@0.1.0"\n    },\n    "npm:commander@2.6.0": {\n      "child_process": "github:jspm/nodelibs-child_process@0.1.0",\n      "events": "github:jspm/nodelibs-events@0.1.0",\n      "path": "github:jspm/nodelibs-path@0.1.0",\n      "process": "github:jspm/nodelibs-process@0.1.1"\n    },\n    "npm:core-util-is@1.0.1": {\n      "buffer": "github:jspm/nodelibs-buffer@0.1.0"\n    },\n    "npm:events-browserify@0.0.1": {\n      "process": "github:jspm/nodelibs-process@0.1.1"\n    },\n    "npm:font-awesome@4.3.0": {\n      "css": "github:systemjs/plugin-css@0.1.9"\n    },\n    "npm:https-browserify@0.0.0": {\n      "http": "github:jspm/nodelibs-http@1.7.1"\n    },\n    "npm:inherits@2.0.1": {\n      "util": "github:jspm/nodelibs-util@0.1.0"\n    },\n    "npm:os-browserify@0.1.2": {\n      "os": "github:jspm/nodelibs-os@0.1.0"\n    },\n    "npm:path-browserify@0.0.0": {\n      "process": "github:jspm/nodelibs-process@0.1.1"\n    },\n    "npm:punycode@1.3.2": {\n      "process": "github:jspm/nodelibs-process@0.1.1"\n    },\n    "npm:readable-stream@1.1.13": {\n      "buffer": "github:jspm/nodelibs-buffer@0.1.0",\n      "core-util-is": "npm:core-util-is@1.0.1",\n      "events": "github:jspm/nodelibs-events@0.1.0",\n      "inherits": "npm:inherits@2.0.1",\n      "isarray": "npm:isarray@0.0.1",\n      "process": "github:jspm/nodelibs-process@0.1.1",\n      "stream": "github:jspm/nodelibs-stream@0.1.0",\n      "stream-browserify": "npm:stream-browserify@1.0.0",\n      "string_decoder": "npm:string_decoder@0.10.31",\n      "util": "github:jspm/nodelibs-util@0.1.0"\n    },\n    "npm:source-map@0.1.43": {\n      "amdefine": "npm:amdefine@0.1.0",\n      "fs": "github:jspm/nodelibs-fs@0.1.2",\n      "path": "github:jspm/nodelibs-path@0.1.0",\n      "process": "github:jspm/nodelibs-process@0.1.1"\n    },\n    "npm:stream-browserify@1.0.0": {\n      "events": "github:jspm/nodelibs-events@0.1.0",\n      "inherits": "npm:inherits@2.0.1",\n      "readable-stream": "npm:readable-stream@1.1.13"\n    },\n    "npm:string_decoder@0.10.31": {\n      "buffer": "github:jspm/nodelibs-buffer@0.1.0"\n    },\n    "npm:url@0.10.3": {\n      "assert": "github:jspm/nodelibs-assert@0.1.0",\n      "punycode": "npm:punycode@1.3.2",\n      "querystring": "npm:querystring@0.2.0",\n      "util": "github:jspm/nodelibs-util@0.1.0"\n    },\n    "npm:util@0.10.3": {\n      "inherits": "npm:inherits@2.0.1",\n      "process": "github:jspm/nodelibs-process@0.1.1"\n    }\n  }\n});\n';
    }
  };
});
//# sourceMappingURL=data:application/json;base64,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LE1BQU07Z0JBQzVCLElBQUk7Z0JBQ0osQ0FBQyxDQUFDO0FBQ04sbUJBQU0sQ0FBQyxFQUFFLEVBQUU7QUFDVCxrQkFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsa0JBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUM5Qyx5QkFBUztlQUNWO0FBQ0Qsa0JBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvQixrQkFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLGVBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN2QixxQkFBTSxDQUFDLEVBQUUsRUFBRTtBQUNULG9CQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7ZUFDN0I7YUFDRjtBQUNELGdCQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixnQkFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1dBQ2Y7OztpQkFFTyxvQkFBRztBQUNULGdCQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7V0FDZjs7O2lCQUVLLGtCQUFHO0FBQ1AsZ0JBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQ25DLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQ3pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDWCxPQUFPLENBQUMsSUFBRyxDQUFDLENBQUM7O0FBRWhCLG9CQUFRLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUM1RCxjQUFFLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQzVCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ2hCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztXQUNoQjs7O2lCQUVPLG9CQUFHO0FBQ1QsZ0JBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztXQUNoQjs7OztpQkFqRkQsTUFBTSxHQUFHLFFBQVE7Ozs7aUJBRkosa0JBQUc7QUFBQyxtQkFBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1dBQUM7OztlQURoQyxHQUFHOzs7cUJBQUgsR0FBRzs7QUFrSlosY0FBUSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VSb290IjoiLi4vc3JjLyJ9