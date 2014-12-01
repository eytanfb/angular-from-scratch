'use strict';

// Framework

// Scope

function Scope() {

  this.$$watchers = [];

  this.$watch = function(watcherFn, listenerFn) {
    this.$$watchers.push({
      watcherFn: watcherFn,
      listenerFn: listenerFn
    });
  };

  this.$digest = function() {
    this.$$watchers.forEach(function(watch) {
      var newValue = watch.watcherFn(this);
      var oldValue = watch.last;
      if(newValue !== oldValue) {
        watch.listenerFn(newValue, oldValue, this);
        watch.last = newValue;
      }
    }, this);
  };

  this.$apply = function(exprFn) {
    try {
      exprFn(this);
    } finally {
      this.$digest();
    }
  };

}

// Compiler

var $$directives = {};

var $compile = function(element, scope) {
  Array.prototype.forEach.call(element.children, function(child) {
    $compile(child, scope);
  });

  Array.prototype.forEach.call(element.attributes, function(attribute) {
    var directive = $$directives[attribute.name];
    if(directive) {
      directive(scope, element, element.attributes);
    }
  });
};

$$directives['ng-bind'] = function(scope, element, attributes) {
  scope.$watch(function(scope) {
    return scope[attributes['ng-bind'].value];
  }, function(newValue) {
    element.innerHTML = newValue;
  });
};

$$directives['ng-model'] = function(scope, element, attributes) {
  scope.$watch(function(scope) {
    return scope[attributes['ng-model'].value];
  }, function(newValue) {
    element.value = newValue;
  });

  element.addEventListener('keyup', function() {
    console.log('help', element.value, attributes['ng-model']);
    scope.$apply(function(scope) {
      scope[attributes['ng-model'].value] = element.value;
    });
  });
};


// User code

var scope = new Scope();

$compile(document.body, scope);

scope.$apply(function(scope) {
  scope.hello = 'Hello ng-europe';
});
