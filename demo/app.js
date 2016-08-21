'use strict';

angular.module('demo',['ngPaginator'])
    .controller('demoCtrl', demoCtrl);

function demoCtrl($scope) {

    var vm = this;

    vm.onPageClick = onPageClick;
    vm.paginationId = 0;
    vm.increaseCurrentPage = increaseCurrentPage;
    vm.decreaseCurrentPage = decreaseCurrentPage;

    vm.paginationData = [
        {
            totalPages: 15,
            currentPageId: 5,
            visibleRangeLimit: 4
        },
        {
            totalPages: 7,
            currentPageId: 8,
            visibleRangeLimit: 17
        },
        {
            totalPages: 7,
            currentPageId: 5,
            visibleRangeLimit: 3
        },
        {
            totalPages: 7,
            currentPageId: 6,
            visibleRangeLimit: 3
        }
    ];

    function increaseCurrentPage() {
        if(vm.currentPageId < vm.paginationData[vm.paginationId].totalPages){
            vm.currentPageId++;
        }
    }

    function decreaseCurrentPage(){
        if(vm.currentPageId > 1){
            vm.currentPageId--;
        }
    }

    function onPageClick(data) {
        vm.currentPageId = data.page;
    }

    $scope.$watch(function () {
        return vm.paginationId;
    }, function (paginationId) {
        angular.extend(vm, vm.paginationData[paginationId]);
    });


}