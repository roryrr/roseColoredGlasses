angular.module('fileUpload', ['ngFileUpload'])
.controller('MyCtrl',['$scope', '$http', 'Upload', '$window',function($scope, $http, Upload,$window){
    var vm = this;
    vm.submit = function(){ //function to call on form submit
        var data = {
          imgURL: vm.upload_form.file.$viewValue
        };
    $http.post("http://localhost:3000/upload", data).success(function(data, status) {
      console.log(data);
      $window.location.href = '/result.html';
    console.log('Data posted successfully');
    })
    .error(function(data, status){
      console.log("you are caught");
    });
  };
}])
.controller('dataCtrl',['$scope', '$http', function($scope, $http){
  $scope.uniqueData = "Talpa";
  $http.get('myjsonfile.json').success(function(data){
    $scope.items = data;
  });
}]);
