'use strict';
angular.module('copayApp.directives')
  .directive('validAddress', ['$rootScope', 'bitcore',
    function($rootScope, bitcore) {
      return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
          var URI = bitcore.URI;
          var Address = bitcore.Address
          var validator = function(value) {

            // Regular url
            if (/^https?:\/\//.test(value)) {
              ctrl.$setValidity('validAddress', true);
              return value;
            }

            // Bip21 uri
            if (/^bitcoin:/.test(value)) {
              var uri, isAddressValidLivenet, isAddressValidTestnet;
              var isUriValid = URI.isValid(value);
              if (isUriValid) {
                uri = new URI(value);
                isAddressValidLivenet = Address.isValid(uri.address.toString(), 'livenet')
                isAddressValidTestnet = Address.isValid(uri.address.toString(), 'testnet')
              }
              ctrl.$setValidity('validAddress', isUriValid && (isAddressValidLivenet || isAddressValidTestnet));
              return value;
            }

            if (typeof value == 'undefined') {
              ctrl.$pristine = true;
              return;
            }

            // Regular Address
            var regularAddressLivenet = Address.isValid(value, 'livenet');
            var regularAddressTestnet = Address.isValid(value, 'testnet');
            ctrl.$setValidity('validAddress', (regularAddressLivenet || regularAddressTestnet));
            return value;
          };


          ctrl.$parsers.unshift(validator);
          ctrl.$formatters.unshift(validator);
        }
      };
    }
  ])
  .directive('validAmount', ['configService',
    function(configService) {

      return {
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
          var val = function(value) {
            var settings = configService.getSync().wallet.settings;
            var vNum = Number((value * settings.unitToSatoshi).toFixed(0));
            if (typeof value == 'undefined' || value == 0) {
              ctrl.$pristine = true;
            }



            if (typeof vNum == "number" && vNum > 0) {
              if (vNum > Number.MAX_SAFE_INTEGER) {
                ctrl.$setValidity('validAmount', false);
              } else {
                var decimals = Number(settings.unitDecimals);
                var sep_index = ('' + value).indexOf('.');
                var str_value = ('' + value).substring(sep_index + 1);
                if (sep_index >= 0 && str_value.length > decimals) {
                  ctrl.$setValidity('validAmount', false);
                  return;
                } else {
                  ctrl.$setValidity('validAmount', true);
                }
              }
            } else {
              ctrl.$setValidity('validAmount', false);
            }
            return value;
          }
          ctrl.$parsers.unshift(val);
          ctrl.$formatters.unshift(val);
        }
      };
    }
  ])
  .directive('walletSecret', function(bitcore) {
    return {
      require: 'ngModel',
      link: function(scope, elem, attrs, ctrl) {
        var validator = function(value) {
          if (value.length > 0) {
            var m = value.match(/^[0-9A-HJ-NP-Za-km-z]{70,80}$/);
            ctrl.$setValidity('walletSecret', m ? true : false);
          }
          return value;
        };

        ctrl.$parsers.unshift(validator);
      }
    };
  })
  .directive('ngFileSelect', function() {
    return {
      link: function($scope, el) {
        el.bind('change', function(e) {
          $scope.formData.file = (e.srcElement || e.target).files[0];
          $scope.getFile();
        });
      }
    }
  })
  .directive('contact', ['addressbookService', 'lodash',
    function(addressbookService, lodash) {
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          var addr = attrs.address;
          addressbookService.get(addr, function(err, ab) {
            if (ab) {
              var name = lodash.isObject(ab) ? ab.name : ab;
              element.append(name);
            } else {
              element.append(addr);
            }
          });
        }
      };
    }
  ])
  .directive('ignoreMouseWheel', function($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('mousewheel', function(event) {
          element[0].blur();
          $timeout(function() {
            element[0].focus();
          }, 1);
        });
      }
    }
  })
  .directive('rjHoldActive', ['$ionicGesture', '$timeout', '$ionicBackdrop',
        function($ionicGesture, $timeout, $ionicBackdrop) {
            return {
                scope: false,
                restrict: 'A',
                replace: false,
                link: function(scope, iElm, iAttrs, controller) {
                    $ionicGesture.on("hold", function() {
                        iElm.addClass('active');
                        $timeout(function() {
                            iElm.removeClass('active');
                        }, 300);
                    }, iElm);
                }
            };
        }
    ])
    .directive('rjCloseBackDrop', [function() {
        return {
            scope: false,
            restrict: 'A',
            replace: false,
            link: function(scope, iElm, iAttrs, controller) {
                var htmlEl = angular.element(document.querySelector('html'));
                htmlEl.on("click", function(event) {
                    if (event.target.nodeName === "HTML" &&
                        scope.popup.optionsPopup &&
                        scope.popup.isPopup) {
                        scope.popup.optionsPopup.close();
                        scope.popup.isPopup = false;
                    }
                });
            }
        };
    }])
    .directive('resizeFootBar', ['$ionicScrollDelegate', function($ionicScrollDelegate){
        // Runs during compile
        return {
            replace: false,
            link: function(scope, iElm, iAttrs, controller) {
                scope.$on("taResize", function(e, ta) {
                    if (!ta) return;
                    var scroll = document.body.querySelector("#message-detail-content");
                    var scrollBar = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
                    var taHeight = ta[0].offsetHeight;
                    var newFooterHeight = taHeight + 10;
                    newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

                    iElm[0].style.height = newFooterHeight + 'px';
                    scroll.style.bottom = newFooterHeight + 'px';
                    scrollBar.scrollBottom();
                });
            }
        };
    }])
    .directive('rjPositionMiddle', ['$window', function($window){
        return{
            replace: false,
            link: function(scope, iElm, iAttrs, controller){
                var height = $window.innerHeight - 44 - 49 - iElm[0].offsetHeight;
                if (height >= 0) {
                    iElm[0].style.top = (height / 2 + 44) + 'px';
                }else{
                    iElm[0].style.top = 44 + 'px';
                }
            }
        }
    }]);
