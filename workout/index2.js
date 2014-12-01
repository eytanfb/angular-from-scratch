'use strict';

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
        watch.listenerFn(newValue, oldValue);
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

var $$directives = {
  'ng-bind': function(scope, element, attributes) {
    scope.$watch(function(scope) {
      return scope[attributes['ng-bind'].value];
    }, function(newValue) {
      element.innerHTML = newValue;
    });
  },
  'ng-model': function(scope, element, attributes) {
    scope.$watch(function(scope) {
      return scope[attributes['ng-model'].value];
    }, function(newValue) {
      element.value = newValue;
    });
    element.addEventListener('keyup', function() {
      scope.$apply(function(scope) {
        scope[attributes['ng-model'].value] = element.value;
      });
    });
  }
};

function $compile(element, scope) {
  Array.prototype.forEach.call(element.children, function(child) {
    $compile(child, scope);
  });

  Array.prototype.forEach.call(element.attributes, function(attribute) {
    if($$directives[attribute.name]) {
      $$directives[attribute.name](scope, element, element.attributes);
    }
  });
}


var scope = new Scope();

$compile(document.body, scope);

scope.$watch(function(scope) {
  return scope.hello;
}, function(newValue, oldValue) {
  console.log('changed from', oldValue, 'to', newValue);
});

scope.$apply(function(scope) {
  scope.hello = 'Hello ng-europe';
});

scope.$apply(function(scope) {
  scope.hello = 'Hello ng-europe !!';
});
