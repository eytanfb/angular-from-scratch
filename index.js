'use strict';

// framework

// scope

var Scope = function() {
  this.$$watchers = [];

  this.$watch = function(watcherFn, listenerFn) {
    console.log("new watcher set:", watcherFn, "listenerFn:", listenerFn);
    this.$$watchers.push({
      watcherFn: watcherFn,
      listenerFn: listenerFn
    });
  };

  this.$digest = function() {
    console.log("called $digest");
    this.$$watchers.forEach(function(watcher) {
      var newValue = watcher.watcherFn();
      var oldValue = watcher.last;
      if (newValue !== oldValue) {
        watcher.listenerFn(newValue, oldValue);
        watcher.last = newValue;
      }
    });
  };

  this.$apply = function(exprFn) {
    console.log("called $apply");
    try {
      exprFn();
    } finally {
      this.$digest();
    }
  };
};

var $scope = new Scope();

// compiler

var $$directives = {
  'ng-bind': function($scope, $element, $attributes) {
    console.log("call $watch from ng-bind");
    $scope.$watch(function() {
      return $scope[$attributes['ng-bind'].value];
    }, function(newValue, oldValue) {
      $element.innerHTML = newValue;
    });
  },
  'ng-model': function($scope, $element, $attributes) {
    $scope.$watch(function() {
      return $scope[$attributes['ng-model'].value];
    }, function(newValue, oldValue) {
      $element.value = newValue;
    });

    $element.addEventListener('keyup', function() {
      $scope.$apply(function() {
        $scope[$attributes['ng-model'].value] = $element.value;
      });
    });
  }
}

var $compile = function(element, $scope) {
  Array.prototype.forEach.call(element.children, function(child) {
    $compile(child, $scope);
  });

  Array.prototype.forEach.call(element.attributes, function(attribute) {
    var directive = $$directives[attribute.name];
    console.log(element);
    console.log("directive found in attribute");
    if (directive) {
      console.log("directive called");
      directive($scope, element, element.attributes);
    }
  });
};

$compile(document.body, $scope);

// tests & logs

$scope.hello = "Hello Eytan";
