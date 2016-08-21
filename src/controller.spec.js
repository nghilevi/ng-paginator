'use strict';

describe('NgPaginatorController', function () {

    var ctrl;
    var $componentController, $scope;

    beforeEach(module('ngPaginator'));

    function createController(bindings) {
        var controller = $componentController('ngPaginator', null, bindings);
        $scope.$apply();
        return controller;
    }

    function mockPage(id, isSelected) {
        return {id: id, isSelected: !!isSelected};
    }

    function createMockPages(noOfMockedPage) {
        var mockedPages = [];
        for (var i = 1; i <= noOfMockedPage; i++) {
            mockedPages.push(mockPage(i));
        }
        return mockedPages;
    }

    function createMockPagesFromId(startingId, endingId) {
        var mockedPages = [];
        for (var i = startingId; i <= endingId; i++) {
            mockedPages.push(mockPage(i));
        }
        return mockedPages;
    }

    function l(data) {
        console.log(data);
    }

    beforeEach(inject(function (_$componentController_, _$rootScope_) {
        $componentController = _$componentController_;
        $scope = _$rootScope_.$new();
    }));

    it('should be defined', function () {
        ctrl = createController();
        expect(ctrl).toBeDefined();
    });

    // EVENTS
    describe('init', function () {

        it('should show error text if initalized values are invalid', function () {
            ctrl = createController();
            spyOn(ctrl, 'checkIsTherePagesOnBothSides');
            ctrl.$onInit();
            expect(ctrl.errorText).toEqual('INVALID PAGES NUMBER');
        });

        it('should init variables based on data passed in to controller', function () {
            var controllerParam = {
                onClick: function () {
                },
                pages: 5,
                rangeLimit: 6,
                currentPageId: 7
            };

            ctrl = createController(controllerParam);
            spyOn(ctrl, 'checkIsTherePagesOnBothSides');

            ctrl.$onInit();
            expect(ctrl.onClick).toEqual(controllerParam.onClick);
            expect(ctrl.pages).toBe(5);
            expect(ctrl.rangeLimit).toBe(6);
            expect(ctrl.currentPageId).toBe(5); // Not 7 because we have only 5 pages here
            expect(ctrl.pagesData.length).toBe(5);
            expect(ctrl.visiblePages.length).toBe(5);
            expect(ctrl.checkIsTherePagesOnBothSides).toHaveBeenCalledWith(ctrl.currentPageId, ctrl.pagesData, ctrl.visiblePages);
        });
    });

    describe('onChange', function () {

        beforeEach(function () {
            ctrl = createController({pages: 3, currentPageId: 1});
            ctrl.$onInit();
            spyOn(ctrl, '$onInit');
            spyOn(ctrl, 'onCurrentPageIdChange');
        });

        it('should call init when either pages or rangeLimit get updated', function () {
            ctrl.pages = {
                value: 4,
                isFirstChange: function () { return false; }
            };

            ctrl.$onChanges(ctrl);

            ctrl.rangeLimit = 3;
            ctrl.rangeLimit = {
                value: 3,
                isFirstChange: function () { return false; }
            };
            ctrl.$onChanges(ctrl);

            expect(ctrl.$onInit.calls.count()).toEqual(2);
            expect(ctrl.currentPageId).toBe(1);
        });

        it('should call onCurrentPageIdChange when currentPageId get updated', function () {
            var changes = {
                currentPageId: 4
            };
            ctrl.$onChanges(changes);

            expect(ctrl.onCurrentPageIdChange).toHaveBeenCalled();
        });

    });

    describe('onCurrentPageIdChange', function () {

        beforeEach(function () {
            ctrl = createController({pages: 10, currentPageId: 1, rangeLimit: 3});
            ctrl.pagesData = createMockPages(10);
            ctrl.visiblePages = createMockPages(3);
            ctrl.$onInit();
            spyOn(ctrl, '$onInit').and.callThrough();
        });

        it('should call init when currentPageId is out of visiblePages scope more than 1 page', function () {
            var changes = {
                currentPageId: {
                    currentValue: 5,
                    previousValue: 1
                }
            };

            ctrl.onCurrentPageIdChange(changes.currentPageId, ctrl.pagesData, ctrl.visiblePages);

            expect(ctrl.$onInit).toHaveBeenCalled();
        });

        it('should udpate currentPageId and visiblePages correspondingly', function () {

            expect(ctrl.currentPageId).toBe(1);
            expect(ctrl.rangeLimit).toBe(3);

            var changes = {
                currentPageId: {
                    currentValue: 3,
                    previousValue: 1
                }
            };

            ctrl.onCurrentPageIdChange(changes.currentPageId, ctrl.pagesData, ctrl.visiblePages);

            expect(ctrl.currentPageId).toBe(3);
            expect(ctrl.visiblePages[0].isSelected).toBe(false);
            expect(ctrl.visiblePages[1].isSelected).toBe(false);
            expect(ctrl.visiblePages[2].isSelected).toBe(true);
        });
    });

    // UTILITY FUNCTIONS
    describe('parseInteger', function () {
        it('should parse value to positive integer if possible otherwise set default value', function () {
            ctrl = createController();

            expect(ctrl.parseInteger(20)).toBe(20);
            expect(ctrl.parseInteger('20')).toBe(20);
            expect(ctrl.parseInteger(20.5)).toBe(20);
            expect(ctrl.parseInteger('20.5')).toBe(20);
            expect(ctrl.parseInteger(20.9)).toBe(20);
            expect(ctrl.parseInteger(-20)).toBe(20);

            var defaultValue = 0;
            expect(ctrl.parseInteger(null, defaultValue)).toBe(0);
            expect(ctrl.parseInteger(undefined, defaultValue)).toBe(0);
            expect(ctrl.parseInteger('nghi', defaultValue)).toBe(0);
        });
    });

    describe('getLastElementId', function () {
        it('should get id of last element from the given array', function () {
            var sampleArray = createMockPages(10);
            ctrl = createController();
            expect(ctrl.getLastElementId(sampleArray)).toBe(10);
            expect(ctrl.getLastElementId([])).toBe(undefined);
            expect(ctrl.getLastElementId(undefined)).toBe(undefined);
        });
    });

    describe('getFirstElementId', function () {
        it('should get id of first element from the given array', function () {
            var sampleArray = createMockPages(10);
            ctrl = createController();
            expect(ctrl.getFirstElementId(sampleArray)).toBe(1);
            expect(ctrl.getFirstElementId([])).toBe(undefined);
            expect(ctrl.getFirstElementId(undefined)).toBe(undefined);
        });
    });

    describe('getDirection', function () {
        it('should return the right direction based on the go-to page', function () {
            ctrl = createController();
            expect(ctrl.getDirection(ctrl.PAGES.NEXT_PAGE)).toBe(ctrl.DIRECTIONS.FORWARD);
            expect(ctrl.getDirection(ctrl.PAGES.LAST_PAGE)).toBe(ctrl.DIRECTIONS.FORWARD);
            expect(ctrl.getDirection(null, 2, 1)).toBe(ctrl.DIRECTIONS.FORWARD);

            expect(ctrl.getDirection(ctrl.PAGES.PREVIOUS_PAGE)).toBe(ctrl.DIRECTIONS.BACKWARDS);
            expect(ctrl.getDirection(ctrl.PAGES.FIRST_PAGE)).toBe(ctrl.DIRECTIONS.BACKWARDS);
            expect(ctrl.getDirection(null, 1, 2)).toBe(ctrl.DIRECTIONS.BACKWARDS);
        });
    });

    describe('isValidInitializedValues', function () {
        var result;
        var pages;

        beforeEach(function () {
            ctrl = createController();
        });

        it('should return TRUE when intialized values are nonsense and FALSE otherwise', function () {
            pages = undefined;
            result = ctrl.isValidInitializedValue(pages);
            expect(result).toBe(true);

            pages = 0;
            result = ctrl.isValidInitializedValue(pages);
            expect(result).toBe(true);

            pages = null;
            result = ctrl.isValidInitializedValue(pages);
            expect(result).toBe(true);

            pages = 'nghi';
            result = ctrl.isValidInitializedValue(pages);
            expect(result).toBe(true);

            pages = -5;
            result = ctrl.isValidInitializedValue(pages);
            expect(result).toBe(true);

            pages = '';
            result = ctrl.isValidInitializedValue(pages);
            expect(result).toBe(true);

            pages = 5;
            result = ctrl.isValidInitializedValue(pages);
            expect(result).toBe(false);
        });
    });

    // MODEL LOGICS
    describe('populatePagesData', function () {

        beforeEach(function () {
            ctrl = createController();
        });

        it('should populate an array of pages data', function () {
            var totalPages = 0;
            var pagesData = ctrl.populatePagesData(totalPages);
            expect(Array.isArray(pagesData)).toBe(true);
            expect(pagesData.length).toBe(0);

            totalPages = 1;
            pagesData = ctrl.populatePagesData(totalPages);
            expect(pagesData.length).toBe(1);
            expect(pagesData[0].id).toBe(1);
            expect(pagesData[0].isSelected).toBeDefined();

            totalPages = 2;
            pagesData = ctrl.populatePagesData(totalPages);
            expect(pagesData.length).toBe(2);
            expect(pagesData[1].id).toBe(2);
            expect(pagesData[1].isSelected).toBeDefined();
        });

        it('should mark a page based on currentPageId', function () {
            var totalPages = 2,
                currentPageId = undefined;
            var pagesData = ctrl.populatePagesData(totalPages, currentPageId);

            expect(pagesData.length).toBe(2);
            expect(pagesData[0].isSelected).toBe(true);

            currentPageId = 2;
            pagesData = ctrl.populatePagesData(totalPages, currentPageId);
            expect(pagesData.length).toBe(2);
            expect(pagesData[0].isSelected).toBe(false);
            expect(pagesData[1].isSelected).toBe(true);
        });
    });

    describe('createVisiblePages', function () {
        var pagesData, rangeLimit, fromPageId;
        var visiblePages;

        beforeEach(function () {
            ctrl = createController();
            pagesData = createMockPages(5);  // totalPages is 5
        });

        describe('should create visible pages', function () {
            it('on normal cases', function () {
                fromPageId = 2;
                rangeLimit = 3;

                visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                expect(visiblePages.length).toBe(rangeLimit);
                expect(visiblePages[0].id).toBe(2);
                expect(visiblePages[1].id).toBe(3);
                expect(visiblePages[2].id).toBe(4);
            });

            it('when rangeLimit is LARGER than totalPages', function () {
                fromPageId = 2;
                rangeLimit = 30;

                visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                expect(visiblePages.length).toBe(pagesData.length);
                expect(visiblePages).toEqual(pagesData);
            });

            it('when fromPageId is EQUAL last page index', function () {
                fromPageId = 5;
                rangeLimit = 3;

                visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                expect(visiblePages.length).toBe(rangeLimit);
                expect(visiblePages[0].id).toBe(3);
                expect(visiblePages[1].id).toBe(4);
                expect(visiblePages[2].id).toBe(5);
            });

            describe('when fromPageId + rangeLimit is EQUAL or LARGER than totalPages', function () {
                it('fromPageId + rangeLimit = totalPages', function () {
                    fromPageId = 2;
                    rangeLimit = 3;
                    visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                    expect(visiblePages.length).toBe(rangeLimit);
                    expect(visiblePages[0].id).toBe(2); // same as fromPageId
                    expect(visiblePages[1].id).toBe(3);
                    expect(visiblePages[2].id).toBe(4);
                });

                it('fromPageId + rangeLimit > totalPages case 1', function () {
                    fromPageId = 3;
                    rangeLimit = 3;
                    visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                    expect(visiblePages.length).toBe(rangeLimit);
                    expect(visiblePages[0].id).toBe(3); // same as fromPageId
                    expect(visiblePages[1].id).toBe(4);
                    expect(visiblePages[2].id).toBe(5);
                });

                it('fromPageId + rangeLimit > totalPages case 2', function () {
                    fromPageId = 2;
                    rangeLimit = 4;
                    visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                    expect(visiblePages.length).toBe(rangeLimit);
                    expect(visiblePages[0].id).toBe(2); // same as fromPageId
                    expect(visiblePages[1].id).toBe(3);
                    expect(visiblePages[2].id).toBe(4);
                    expect(visiblePages[3].id).toBe(5);
                });

                it('fromPageId + rangeLimit > totalPages case 3', function () {
                    fromPageId = 3;
                    rangeLimit = 4;
                    visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                    expect(visiblePages.length).toBe(rangeLimit);
                    expect(visiblePages[0].id).toBe(2); // NOT same as fromPageId anymore
                    expect(visiblePages[1].id).toBe(3); // fromPageId
                    expect(visiblePages[2].id).toBe(4);
                    expect(visiblePages[3].id).toBe(5);
                });

                it('fromPageId + rangeLimit > totalPages case 4', function () {
                    fromPageId = 3;
                    rangeLimit = 5;
                    visiblePages = ctrl.createVisiblePages(pagesData, fromPageId, rangeLimit);

                    expect(visiblePages.length).toBe(rangeLimit);
                    expect(visiblePages[0].id).toBe(1); // NOT same as fromPageId anymore
                    expect(visiblePages[1].id).toBe(2); // same as fromPageId
                    expect(visiblePages[2].id).toBe(3);
                    expect(visiblePages[3].id).toBe(4);
                    expect(visiblePages[4].id).toBe(5);
                });
            });
        });
    });

    xdescribe('updateVisiblePages', function () {
        var visiblePages, pagesData, currentPageId, rangeLimit, goToPage, goToPageId;
        var updatedVsiblePages;
        var PAGES = {
            NEXT_PAGE: 'next_page',
            LAST_PAGE: 'last_page',
            PREVIOUS_PAGE: 'previous_page',
            FIRST_PAGE: 'first_page'
        };

        beforeEach(function () {
            ctrl = createController();
        });

        it('should NOT update visible pages unless visible pages is non empty array AND rangeLimit is defined', function () {
            visiblePages = [];
            pagesData = [];
            rangeLimit = undefined;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, goToPage, goToPageId);

            expect(updatedVsiblePages).toEqual(visiblePages); // no update at all
        });

        it('should update visible pages when currentPageId > lastVisiblePageId and direction is forward', function () {

            rangeLimit = 3;
            visiblePages = createMockPages(rangeLimit); // lastVisiblePageId = 3
            expect(visiblePages[0].id).toBe(1);
            expect(visiblePages[1].id).toBe(2);
            expect(visiblePages[2].id).toBe(3);
            pagesData = createMockPages(6);

            // case 0
            currentPageId = 1;
            goToPage = PAGES.NEXT_PAGE;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, goToPage, goToPageId);

            expect(updatedVsiblePages).toEqual(visiblePages); // no update at all

            // case 1
            currentPageId = 4;
            goToPage = PAGES.NEXT_PAGE;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, goToPage, goToPageId);

            expect(updatedVsiblePages).not.toEqual(visiblePages);
            expect(visiblePages[visiblePages.length - 1].id).toBe(3);
            expect(updatedVsiblePages[0].id).toBe(2);
            expect(updatedVsiblePages[1].id).toBe(3);
            expect(updatedVsiblePages[2].id).toBe(4);

            // case 2
            currentPageId = 6;
            goToPage = PAGES.LAST_PAGE;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, goToPage, goToPageId);

            expect(visiblePages[visiblePages.length - 1].id).toBe(3);
            expect(updatedVsiblePages[0].id).toBe(4);
            expect(updatedVsiblePages[1].id).toBe(5);
            expect(updatedVsiblePages[2].id).toBe(6);

            // case 3
            currentPageId = 4;
            goToPageId = 5;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, undefined, goToPageId);

            expect(visiblePages[visiblePages.length - 1].id).toBe(3);
            expect(updatedVsiblePages[0].id).toBe(2);
            expect(updatedVsiblePages[1].id).toBe(3);
            expect(updatedVsiblePages[2].id).toBe(4);
        });

        it('should update visible pages when currentPageId < firstVisiblePageId and direction is backward', function () {

            rangeLimit = 3;
            visiblePages = createMockPagesFromId(4, 6); // firstVisiblePageId = 4
            expect(visiblePages[0].id).toBe(4);
            expect(visiblePages[1].id).toBe(5);
            expect(visiblePages[2].id).toBe(6);
            pagesData = createMockPages(6);

            // case 1
            currentPageId = 3;
            goToPage = PAGES.PREVIOUS_PAGE;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, goToPage, goToPageId);

            expect(updatedVsiblePages).not.toEqual(visiblePages);

            expect(updatedVsiblePages[0].id).toBe(3);
            expect(updatedVsiblePages[1].id).toBe(4);
            expect(updatedVsiblePages[2].id).toBe(5);

            // case 2
            currentPageId = 1;
            goToPage = PAGES.FIRST_PAGE;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, goToPage, goToPageId);

            expect(updatedVsiblePages[0].id).toBe(1);
            expect(updatedVsiblePages[1].id).toBe(2);
            expect(updatedVsiblePages[2].id).toBe(3);

            // case 3
            currentPageId = 3;
            goToPageId = 2;

            updatedVsiblePages = ctrl.updateVisiblePages(visiblePages, pagesData, currentPageId, rangeLimit, undefined, goToPageId);

            expect(updatedVsiblePages[0].id).toBe(3);
            expect(updatedVsiblePages[1].id).toBe(4);
            expect(updatedVsiblePages[2].id).toBe(5);
        });

        afterEach(function () {
            visiblePages = null;
            pagesData = null;
            currentPageId = null;
            rangeLimit = null;
            goToPage = null;
            goToPageId = null;
            updatedVsiblePages = null;
        });

    });

    describe('updateCurrentSelectedPageId', function () {
        var currentPageId, previousPageId;

        beforeEach(function () {
            ctrl = createController();
        });

        it('should NOT update isSelected property of pagesData element if previousPageId && currentPageId is NOT a positive number', function () {
            // case 1
            previousPageId = -1;
            currentPageId = -2;
            ctrl.pagesData = createMockPages(3);
            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);

            ctrl.updateCurrentSelectedPageId(ctrl.pagesData, currentPageId, previousPageId);

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);

            // case 2
            previousPageId = 0;
            currentPageId = 2;

            ctrl.updateCurrentSelectedPageId(ctrl.pagesData, currentPageId, previousPageId);

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
        });

        it('should update isSelected property of pagesData element and return currentPageId', function () {
            // case 1
            previousPageId = 1;
            currentPageId = 2;
            ctrl.pagesData = createMockPages(10);

            var updateCurrentPageId = ctrl.updateCurrentSelectedPageId(ctrl.pagesData, currentPageId, previousPageId);

            expect(ctrl.pagesData[previousPageId - 1].isSelected).toBe(false);
            expect(ctrl.pagesData[currentPageId - 1].isSelected).toBe(true);
            expect(updateCurrentPageId).toBe(currentPageId);

            // case 2
            previousPageId = 2;
            currentPageId = 6;

            updateCurrentPageId = ctrl.updateCurrentSelectedPageId(ctrl.pagesData, currentPageId, previousPageId);

            expect(ctrl.pagesData[previousPageId - 1].isSelected).toBe(false);
            expect(ctrl.pagesData[currentPageId - 1].isSelected).toBe(true);
            expect(updateCurrentPageId).toBe(currentPageId);
        });
    });

    describe('checkIsTherePagesNext', function () {
        var currentPageId, lastPageId, lastVisiblePageId;

        beforeEach(function () {
            ctrl = createController();
        });

        it('should return TRUE when rangeLimit < total pages by default', function () {
            currentPageId = 1;
            lastPageId = 5;
            lastVisiblePageId = 2;
            expect(ctrl.checkIsTherePagesNext(currentPageId, lastPageId, lastVisiblePageId)).toBe(true);
        });

        it('should return FALSE when current page is last page', function () {
            currentPageId = 5;
            lastPageId = 5;
            lastVisiblePageId = 4;
            expect(ctrl.checkIsTherePagesNext(currentPageId, lastPageId, lastVisiblePageId)).toBe(false);
        });

        it('should return FALSE when last visible page is the same as last page', function () {
            currentPageId = 4;
            lastPageId = 5;
            lastVisiblePageId = 5;
            expect(ctrl.checkIsTherePagesNext(currentPageId, lastPageId, lastVisiblePageId)).toBe(false);
        });

    });

    describe('checkIsTherePagesPrevious', function () {

        var currentPageId, firstPageId, firstVisiblePageId;

        beforeEach(function () {
            ctrl = createController();
        });

        it('should return FALSE when current page is first page (by default)', function () {
            currentPageId = 1; // 1 means firstPageId
            firstVisiblePageId = 3;
            expect(ctrl.checkIsTherePagesPrevious(currentPageId, firstVisiblePageId)).toBe(false);
        });

        it('should return TRUE when current page is last page', function () {
            currentPageId = 5; // 5 means lastPageId
            firstVisiblePageId = 3;
            expect(ctrl.checkIsTherePagesPrevious(currentPageId, firstVisiblePageId)).toBe(true);
        });

        it('should return FALSE when first visible page is the same as first page', function () {
            currentPageId = 2;
            firstVisiblePageId = 1; // 1 means firstPageId
            expect(ctrl.checkIsTherePagesPrevious(currentPageId, firstVisiblePageId)).toBe(false);
        });

    });

    describe('checkIsTherePagesOnBothSides', function () {

        var currentPageId, pagesData, visiblePages, rangeLimit;

        it('should not do checking when pagesData or visiblePages is empty or undefined', function () {
            ctrl = createController();

            spyOn(ctrl, 'checkIsTherePagesNext');
            spyOn(ctrl, 'checkIsTherePagesPrevious');

            // pagesData is empty
            currentPageId = 5;
            pagesData = [];
            visiblePages = [mockPage(1)];

            ctrl.checkIsTherePagesOnBothSides(currentPageId, pagesData, visiblePages);

            // pagesData is undefined
            pagesData = undefined;

            ctrl.checkIsTherePagesOnBothSides(currentPageId, pagesData, visiblePages);

            // visiblePages is empty
            pagesData = [mockPage(1)];
            visiblePages = [];

            ctrl.checkIsTherePagesOnBothSides(currentPageId, pagesData, visiblePages);

            // visiblePages is undefined
            visiblePages = undefined;

            ctrl.checkIsTherePagesOnBothSides(currentPageId, pagesData, visiblePages);

            expect(ctrl.checkIsTherePagesNext).not.toHaveBeenCalled();
            expect(ctrl.checkIsTherePagesPrevious).not.toHaveBeenCalled();
        });

        it('should do checking when pagesData or visiblePages is available', function () {
            ctrl = createController();

            spyOn(ctrl, 'checkIsTherePagesNext');
            spyOn(ctrl, 'checkIsTherePagesPrevious');

            // pagesData is empty
            var lastPageId = 10, lastVisiblePageId = 5, firstVisiblePageId = 3;
            currentPageId = firstVisiblePageId;
            pagesData = createMockPages(lastPageId); // create 10 mock pages
            visiblePages = createMockPagesFromId(3, 5); //

            ctrl.checkIsTherePagesOnBothSides(currentPageId, pagesData, visiblePages);

            expect(ctrl.checkIsTherePagesNext).toHaveBeenCalledWith(currentPageId, lastPageId, lastVisiblePageId);
            expect(ctrl.checkIsTherePagesPrevious).toHaveBeenCalledWith(currentPageId, firstVisiblePageId);
        });
    });

    // NAVIGATION LOGICS
    describe('goToNextPage', function () {

        it('should update isSelected and currentPageId', function () {
            ctrl = createController({pages: 3});
            ctrl.$onInit();
            spyOn(ctrl, 'onClick');

            expect(ctrl.pagesData[0].isSelected).toBe(true);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(1);

            ctrl.goToNextPage();

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(true);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(2);

            ctrl.goToNextPage();

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(true);
            expect(ctrl.currentPageId).toBe(3);

            ctrl.goToNextPage();

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(true);
            expect(ctrl.currentPageId).toBe(3);

            expect(ctrl.onClick.calls.count()).toEqual(2); // NOT 3
        });

        it('should update visiblePages when currentPageId is out of visiblePages', function () {
            ctrl = createController({pages: 5, rangeLimit: 3, currentPageId: 1});
            ctrl.$onInit();
            spyOn(ctrl, 'onClick');

            expect(ctrl.currentPageId).toBe(1);

            expect(ctrl.pagesData[0].isSelected).toBe(true); // visiblePages
            expect(ctrl.pagesData[1].isSelected).toBe(false); // visiblePages
            expect(ctrl.pagesData[2].isSelected).toBe(false); // visiblePages
            expect(ctrl.pagesData[3].isSelected).toBe(false);
            expect(ctrl.pagesData[4].isSelected).toBe(false);

            expect(ctrl.visiblePages[0].isSelected).toBe(true);
            expect(ctrl.visiblePages[1].isSelected).toBe(false);
            expect(ctrl.visiblePages[2].isSelected).toBe(false);

            expect(ctrl.visiblePages[0].id).toBe(1);
            expect(ctrl.visiblePages[2].id).toBe(3);

            ctrl.goToNextPage();

            expect(ctrl.currentPageId).toBe(2);

            expect(ctrl.visiblePages[0].isSelected).toBe(false);
            expect(ctrl.visiblePages[1].isSelected).toBe(true);
            expect(ctrl.visiblePages[2].isSelected).toBe(false);

            expect(ctrl.visiblePages[0].id).toBe(1);
            expect(ctrl.visiblePages[2].id).toBe(3);

            ctrl.goToNextPage();

            expect(ctrl.currentPageId).toBe(3);

            expect(ctrl.visiblePages[0].isSelected).toBe(false);
            expect(ctrl.visiblePages[1].isSelected).toBe(false);
            expect(ctrl.visiblePages[2].isSelected).toBe(true);

            expect(ctrl.visiblePages[0].id).toBe(1);
            expect(ctrl.visiblePages[2].id).toBe(3);

            ctrl.goToNextPage();

            expect(ctrl.currentPageId).toBe(4);

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false); // visiblePages
            expect(ctrl.pagesData[2].isSelected).toBe(false); // visiblePages
            expect(ctrl.pagesData[3].isSelected).toBe(true); // visiblePages
            expect(ctrl.pagesData[4].isSelected).toBe(false);

            expect(ctrl.visiblePages[0].isSelected).toBe(false);
            expect(ctrl.visiblePages[1].isSelected).toBe(false);
            expect(ctrl.visiblePages[2].isSelected).toBe(true);

            expect(ctrl.visiblePages[0].id).toBe(2);
            expect(ctrl.visiblePages[2].id).toBe(4);
        });

    });

    describe('goToPreviousPage', function () {

        beforeEach(function () {
            ctrl = createController({pages: 3, currentPageId: 3});
            ctrl.$onInit();
            spyOn(ctrl, 'onClick');
        });

        it('should update isSelected and currentPageId', function () {
            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(true);
            expect(ctrl.currentPageId).toBe(3);

            ctrl.goToPreviousPage();

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(true);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(2);

            ctrl.goToPreviousPage();

            expect(ctrl.pagesData[0].isSelected).toBe(true);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(1);

            ctrl.goToPreviousPage();

            expect(ctrl.pagesData[0].isSelected).toBe(true);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(1);

            expect(ctrl.onClick.calls.count()).toEqual(2); // NOT 3
        });

        it('should update visiblePages when currentPageId is out of visiblePages', function () {
            ctrl = createController({pages: 5, rangeLimit: 3, currentPageId: 3});
            ctrl.$onInit();
            spyOn(ctrl, 'onClick');

            expect(ctrl.currentPageId).toBe(3);

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(true); // visiblePages
            expect(ctrl.pagesData[3].isSelected).toBe(false); // visiblePages
            expect(ctrl.pagesData[4].isSelected).toBe(false); // visiblePages

            expect(ctrl.visiblePages[0].isSelected).toBe(true);
            expect(ctrl.visiblePages[1].isSelected).toBe(false);
            expect(ctrl.visiblePages[2].isSelected).toBe(false);

            expect(ctrl.visiblePages[0].id).toBe(3);
            expect(ctrl.visiblePages[2].id).toBe(5);

            ctrl.goToPreviousPage();

            expect(ctrl.currentPageId).toBe(2);

            expect(ctrl.visiblePages[0].isSelected).toBe(true);
            expect(ctrl.visiblePages[1].isSelected).toBe(false);
            expect(ctrl.visiblePages[2].isSelected).toBe(false);

            expect(ctrl.visiblePages[0].id).toBe(2);
            expect(ctrl.visiblePages[2].id).toBe(4);

        });

    });

    describe('goToFirstPage', function () {

        beforeEach(function () {
            ctrl = createController({pages: 3, currentPageId: 3});
            ctrl.$onInit();
            spyOn(ctrl, 'onClick');
        });

        it('should update isSelected and currentPageId', function () {
            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(true);
            expect(ctrl.currentPageId).toBe(3);

            ctrl.goToFirstPage();

            expect(ctrl.pagesData[0].isSelected).toBe(true);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(1);
            expect(ctrl.onClick).toHaveBeenCalled();
        });

    });

    describe('goToLastPage', function () {

        beforeEach(function () {
            ctrl = createController({pages: 3, currentPageId: 1});
            ctrl.$onInit();
            spyOn(ctrl, 'onClick');
        });

        it('should update isSelected and currentPageId', function () {
            expect(ctrl.pagesData[0].isSelected).toBe(true);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(1);

            ctrl.goToLastPage();

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(true);
            expect(ctrl.currentPageId).toBe(3);
            expect(ctrl.onClick).toHaveBeenCalled();

        });

    });

    describe('goToPage', function () {

        beforeEach(function () {
            ctrl = createController({pages: 4, currentPageId: 1});
            ctrl.$onInit();
            spyOn(ctrl, 'onClick');
        });

        it('should update isSelected and currentPageId', function () {
            expect(ctrl.pagesData[0].isSelected).toBe(true);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(1);

            ctrl.goToPage(3);

            expect(ctrl.pagesData[0].isSelected).toBe(false);
            expect(ctrl.pagesData[1].isSelected).toBe(false);
            expect(ctrl.pagesData[2].isSelected).toBe(true);
            expect(ctrl.pagesData[3].isSelected).toBe(false);
            expect(ctrl.currentPageId).toBe(3);
            expect(ctrl.onClick).toHaveBeenCalled();
        });

    });

});