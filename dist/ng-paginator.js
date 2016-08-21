(function(){
    'use strict';
    
NgPaginatorController.$inject = ["keyBoardMap"];var PaginationComponent = {
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

angular.module('ngPaginator')
    .constant('keyBoardMap',{
        13:'enter',
        9:'tab'
    })
    .controller('NgPaginatorController', NgPaginatorController);

function NgPaginatorController(keyBoardMap) {
    this.keyBoardMap = keyBoardMap;
}

NgPaginatorController.prototype = {

    // CONSTANTS
    PAGES: {
        NEXT_PAGE: 'next',
        LAST_PAGE: 'last',
        PREVIOUS_PAGE: 'previous',
        FIRST_PAGE: 'first'
    },

    DIRECTIONS: {
        FORWARD: 'forward',
        BACKWARDS: 'backwards'
    },

    // EVENTS
    $onInit: init,
    $onChanges: onChange,
    onCurrentPageIdChange: onCurrentPageIdChange,
    onFocus: onFocus,

    // UTILITY FUNCTIONS
    parseInteger: parseInteger,
    getLastElementId: getLastElementId,
    getFirstElementId: getFirstElementId,
    getDirection: getDirection,
    isValidInitializedValue: isValidInitializedValue,

    // MODEL LOGICS
    populatePagesData: populatePagesData,
    createVisiblePages: createVisiblePages,
    updateVisiblePages: updateVisiblePages,
    updateCurrentSelectedPageId: updateCurrentSelectedPageId,
    checkIsTherePagesNext: checkIsTherePagesNext,
    checkIsTherePagesPrevious: checkIsTherePagesPrevious,
    checkIsTherePagesOnBothSides: checkIsTherePagesOnBothSides,

    // NAVIGATION LOGICS
    goToNextPage: goToNextPage,
    goToPreviousPage: goToPreviousPage,
    goToFirstPage: goToFirstPage,
    goToLastPage: goToLastPage,
    goToPage: goToPage
};

// EVENTS
function init() {
    var vm = this;
    if (vm.isValidInitializedValue(vm.pages)) {
        return vm.errorText = 'INVALID PAGES NUMBER';
    }

    vm.onClick = vm.onClick || angular.noop;
    vm.pages = vm.parseInteger(vm.pages, 0);
    vm.rangeLimit = vm.parseInteger(vm.rangeLimit, undefined);
    vm.currentPageId = Math.min(vm.pages, vm.parseInteger(vm.currentPageId, 1)); // current selected page id

    vm.pagesData = vm.populatePagesData(vm.pages, vm.currentPageId);
    vm.visiblePages = vm.createVisiblePages(vm.pagesData, vm.currentPageId, vm.rangeLimit);
    vm.checkIsTherePagesOnBothSides(vm.currentPageId, vm.pagesData, vm.visiblePages);
    vm.errorText = false;
}

function onChange(changes) {
    if (changes.pages && changes.pages.isFirstChange()) {
        return;
    }
    var vm = this;
    if (changes.pages || changes.rangeLimit) {
        return vm.$onInit();
    }

    if (changes.currentPageId) {
        vm.onCurrentPageIdChange(changes.currentPageId, vm.pagesData, vm.visiblePages, vm.rangeLimit);
    }
}

function onCurrentPageIdChange(_currentPageId, pagesData, visiblePages) {
    var vm = this;
    var currentPageId = Math.min(pagesData.length, vm.parseInteger(_currentPageId.currentValue, 1)),
        previousPageId = Math.min(pagesData.length, vm.parseInteger(_currentPageId.previousValue, 1)),
        lastVisiblePageId = vm.getLastElementId(visiblePages),
        firstVisiblePageId = vm.getFirstElementId(visiblePages);

    if (currentPageId > (lastVisiblePageId + 1) || currentPageId < (firstVisiblePageId - 1)) { // if currentPageId is more than 1 page out of visiblePages scope
        return vm.$onInit();
    }

    if (previousPageId > 0) {
        vm.currentPageId = updateCurrentSelectedPageId(pagesData, currentPageId, previousPageId);
        var direction = vm.getDirection(null, currentPageId, previousPageId);
        vm.visiblePages = vm.updateVisiblePages(visiblePages, pagesData, visiblePages.length, vm.currentPageId, direction);
        vm.checkIsTherePagesOnBothSides(currentPageId, pagesData, visiblePages);
    }
}

function onFocus(evt) {
    var vm = this;
    var pageToGo;
    var navigableClassNames = ['previous', 'first', 'last', 'next', 'nd-pagination-page__id', 'nd-pagination-page'];
    var i = 0;

    while (i < navigableClassNames.length) {
        var shortClassName = navigableClassNames[i];
        var fullClassName = shortClassName.slice(0, 2) !== 'nd' ? 'nd-pagination-button--' + navigableClassNames[i] : shortClassName;
        if (evt.target.classList.contains(fullClassName)) {
            pageToGo = shortClassName;
            break;
        }
        i++;
    }

    var key = vm.keyBoardMap[evt.keyCode];

    switch (key) {
        case 'enter':
            if (navigableClassNames.slice(0, 5).indexOf(pageToGo) > -1) {
                vm.goToPage(pageToGo);
            } else if (navigableClassNames.slice(-2).indexOf(pageToGo) > -1) {
                vm.goToPage(evt.target.outerText);
            }
            break;
        case 'tab':
            if (navigableClassNames.slice(-2).indexOf(pageToGo) > -1) {
                vm.goToNextPage();
            }
            break;
    }
}

// UTILITY FUNCTIONS
function parseInteger(value, defaultValue) {
    var parsedValue = parseInt(value);
    return !!parsedValue ? Math.abs(parsedValue) : defaultValue;
}

function getLastElementId(dataArray) {
    if (dataArray && dataArray.length > 0) {
        return dataArray[dataArray.length - 1].id;
    }
}

function getFirstElementId(dataArray) {
    if (dataArray && dataArray.length > 0) {
        return dataArray[0].id;
    }
}

function isValidInitializedValue(value) {
    return !parseInt(value) || parseInt(value) < 0;
}

function getDirection(pageToGo, currentPage, previousPage) {
    var PAGES = this.PAGES;
    var DIRECTIONS = this.DIRECTIONS;
    var direction;
    if (pageToGo === PAGES.NEXT_PAGE || pageToGo === PAGES.LAST_PAGE || currentPage > previousPage) {
        direction = DIRECTIONS.FORWARD;
    } else if (pageToGo === PAGES.PREVIOUS_PAGE || pageToGo === PAGES.FIRST_PAGE || currentPage < previousPage) {
        direction = DIRECTIONS.BACKWARDS;
    }
    return direction;
}

// MODEL LOGICS
function createVisiblePages(pagesData, fromPageId, rangeLimit) {
    if (rangeLimit === undefined || rangeLimit >= pagesData.length) { // rangeLimit is undefined or LARGER than totalPages
        return pagesData;
    }
    if (fromPageId === pagesData[pagesData.length - 1].id || rangeLimit > pagesData.length - fromPageId + 1) { // fromPageId is last page OR rangeLimit is LARGER than left pages
        return pagesData.slice(-rangeLimit);
    }
    return pagesData.slice(fromPageId - 1, fromPageId + rangeLimit - 1); // minus 1 to convert to array index
}

function populatePagesData(pages, currentPageId) {
    var populatedPages = [];
    if (pages !== 0) {
        for (var i = 1; i <= pages; i++) {
            populatedPages.push({
                id: i,
                isSelected: currentPageId ? i === currentPageId : i === 1
            });
        }
    }
    return populatedPages;
}

function updateVisiblePages(visiblePages, pagesData, rangeLimit, currentPageId, direction) {
    var vm = this;
    var fromPageId;
    if (visiblePages && visiblePages.length && rangeLimit) {
        if (direction === vm.DIRECTIONS.FORWARD && currentPageId > vm.getLastElementId(visiblePages)) { // If the direction is forward and currentPageId id exceeds the last visible page id then update visiblePages
            fromPageId = currentPageId - rangeLimit + 1;
        } else if (direction === vm.DIRECTIONS.BACKWARDS && currentPageId < vm.getFirstElementId(visiblePages)) { // If the direction is backwards and currentPageId id is smaller than first visible page id
            fromPageId = currentPageId;
        }
    }
    return fromPageId ? vm.createVisiblePages(pagesData, fromPageId, rangeLimit) : visiblePages;
}

function updateCurrentSelectedPageId(pagesData, currentPageId, previousPageId) {
    if (previousPageId > 0 && currentPageId > 0) {
        pagesData[previousPageId - 1].isSelected = false;
        pagesData[currentPageId - 1].isSelected = true;
        return currentPageId;
    }
}

function checkIsTherePagesNext(currentPageId, lastPageId, lastVisiblePageId) {
    return (currentPageId !== lastPageId) && (lastVisiblePageId !== lastPageId); // current page is NOT the last page && last visible page is NOT the last page
}

function checkIsTherePagesPrevious(currentPageId, firstVisiblePageId) {
    return (currentPageId !== 1) && (firstVisiblePageId !== 1); // current page is NOT 1 && last visible page is NOT 1
}

function checkIsTherePagesOnBothSides(currentPageId, pagesData, visiblePages) {
    var vm = this;
    if (pagesData && pagesData.length > 0 && visiblePages && visiblePages.length > 0) {
        var lastPageId = pagesData[pagesData.length - 1].id;
        var lastVisiblePageId = getLastElementId(visiblePages);
        var firstVisiblePageId = getFirstElementId(visiblePages);
        vm.isTherePagesNext = vm.checkIsTherePagesNext(currentPageId, lastPageId, lastVisiblePageId);
        vm.isTherePagesPrevious = vm.checkIsTherePagesPrevious(currentPageId, firstVisiblePageId);
    }
}

// NAVIGATION LOGICS
function goToNextPage() {
    var vm = this;
    vm.goToPage(vm.PAGES.NEXT_PAGE);
}

function goToLastPage() {
    var vm = this;
    vm.goToPage(vm.PAGES.LAST_PAGE);
}

function goToPreviousPage() {
    var vm = this;
    vm.goToPage(vm.PAGES.PREVIOUS_PAGE);
}

function goToFirstPage() {
    var vm = this;
    vm.goToPage(vm.PAGES.FIRST_PAGE);
}

function goToPage(pageToGo) {
    var vm = this;
    var PAGES = vm.PAGES;

    if (vm.pagesData === undefined || vm.pagesData && vm.pagesData.length === 0) {
        return;
    }

    var isAbleToGo, goToPageId;

    switch (pageToGo) {
        case PAGES.NEXT_PAGE:
            isAbleToGo = vm.currentPageId < vm.pagesData.length;
            goToPageId = vm.currentPageId + 1;
            break;
        case PAGES.LAST_PAGE:
            isAbleToGo = vm.currentPageId < vm.pagesData.length;
            goToPageId = vm.pagesData.length;
            break;
        case PAGES.PREVIOUS_PAGE:
            isAbleToGo = vm.currentPageId > 1;
            goToPageId = vm.currentPageId - 1;
            break;
        case PAGES.FIRST_PAGE:
            isAbleToGo = vm.currentPageId > 1;
            goToPageId = 1;
            break;
        default: // go to a specific page by page index
            isAbleToGo = vm.currentPageId >= 1 && vm.currentPageId <= vm.pagesData.length;
            goToPageId = pageToGo;
            break;
    }

    if (isAbleToGo) {
        vm.currentPageId = vm.updateCurrentSelectedPageId(vm.pagesData, goToPageId, vm.currentPageId);
        var direction = isNaN(parseInt(pageToGo)) ? vm.getDirection(pageToGo) : vm.getDirection(null, pageToGo, vm.currentPageId);
        vm.visiblePages = vm.updateVisiblePages(vm.visiblePages, vm.pagesData, vm.rangeLimit, vm.currentPageId, direction);
        vm.checkIsTherePagesOnBothSides(vm.currentPageId, vm.pagesData, vm.visiblePages);
        vm.onClick({data: {page: vm.currentPageId, event: pageToGo}});
    }
}
'use strict';

angular.module('ngPaginator').run(['$templateCache', function($templateCache) {

  $templateCache.put('template.html', '<div layout=row class=ng-pagination ng-keydown=vm.onFocus($event) ng-click=vm.onFocus($event) unselectable=on><span tabindex=0 class="ng-pagination-button ng-pagination-button--previous" aria-label=Previous ng-click=vm.goToPreviousPage() ng-class="{\'ng-pagination-button--disabled\': vm.currentPageId === 1}">&lt;</span> <span tabindex=0 class="ng-pagination-button ng-pagination-button--first" aria-label=First ng-click=vm.goToFirstPage() ng-if=vm.isTherePagesPrevious>first</span> <span class="ng-pagination-button ng-pagination-button--more" aria-label=MorePrevious ng-if=vm.isTherePagesPrevious>...</span> <span tabindex=0 class="ng-pagination-button ng-pagination-page" aria-label="Go to page {{page.id}}" ng-repeat="page in vm.visiblePages" ng-click=vm.goToPage(page.id) ng-class="{\'ng-pagination-button--selected\': page.isSelected}"><span class=ng-pagination-page__id>{{page.id}}</span></span> <span class=ng-pagination-error-text ng-if=vm.errorText>{{vm.errorText}}</span> <span class="ng-pagination-button ng-pagination-button--more" aria-label=MoreNext ng-if=vm.isTherePagesNext>...</span> <span tabindex=0 class="ng-pagination-button ng-pagination-button--last" aria-label=Last ng-if=vm.isTherePagesNext ng-click=vm.goToLastPage()>last</span> <span tabindex=0 class="ng-pagination-button ng-pagination-button--next" aria-label=Next ng-click=vm.goToNextPage() ng-class="{\'ng-pagination-button--disabled\': vm.currentPageId === vm.pagesData.length}">&gt;</span></div>');

}]);
})();
