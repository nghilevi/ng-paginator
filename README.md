# Ng-paginator

[![npm version](https://badge.fury.io/js/ng-paginator.svg)](http://badge.fury.io/js/ng-paginator)

Pagination component for Angular 1.x, displaying the sequence of numbers assigned to pages in a book or periodical.

# Usage

### Install

`npm i --save ng-paginator`

### Add library to your page

``` html
<script src="node_modules/ng-paginator/dist/ng-paginator.js"></script>
```

You should use minified version (`ng-paginator.min.js`) in production.


### Add dependency in your application's module definition

``` javascript
var application = angular.module('application', [
  // ...
  'ngPaginator'
]);
```

### Use ng-paginator in your html

``` html
<ng-paginator total-pages="25" current-page-id="1" visible-range-limit="4" on-click="vm.onPageClick(data)"></ng-paginator>
```

## API

| Attributes                    | Description                                              |
|-------------------------------|----------------------------------------------------------|
| {integer} total-pages         | total number of pages.                                   |
| {integer} current-page-id     | current page id.                                         |
| {integer} visible-range-limit | number of page links to be visible one at a time.        |
| {function} on-click           | callback to be called everytime user clicks a page link. |

## Feedback

If you have found a bug or have another issue with the library —
please [create an issue][new-issue].

If you have a question regarding the library or it's integration with your project —
consider asking a question at [StackOverflow][so-ask] and sending me a
link via [E-Mail][email]. I will be glad to help.

Have any ideas or propositions? Feel free to contact me by [E-Mail][email].

Cheers!

## Developer guide

Fork, clone, create a feature branch, implement your feature, cover it with tests, commit, create a PR.

Run:

- `npm i` to initialize the project
- `gulp` to re-build the dist files
- `karma start` to test the code

Do not add dist files to the PR itself.
We will re-compile the module manually each time before releasing.


## Support

If you like this library consider to add star on [GitHub repository][repo-gh].

Thank you!
