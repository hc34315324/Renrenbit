'use strict';

angular.module('copayApp.services')
  .factory('localIMStorageService', [function() {
        return {
            get: function localStorageServiceGet(key, defaultValue) {
                var stored = localStorage.getItem(key);
                try {
                    stored = angular.fromJson(stored);
                } catch (error) {
                    stored = null;
                }
                if (defaultValue && stored === null) {
                    stored = defaultValue;
                }
                return stored;
            },
            update: function localStorageServiceUpdate(key, value) {
                if (value) {
                    localStorage.setItem(key, angular.toJson(value));
                }
            },
            clear: function localStorageServiceClear(key) {
                localStorage.removeItem(key);
            }
        };
  }]);
