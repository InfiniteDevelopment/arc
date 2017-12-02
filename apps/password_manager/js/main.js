var app = angular.module('PM', [], function($interpolateProvider) {

});

app.filter('timeago', function() {
    return function(date) {
       return $.timeago(date);
    }
});

app.controller('PMController', ['$scope', function (scope) {
    scope.statusMessage = null;
    scope.errorMessage = null;
    scope.vault = new Vault();
    scope.key = null;
    scope.secret = null;

    scope.setError = function(message) {
        if( message ) 
            console.log("error = " + message);
        scope.setStatus(null);
        scope.errorMessage = message;
    };

    scope.setStatus = function(message) {
        if( message ) 
            console.log("status = " + message);
        scope.statusMessage = message;
    };

    scope.setSecret = function(secret) {
        if( secret )
            console.log(secret);
        scope.secret = secret;
    }

    scope.getStore = function(success) {
        scope.setStatus("Loading passwords store ...");

        scope.vault.SetStore( "passwords", function() {
            scope.setError(null);
            scope.$apply();
        },
        function(error){
            scope.setError(error);
            scope.$apply();
        });
    }

    scope.setKey = function(key) {
        key = $.trim(key)
        if( key == "" ) {
            scope.setError("Empty encryption key.");
            scope.$apply();
            return false;
        }

        scope.key = key;
        return true;
    }

    scope.doLogin = function() {
        scope.setStatus("Logging in ...");

        var username = $('#username').val();
        var password = $('#password').val();

        if( scope.setKey( $('#key').val() ) == true ) { 
            scope.vault.Login( username, password, function(token) {
                scope.setError(null);
                scope.$apply();
                scope.getStore( function() {
                    scope.$apply();
                });
            },
            function(error){
                scope.setError(error);
                scope.$apply();
            });
        }
    }

    scope.doAdd = function() {
        scope.setStatus("Adding password ...");

        var title = $('#pass_title').val();
        var data = $('#pass_data').val();

        console.log( "Encrypting " + data.length + " bytes of password. key = " + scope.key );
        data = CryptoJS.AES.encrypt( data, scope.key ).toString(); 
        console.log( "Encrypted data is " + data.length + " bytes." );
        
        scope.vault.AddRecord( title, data, 'aes', function(record) {
            scope.setError(null);
            scope.$apply();

            scope.getStore( function() {
                scope.$apply();
            });
        },
        function(error){
            scope.setError(error);
            scope.$apply();
        });
    }

    scope.filterSecret = function(record) {
        return true;
    }

    scope.deleteSecret = function() {
        // this shouldn't happen, but better be safe than sorry :)
        if( scope.secret == null ){
            return;
        }

        if( confirm( "Delete this secret?" ) == true ) {
            scope.vault.DeleteRecord(scope.secret, function(){ 
                scope.setSecret(null)
                $('#secret_modal').modal('hide');
                scope.getStore( function() {
                    scope.$apply();
                });
            },
            function(err){
                scope.setError(error);
                scope.$apply();
            });
        }
    }

    scope.saveSecret = function() {
        // this shouldn't happen, but better be safe than sorry :)
        if( scope.secret == null ){
            return;
        }

        alert("TODO");
        
        scope.setSecret(null)
        $('#secret_modal').modal('hide');

    }

    scope.showSecret = function(record) {
        scope.setSecret(record)

        console.log( "Decrypting " + record.Data.length + " bytes of record. key = " + scope.key );
        data = CryptoJS.AES.decrypt( record.Data, scope.key ) 
        console.log(data);
        data = data.toString(CryptoJS.enc.Utf8);
        console.log( "Decrypted data is " + data.length + " bytes." );
        $('#modal_title').html(record.Title);
        $('#modal_body').html("data = " + data);

        $('#secret_modal').modal();
    }
}]);