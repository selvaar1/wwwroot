AoaShopping.filter('startFrom', function () {
    return function (input, start) {

        if (!input || !input.length) { return; }
        start = +start; //parse to int
        return input.slice(start);
    };
});

//Html string filter service
AoaShopping.filter("sanitize", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);

AoaShopping.filter("jsDate", function () {
    return function (x) {
        return new Date(parseInt(x.substr(6)));
    };
});

//Image not available or image link borken 
AoaShopping.directive('noImage', function (defaultImg) {
    var setDefaultImage = function (el) {
        el.attr('src', defaultImg.noImageUrl);
    };

    return {
        restrict: 'A',
        link: function (scope, el, attr) {
            //Set loading is true at the time when load the page.
            scope.loading = true;

            scope.$watch(function () {
                scope.loading = false;
                return attr.ngSrc;
            }, function () {
                var src = attr.ngSrc;
                if (!src) {
                    setDefaultImage(el);
                    scope.loading = false;
                }
            });

            el.bind('error', function () { setDefaultImage(el); });

        }

    }
});

//restric Input Limit 
AoaShopping.directive("limitTo", ['$compile', function ($compile) {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            angular.element(elem).on("keypress", function (evt) {

                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                    return false;
                }
                var limit = parseInt(attrs.limitTo);

                if (this.value.length == limit) {
                    this.value = this.value.substr(0, this.value.length - 1);
                    return
                }
            });
        }
    }
}]);

//Allow only Alpha Numeric
//AoaShopping.directive("alphaNumberic", [function () {
//    return {
//        restrict: "A",
//        link: function (scope, elem, attrs) {
//            angular.element(elem).on("keypress", function (e) {
//                var evt = window.event || e;
//                var regex = new RegExp("^[a-zA-Z0-9 ]+$");
//                var str = String.fromCharCode(!evt.charCode ? evt.which : evt.charCode);
//                console.log(regex.test(str))
//                if (regex.test(str)) {
//                    return true;
//                }
//                e.preventDefault();
//                return false;
//            });
//        }
//    }
//}]);
AoaShopping.directive('alphaNumberic', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, iElement, iAttrs, controller) {
            scope.$watch(iAttrs.ngModel, function (value) {
                if (!value) {
                    return;
                }
                $parse(iAttrs.ngModel).assign(scope, value.replace(new RegExp(iAttrs.alphaNumberic, 'g'), '').replace(/\s+/g, ' '));
            });
        }
    }
});
//string length cut
AoaShopping.directive("limitDesc", [function () {
    return {
        restrict: "A",
        link: function (scope, elem, limit) {
            limit = angular.element(elem).attr('data-limit');
            scope.$watch(function () {
                var x = angular.element(elem);
                var elemText = x.text().substr(0, limit);
                if (x.text().length > limit) {
                    x.text(elemText + '...');
                }

            });
        }
    }
}]);

//Event calls after loop completion
AoaShopping.directive('ngRepeatLoadFinish', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elm, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
}]);

//View Ratings with Comments
AoaShopping.directive("ratingStars", ['$compile', function ($compile) {

   
    var myCount = 0;
    return {
        restrict: 'AE',
       
        controller: function ($scope, $attrs, $element) {
            $attrs.$observe('item', function (newVal, oldVal) {
                if (newVal) {
                    var el = $compile('<p id="rating' + myCount++ + '"><span class="stars" id="stars' + myCount++ + '"><span style="width:'+ (Math.max(0, (Math.min(5, parseFloat(newVal)))) * 16) +'px;"></span></span></p>')($scope);
                    $element.append(el);
                }
            })
        }
    };
}]);
