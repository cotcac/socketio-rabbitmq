var app = angular.module('myApp', []);
//AngularJS controllers control applications:
app.controller('myCtrl', function ($scope, $http) {
    let sessionID ="";

    $scope.firstName = "John";
    $scope.submit = function () {
        console.log('[X] HTTP request submit');
        $http.post('/users',{name:$scope.firstName,session:sessionID}).then(function(res){
            console.log("[x] HTTP response right away:", res.data);
        })
    };


    var socket = io.connect('http://' + window.location.hostname + ':3000');
    socket.on("connect", function () {
        sessionID = socket.id;
        //get message
        socket.on(sessionID + '_new message', function (data) {
            console.log('[X] SocketIO response when process done:' + data);
        });

    })

});