'use strict';

angular.module('copayApp.controllers').controller('tabReceiveController', function($rootScope, $scope, $timeout, $log, $ionicModal, $state, $ionicHistory, $ionicPopover, pushNotificationsService, addressbookService, storageService, platformInfo, walletService, profileService, configService, lodash, gettextCatalog, popupService, bwcError) {

  var listeners = [];
  $scope.isCordova = platformInfo.isCordova;
  $scope.isNW = platformInfo.isNW;

  $scope.requestSpecificAmount = function() {
    $state.go('tabs.paymentRequest.amount', {
      id: $scope.wallet.credentials.walletId
    });
  };

  $scope.setAddress = function(newAddr) {
    $scope.addr = null;
    if (!$scope.wallet || $scope.generatingAddress || !$scope.wallet.isComplete()) return;
    $scope.generatingAddress = true;
    walletService.getAddress($scope.wallet, newAddr, function(err, addr) {
      $scope.generatingAddress = false;

      if (err) {
        //Error is already formated
        popupService.showAlert(err);
      }

      $scope.addr = addr;
      $timeout(function() {
        $scope.$apply();
      }, 10);
    });
  };

  $scope.goCopayers = function() {
    $ionicHistory.removeBackView();
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $state.go('tabs.home');
    $timeout(function() {
      $state.transitionTo('tabs.copayers', {
        walletId: $scope.wallet.credentials.walletId
      });
    }, 100);
  };

  $scope.openBackupNeededModal = function() {
    $ionicModal.fromTemplateUrl('views/includes/backupNeededPopup.html', {
      scope: $scope,
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.BackupNeededModal = modal;
      $scope.BackupNeededModal.show();
    });
  };

  $scope.close = function() {
    $scope.BackupNeededModal.hide();
    $scope.BackupNeededModal.remove();
  };

  $scope.doBackup = function() {
    $scope.close();
    $scope.goToBackupFlow();
  };

  $scope.goToBackupFlow = function() {
    $state.go('tabs.receive.backupWarning', {
      from: 'tabs.receive',
      walletId: $scope.wallet.credentials.walletId
    });
  };

  $scope.shouldShowReceiveAddressFromHardware = function() {
    var wallet = $scope.wallet;
    if (wallet.isPrivKeyExternal() && wallet.credentials.hwInfo) {
      return (wallet.credentials.hwInfo.name == walletService.externalSource.intelTEE.id);
    } else {
      return false;
    }
  };

  $scope.showReceiveAddressFromHardware = function() {
    var wallet = $scope.wallet;
    if (wallet.isPrivKeyExternal() && wallet.credentials.hwInfo) {
      walletService.showReceiveAddressFromHardware(wallet, $scope.addr, function() {});
    }
  };

  // $scope.$on("$ionicView.beforeEnter", function(event, data) {
  //   $scope.wallets = profileService.getWallets();
  //   $scope.singleWallet = $scope.wallets.length == 1;

  //   if (!$scope.wallets[0]) return;

  //   // select first wallet if no wallet selected previously
  //   var selectedWallet = checkSelectedWallet($scope.wallet, $scope.wallets);
  //   $scope.onWalletSelect(selectedWallet);

  //   $scope.showShareButton = platformInfo.isCordova ? (platformInfo.isIOS ? 'iOS' : 'Android') : null;

  //   listeners = [
  //     $rootScope.$on('bwsEvent', function(e, walletId, type, n) {
  //       // Update current address
  //       if ($scope.wallet && walletId == $scope.wallet.id && type == 'NewIncomingTx') $scope.setAddress(true);
  //     })
  //   ];
  // });


  $scope.$on("$ionicView.enter", function(event, data) {
      updateAllWallets();

      addressbookService.list(function(err, ab) {
        if (err) $log.error(err);
        $scope.addressbook = ab || {};
      });

      listeners = [
        $rootScope.$on('bwsEvent', function(e, walletId, type, n) {
          var wallet = profileService.getWallet(walletId);
          updateWallet(wallet);
          if ($scope.recentTransactionsEnabled) getNotifications();

        }),
        $rootScope.$on('Local/TxAction', function(e, walletId) {
          $log.debug('Got action for wallet ' + walletId);
          var wallet = profileService.getWallet(walletId);
          updateWallet(wallet);
          if ($scope.recentTransactionsEnabled) getNotifications();
        })
      ];


      // $scope.buyAndSellItems = buyAndSellService.getLinked();
      // $scope.homeIntegrations = homeIntegrationsService.get();

      // bitpayCardService.get({}, function(err, cards) {
      //   $scope.bitpayCardItems = cards;
      // });

      configService.whenAvailable(function(config) {
        $scope.recentTransactionsEnabled = config.recentTransactions.enabled;
        if ($scope.recentTransactionsEnabled) getNotifications();

        // if (config.hideNextSteps.enabled) {
        //   $scope.nextStepsItems = null;
        // } else {
        //   $scope.nextStepsItems = nextStepsService.get();
        // }

        pushNotificationsService.init();

        // $timeout(function() {
        //   $ionicScrollDelegate.resize();
        //   $scope.$apply();
        // }, 10);
      });
  });

  $scope.$on("$ionicView.leave", function(event, data) {
    lodash.each(listeners, function(x) {
      x();
    });
  });

  var updateWallet = function(wallet) {
    $log.debug('Updating wallet:' + wallet.name)
    walletService.getStatus(wallet, {}, function(err, status) {
      if (err) {
        $log.error(err);
        return;
      }
      wallet.status = status;
      // updateTxps();
    });
  };

  var getNotifications = function() {
    profileService.getNotifications({
      limit: 3
    }, function(err, notifications, total) {
      if (err) {
        $log.error(err);
        return;
      }
      $scope.notifications = notifications;
      $scope.notificationsN = total;
      // $timeout(function() {
      //   $ionicScrollDelegate.resize();
      //   $scope.$apply();
      // }, 10);
    });
  };

  var updateAllWallets = function() {
      //获取钱包信息
      $scope.wallets = profileService.getWallets();
      
      if (lodash.isEmpty($scope.wallets)) return;

      var i = $scope.wallets.length;
      var j = 0;
      var timeSpan = 60 * 60 * 24 * 7;

      lodash.each($scope.wallets, function(wallet) {
        walletService.getStatus(wallet, {}, function(err, status) {
          if (err) {

            wallet.error = (err === 'WALLET_NOT_REGISTERED') ? gettextCatalog.getString('Wallet not registered') : bwcError.msg(err);

            $log.error(err);
          } else {
            wallet.error = null;
            wallet.status = status;

            // TODO service refactor? not in profile service
            profileService.setLastKnownBalance(wallet.id, wallet.status.totalBalanceStr, function() {});
          }
          if (++j == i) {
            // updateTxps();
            $scope.wallets = profileService.getWallets();
            $scope.singleWallet = $scope.wallets.length == 1;

            if (!$scope.wallets[0]) return;

            // select first wallet if no wallet selected previously
            var selectedWallet = checkSelectedWallet($scope.wallet, $scope.wallets);
            $scope.onWalletSelect(selectedWallet);

            $scope.showShareButton = platformInfo.isCordova ? (platformInfo.isIOS ? 'iOS' : 'Android') : null;

            listeners = [
              $rootScope.$on('bwsEvent', function(e, walletId, type, n) {
                // Update current address
                if ($scope.wallet && walletId == $scope.wallet.id && type == 'NewIncomingTx') $scope.setAddress(true);
              })
            ];
          }
        });
      });
  };

  var checkSelectedWallet = function(wallet, wallets) {
    if (!wallet) return wallets[0];
    var w = lodash.find(wallets, function(w) {
      return w.id == wallet.id;
    });
    if (!w) return wallets[0];
    return wallet;
  }

  $scope.openWallet = function(wallet) {
    if (!wallet.isComplete()) {
      return $state.go('tabs.copayers-receive', {
        walletId: wallet.credentials.walletId
      });
    }

    $state.go('tabs.wallet-receive', {
      walletId: wallet.credentials.walletId
    });
  };

  $scope.onWalletSelect = function(wallet) {
    $scope.wallet = wallet;
    $scope.setAddress();
  };

  $scope.showWalletSelector = function() {
    if ($scope.singleWallet) return;
    $scope.walletSelectorTitle = gettextCatalog.getString('Select a wallet');
    $scope.showWallets = true;
  };

  $scope.shareAddress = function() {
    if (!$scope.isCordova) return;
    window.plugins.socialsharing.share('bitcoin:' + $scope.addr, null, null, null);
  }
});
