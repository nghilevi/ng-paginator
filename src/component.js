var PaginationComponent = {
    bindings: {
        pages: '<totalPages',
        currentPageId: '<',
        rangeLimit:'<visibleRangeLimit',
        onClick: '&'
    },
    controller: 'NgPaginatorController',
    controllerAs: 'vm',
    templateUrl: 'template.html'
};

angular.module('ngPaginator',[])
    .component('ngPaginator', PaginationComponent);
