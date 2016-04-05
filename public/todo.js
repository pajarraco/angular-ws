angular.module('todoApp', [])
    .factory('MyService', ['$q', '$rootScope', '$sce', function($q, $rootScope, $sce) {

        // We return this object to anything injecting our service
        var Service = {};
        // callback function 
        var _callback = function() { };
        var _ws;

        function openConn() {
            var defer = $q.defer();
            _ws = new WebSocket("ws://localhost:4080/");
            _ws.onopen = function() {
                console.log("Socket has been opened!");
                defer.resolve();
            };
            return defer.promise;
        }

        function onMessage() {
            _ws.onmessage = function(message) {
                // console.log('onMessage', message);
                listener(message.data);
            };
        }

        function sendRequest(request) {
            console.log('Sending request', request);
            _ws.send(JSON.stringify(request));
        }

        function listener(data) {
            console.log('data', data);
            var messageObj = data;
            console.log("Received data from websocket: ", messageObj);
            // var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                
            // var blob = new Blob([messageObj], { type: 'image/jpg' });
            // var fileURL = URL.createObjectURL(file);
            // var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
            // url = urlCreator.createObjectURL(blob);
            // window.location = url;

            if (messageObj.text) {
                _callback(messageObj);
            }
        }
        // Define a "getter" for getting customer data
        Service.getCustomers = function(callback) {
            var _ws = openConn().then(function() {
                onMessage();
                _callback = callback;
                var request = {
                    type: "get_customers"
                }
                // Storing in a variable for clarity on what sendRequest returns
                sendRequest(request);
            });
        }
        return Service;
    }])
    .controller('TodoListController', ['$scope', '$sce', 'MyService', function($scope, $sce, MyService) {
        var todoList = $scope.todoList = this;
        todoList.todos = [
            { text: 'learn angular', done: true },
            { text: 'build an angular app', done: false }];

        todoList.addTodo = function() {
            MyService.getCustomers(function(data) {
                console.log('getCustomers', data);

                $scope.content = data;
                todoList.todos.push({ text: data.text, done: false });
                todoList.todoText = '';
                $scope.$apply(function() {
                    console.log('applya');
                });
            });
        };

        todoList.remaining = function() {
            var count = 0;
            angular.forEach(todoList.todos, function(todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };

        todoList.archive = function() {
            var oldTodos = todoList.todos;
            todoList.todos = [];
            angular.forEach(oldTodos, function(todo) {
                if (!todo.done) todoList.todos.push(todo);
            });
        };
    }])
    ;