function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

AoaShopping.controller('AoaShoppingController',
    ['$scope'
        , '$filter'
        , '$http'
        , 'urlService'
        , '$timeout'
        , '$rootScope'
        , '$window'
        , 'productCart'

        , function ($scope
            , $filter
            , $http
            , urlService
            , $timeout
            , $rootScope
            , $window
            , productCart
            , $routeParam) {
            "use strict"
            //Global Variables
            $scope.thisday = new Date();
            $scope.currentPage = 0;
            $scope.productsPerPage = 24;
            $scope.getData = [];
            $scope.search = '';
            $scope.Products = '';
            $scope.ServerProducts = '';
            $scope.pageSize = "24";
            $scope.pageStartIndex = '';
            $scope.pageDynamicCount = $scope.productsPerPage;
            $scope.totalProducts = '';
            $scope.sesCustomerId = '';
            $scope.sesToken = '';
            $scope.sesCustomerName = '';
            $scope.sesUserIsMember = '';
            $scope.FeatureProductImages = '';
            $scope.catList = '';
            $scope.userAddress = '';
            $scope.ShippingAddresses = [];
            $scope.BillingAddresses = [];
            $scope.catList = [];
            $scope.showDetails = false;

            //Sorting
            // set the default sort type
            $scope.sortReverse = false;  // set the default sort order

            $scope.BindSettings = function () {
                if (sessionStorage.getItem("pagesize") != null) {
                    if (sessionStorage.getItem("pagesize") == 0) {
                        $scope.pageSize = "all";
                        $scope.productsPerPage = 0;
                        $scope.pageDynamicCount = 24;
                    }
                    else {
                        $scope.pageSize = sessionStorage.getItem("pagesize");
                        $scope.productsPerPage = sessionStorage.getItem("pagesize");
                        $scope.pageDynamicCount = sessionStorage.getItem("pageDynCount");
                    }
                }

                if ($scope.pageSize == "all") {
                    $scope.pageDynamicCount = sessionStorage.getItem("tp");
                }

                if (sessionStorage.getItem("sortBy") != null) {
                    $scope.sortBy = sessionStorage.getItem("sortBy");
                }
                else {
                    $scope.sortBy = "Sort by";
                }
                if (sessionStorage.getItem("sortType") != null) {
                    $scope.sortType = sessionStorage.getItem("sortType");

                }
                if (sessionStorage.getItem("sortReverse") != null) {

                    if (sessionStorage.getItem("sortReverse") == "true") {
                        $scope.sortReverse = true;
                    }
                    else {
                        $scope.sortReverse = false;
                    }
                }

                if (sessionStorage.getItem("sortReverse") != null) {
                    if (sessionStorage.getItem("sortReverse") == "true") {
                        $scope.sortReverse = true;
                    }
                    else {
                        $scope.sortReverse = false;
                    }

                }
            }
            $scope.BindSettings();

            $scope.sort = function () {

                if ($scope.sortBy == "A-Z") {
                    $scope.sortType = 'ProductName'
                    $scope.sortReverse = false;
                }
                else if ($scope.sortBy == "Z-A") {
                    $scope.sortType = 'ProductName'
                    $scope.sortReverse = true;
                }
                else if ($scope.sortBy == "PriceLH") {
                    $scope.sortType = 'MinListPrice'
                    //if ($scope.sesUserIsMember == '1')
                    //    $scope.sortType = 'MinMemberPrice' //MemberPrice
                    //else
                    //    $scope.sortType = 'MinListPrice' //Price
                    $scope.sortReverse = false;
                }
                else if ($scope.sortBy == "PriceHL") {
                    $scope.sortType = 'MinListPrice'
                    //if ($scope.sesUserIsMember == '1')
                    //    $scope.sortType = 'MinMemberPrice'
                    //else
                    //    $scope.sortType = 'MinListPrice'
                    $scope.sortReverse = true;
                }
                else if ($scope.sortBy == "highRating") {
                    $scope.sortType = 'Rating'
                    $scope.sortReverse = true;
                }
                else if ($scope.sortBy == "lowRating") {
                    $scope.sortType = 'Rating'
                    $scope.sortReverse = false;
                } else {
                    /*$scope.sortType = 'ProductName'
                      $scope.sortReverse = false;*/
                    $scope.sortType = ''
                    $scope.sortReverse = false;
                }

                /*Maintaining sorting state*/
                sessionStorage.setItem("sortBy", $scope.sortBy);
                sessionStorage.setItem("sortType", $scope.sortType);
                sessionStorage.setItem("sortReverse", $scope.sortReverse);

            };

            /* Left Menu Categories*/
            function SelectCategory(propertyname, selectedCategories, categories) {
                $.each(selectedCategories, function (index, value) {

                    if (value.length > 0) {

                        $.grep(categories, function (e) {

                            var str = "if (e." + propertyname + "== value) {e[\"selected\"] = true;";
                            str += "}";
                            eval(str);
                        })
                    }

                });
            }

            urlService.dataProvider(categoryMethod, "GET", '').success(function (data) {
                $scope.catList = data;

                if (sessionStorage.getItem("Format") != null) {
                    var Selectedformats = sessionStorage.getItem("Format").split(',');
                    SelectCategory("FormatId", Selectedformats, $scope.catList.Formats);
                }

                $scope.Formats = $scope.catList.Formats;

                if (sessionStorage.getItem("Category") != null) {
                    var SelectedCategories = sessionStorage.getItem("Category").split(',');

                    SelectCategory("CategoryId", SelectedCategories, $scope.catList.Categories);
                }

                $scope.Categories = $scope.catList.Categories;

                if (sessionStorage.getItem("Topic") != null) {
                    var SelectedTopics = sessionStorage.getItem("Topic").split(',');

                    SelectCategory("TopicCode", SelectedTopics, $scope.catList.Topics);
                }

                $scope.Topics = $scope.catList.Topics;

                /*Member for block*/
                if (sessionStorage.getItem("member") != null) {
                    if (sessionStorage.getItem("member")) {
                        $(".memberproducts").attr("checked", true);
                    }
                }
                if (sessionStorage.getItem("nonmember") != null) {
                    if (sessionStorage.getItem("nonmember")) {
                        $(".nonmemberproducts").attr("checked", true);
                    }
                }
                //end

                //dropdown filling
                var categeriesDdl = [];

                var def = {};
                def["Description"] = "All";
                def["type"] = "All";
                categeriesDdl.push(def);

                $.each($scope.Formats, function (index, value) {

                    var formats = {};
                    formats["Description"] = value.Description;
                    formats["type"] = "format:" + value.FormatId;
                    categeriesDdl.push(formats);
                });

                $.each($scope.Categories, function (index, value) {

                    var categories = {};
                    categories["Description"] = value.CategoryName;
                    categories["type"] = "category:" + value.CategoryId;
                    categeriesDdl.push(categories);
                });

                $.each($scope.Topics, function (index, value) {

                    var topics = {};
                    topics["Description"] = value.TopicDescription;

                    topics["type"] = "topic:" + value.TopicCode;
                    topics["TopicCode"] = value.TopicCode;
                    categeriesDdl.push(topics);

                });

                $scope.ddlCategories = categeriesDdl;

                //end

            });

            // Products data from factory Service
            var featuredProductsBanner = [];
            $scope.listProducts = function () {
                console.log("listProducts");
                urlService.dataProvider(allProductsMethod, "POST", '').success(function (data) {
                    $scope.TempProducts = data;
                    $scope.Products = unique($scope.TempProducts);
                    $scope.ServerProducts = data;
                    $scope.totalProducts = $scope.Products.length;
                    $scope.BindProducts(); //To maintain state of filter products      
                    $scope.searchLoad();
                    hide();
                    $scope.sort();
                    if ($scope.FeatureProductImages.length == 0) {
                        $.grep($scope.Products, function (i) {
                            if (i.IsFeatureProduct == true) {
                                featuredProductsBanner.push({ "ProductImage": i.ProductImage, "ProductId": i.ProductId, "ShortDescription": i.ShortDescription, "ProductName": i.ProductName });
                            }
                        });
                    }

                    //get customer information
                    //$scope.sessionInfo();
                });
            };
            $scope.listProducts();

            //Get sessioninfo
            $scope.sessionInfo = function () {
                console.log("sessionInfo");
                urlService.dataProvider(sessionMethod, "POST", '').success(function (data) {
                    $scope.sesCustomerId = data[0].CustomerId;
                    $scope.sesToken = data[0].Token;
                    $scope.sesCustomerName = data[0].CustomerName;
                    $scope.sesUserIsMember = data[0].IsMember;
                    if ($scope.sesCustomerId != '') {
                        //Getting User Favourite Items with customer Id
                        $scope.GetFavouriteItems($scope.sesCustomerId);

                        /*Getting Shipping Charges based on the locations
                            $scope.shipViaCodeClient();
                            $scope.getCountries();
                            $scope.getStates();*/
                    }
                });
            }
            $scope.sessionInfo();

            $scope.FeatureProductImages = featuredProductsBanner;

            //Product filter Method
            $scope.filterProducts = function (SearchCondition) {

                console.log("filterProducts", SearchCondition);
                var catUrl = applicationUrl + '/home/GetProducts';
                return $http({
                    method: "GET",
                    url: catUrl,
                    params: { SelectedItems: SearchCondition },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (data) {
                    $scope.Products = data;
                    $scope.totalProducts = $scope.Products.length;
                    hide();
                }).error(function (x) {

                });

            }

            // Products Navigation START
            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                    sessionStorage.setItem("currentPage", $scope.currentPage);

                    if ($scope.currentPage == parseInt($scope.totalProducts / parseInt($scope.pageSize))) {
                        $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                        $scope.pageDynamicCount = $scope.totalProducts;
                    } else {
                        $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                        $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                        sessionStorage.setItem("pageDynCount", $scope.pageDynamicCount);
                    }

                }
            };

            $scope.prevPageDisabled = function () {
                return $scope.currentPage === 0 ? "disabled" : "";
            };

            $scope.pageCount = function () {

                if ($scope.productsPerPage == 0) {
                    return 0;
                }

                return Math.ceil($scope.totalProducts / $scope.productsPerPage) - 1;

            };

            $scope.nextPage = function () {

                if ($scope.currentPage < $scope.pageCount()) {
                    $scope.currentPage++;
                    sessionStorage.setItem("currentPage", $scope.currentPage);

                    if ($scope.currentPage == parseInt($scope.totalProducts / parseInt($scope.pageSize))) {
                        $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                        $scope.pageDynamicCount = $scope.totalProducts;
                    } else {
                        $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                        $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                        sessionStorage.setItem("pageDynCount", $scope.pageDynamicCount);
                    }

                }
                //paging();
            };

            $scope.nextPageDisabled = function () {
                return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
            };

            $scope.range = function () {

                var rangeSize = 24;
                var ret = [];
                var start;
                start = $scope.currentPage;

                if (start > $scope.pageCount() - rangeSize) {
                    start = $scope.pageCount() - rangeSize + 1;
                }
                for (var i = start; i < start + rangeSize; i++) {
                    if (i >= 0) {
                        ret.push(i);
                    }
                }

                if (ret.length > 1) //Hiding  pagination when page count is one 
                    return ret;
            };

            $scope.setPage = function (n) {
                $scope.currentPage = n;

                if (n == parseInt($scope.totalProducts / parseInt($scope.pageSize))) {
                    $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                    $scope.pageDynamicCount = $scope.totalProducts;
                } else {
                    $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                    $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                    sessionStorage.setItem("pageDynCount", $scope.pageDynamicCount);
                }
                sessionStorage.setItem("currentPage", $scope.currentPage);
            };

            //get filtered data length
            $scope.getData = function () {
                return $filter('filter')($scope.Products, $scope.search);
            }

            $scope.numberOfPages = function () {
                return Math.ceil($scope.getData().length / $scope.pageSize);
            }

            // LeftMenu Categories filters
            function SearchItemsCategory(products, categoryType, CategoryIds) {

                console.log("SearchItemsCategory", categoryType, CategoryIds);

                var categories = "";
                $(".categories").find("input:checked").filter('.category').each(function (index) {
                    categories = categories + $(this).prop('id') + ',';
                });

                var str = "";

                $.each(CategoryIds.split(','), function (index, value) {

                    if (value.length > 0) {
                        if (categoryType == "format")
                            str += " (obj.Formats==" + value + ") ||";
                        else if (categoryType == "category") {
                            str += " (obj.Categories==" + value + ") ||";
                        }
                        else if (categoryType == "topic") {
                            var expr = "";
                            if (categories.split(',').length > 0) {

                                $.each(categories.split(','), function (index, topicCategoryId) {
                                    if (topicCategoryId.length > 0) {
                                        expr += " (obj.TopicCode=='" + value + "') && (obj.TopicCategoryIds=='" + topicCategoryId + "') ||";
                                    }
                                });
                            }
                            if (expr.length == 0) {
                                str += " (obj.TopicCode=='" + value + "') ||";
                            }
                            else {
                                str = str + expr;
                            }
                        }
                    }
                });

                if (str.length > 0) {
                    if (str.substring(str.length, str.length - 2) == "||") {
                        str = str.substring(0, str.length - 2);
                    }
                }

                var items = $.grep(products, function (obj) {
                    return eval(str);
                });

                return items;

            }

            //This fuction for filterig prdoducts formats after selecting Category or Topic an both.
            function FilterFormats(products, formatIds) {

                var str = "";

                $.each(formatIds.split(','), function (index, value) {

                    if (value.length > 0) {
                        str += " (obj.Formats==" + value + ") ||";
                    }
                });

                if (str.length > 0) {
                    if (str.substring(str.length, str.length - 2) == "||") {
                        str = str.substring(0, str.length - 2);
                    }
                }

                var items = $.grep(products, function (obj) {
                    return eval(str);
                });
                return items;

            }

            $scope.BindProducts = function () {

                console.log("sessionInfo");

                //getting selected categories
                $scope.Products = $scope.TempProducts;
                //debugger;
                //format
                var filterItems = [];
                var formatIds = "";

                $scope.Topics = $scope.catList.Topics;
                var selectedCategories = $(".categories").find("input:checked");
                console.log("BindProducts selectedCategories", selectedCategories.length);

                //Get the Topics for selected Categories and bind to scope
                if (selectedCategories.length > 0) {

                    var temp = [];
                    // debugger;
                    for (var j = 0; j < selectedCategories.length; j++) {
                        if (selectedCategories[j].className == "category") {
                            // debugger;
                            console.log("BindProducts removeItem Topic");
                            /*
                             * 20181129 why this is needed?
                            $(".categories").find("input:checked").filter('.topic').each(function (index) {
                               // debugger;
                                sessionStorage.removeItem("Topic");
                                $(this).prop('checked', false);

                            });
                            */
                            for (var i = 0; i < $scope.catList.Topics.length; i++) {
                                if ($scope.catList.Topics[i].catID == selectedCategories[j].id) {
                                    temp.push($scope.catList.Topics[i])
                                    $scope.Topics = temp;
                                }
                            }
                        }
                    }

                }

                //debugger;    
                var uniqueList = '';

                $('#selctedCatsNames').text('');
                if (selectedCategories.length > 0) {

                    $(".categories").find("input:checked").filter('.format').each(function (index) {
                        formatIds = formatIds + $(this).prop('id') + ',';
                        uniqueList = uniqueList + "<span class='catTags'>" + $(this).next().text() + " <a href='javascript:;' data-catType='" + $(this).attr('class') + "' data-catId='" + $(this).prop('id') + "'>X</a></span>";
                    });

                    sessionStorage.setItem("Format", formatIds); //To maintain state on refresh 

                    //end

                    //Category
                    var catProducts = [];
                    var categoryIds = "";

                    $(".categories").find("input:checked").filter('.category').each(function (index) {
                        categoryIds = categoryIds + $(this).prop('id') + ',';
                        uniqueList = uniqueList + "<span class='catTags'>" + $(this).next().text() + " <a href='javascript:;' data-catType='" + $(this).attr('class') + "' data-catId='" + $(this).prop('id') + "'>X</a></span>";
                    });

                    if (categoryIds.length > 0) {
                        sessionStorage.setItem("Category", categoryIds); //To maintain state on refresh 
                        var categoryItems = SearchItemsCategory($scope.Products, "category", categoryIds);
                        catProducts = categoryItems;

                    }

                    //Topic
                    var topicIds = "";
                    $(".categories").find("input:checked").filter('.topic').each(function (index) {
                        //topicIds = topicIds + $(this).parent().find('#topicCode').val() + ',';
                        topicIds = topicIds + $(this).parent().find('.topicCode').val() + ',';
                        uniqueList = uniqueList + "<span class='catTags'>" + $(this).next().text() + " <a href='javascript:;' data-catType='" + $(this).attr('class') + "' data-catId='" + $(this).prop('id') + "'>X</a></span>";
                    });

                    console.log("BindProducts topicIds", topicIds);

                    //Member for

                    if ($(".memberproducts").is(":checked"))
                        uniqueList = uniqueList + "<span class='catTags'>" + $(".memberproducts").next().text() + " <a href='javascript:;' data-catType='" + $(".memberproducts").attr('class') + "' data-catId='" + $(".memberproducts").prop('id') + "'>X</a></span>";

                    if ($(".nonmemberproducts").is(":checked"))
                        uniqueList = uniqueList + "<span class='catTags'>" + $(".nonmemberproducts").next().text() + " <a href='javascript:;' data-catType='" + $(".nonmemberproducts").attr('class') + "' data-catId='" + $(".nonmemberproducts").prop('id') + "'>X</a></span>";

                    var filtTex = "&nbsp;&nbsp;&nbsp;<b style='color:#000;'>Filtered by: </b>"
                    $('#selctedCatsNames').html(filtTex).append(uniqueList);

                    var CAll = "<span class='catTags'><a href='javascript:;'  data-catType='" + $(this).attr('class') + "' data-catId='All'>Clear All</a></span>";

                    $('#selctedCatsNames').html(filtTex).append(uniqueList).append(CAll);

                    if (topicIds.length > 0) {
                        var topicItems = SearchItemsCategory($scope.Products, "topic", topicIds);
                        sessionStorage.setItem("Topic", topicIds);
                        //To maintain state on refresh 
                        catProducts = topicItems;
                    }

                    //IF either of Topics and Categories not selected then we will filter  products based on selected format 
                    if (categoryIds.length == 0 && topicIds.length == 0) {
                        filterItems = FilterFormats($scope.Products, formatIds);
                    }
                    else {
                        //IF either of Topics and Categories selected then we will filter  products after filtering category and topic selected format 
                        Array.prototype.push.apply(filterItems, catProducts);
                    }
                    if (!(typeof filterItems === "undefined")) {
                        //getting products on selected formats only 
                        if (formatIds.length > 0)
                            filterItems = FilterFormats(filterItems, formatIds);
                        //end

                        //console.log($(".categories").find("input:checked").find(".memberproducts,.nonmemberproducts"));
                        //var memberprod = $(".categories").find("input:checked").find(".memberproducts").length;

                        var count = 0;
                        if ($(".memberproducts").is(":checked")) {
                            count++;
                        }
                        if ($(".nonmemberproducts").is(":checked")) {
                            count++;
                        }
                        if (filterItems.length == 0 && categoryIds.length == 0 && topicIds.length == 0 && formatIds.length == 0) {
                            filterItems = $scope.Products;
                        }

                        if (count != 2) {

                            //Member Products filter
                            if ($(".memberproducts").is(":checked")) {
                                var memberProducts = $.grep(filterItems, function (n) {
                                    return n.IsMemberOnly == true
                                });
                                sessionStorage.setItem("member", true);
                                $scope.Products = unique(memberProducts);
                            } //Non Member Products filter
                            else if ($(".nonmemberproducts").is(":checked")) {

                                var NonMemberProducts = $.grep(filterItems, function (n) {
                                    return n.IsMemberOnly == false
                                });
                                sessionStorage.setItem("nonmember", true);
                                $scope.Products = unique(NonMemberProducts);

                            }
                            else {
                                $scope.Products = unique(filterItems);
                            }
                        }
                        else {
                            $scope.Products = unique(filterItems);
                        }

                        if ($scope.Products.length == 0) {
                            $('#loadMsg').show();
                            $('#loadMsg').text('No results found!');
                            $scope.pageStartIndex = 0;
                            $scope.pageDynamicCount = 0;
                            sessionStorage.getItem("pageDynCount", 0);
                        } else {
                            $('#loadMsg').hide();
                            $('#loadMsg').text('Loading Results...');
                            $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                        }
                    }
                }
                else {
                    //clearing
                    sessionStorage.removeItem("Format");
                    sessionStorage.removeItem("Category");
                    sessionStorage.removeItem("Topic");
                    sessionStorage.removeItem("member");
                    sessionStorage.removeItem("nonmember");

                }
                try {
                    $scope.totalProducts = $scope.Products.length;
                } catch (e) {

                }

                $scope.currentPage = 0;

                if (sessionStorage.getItem("currentPage") != null) {
                    if (sessionStorage.getItem("currentPage")) {
                        $scope.currentPage = parseInt(sessionStorage.getItem("currentPage"));

                        if ($scope.pageSize == "all") {
                            if (sessionStorage.getItem("tp") >= $scope.totalProducts) {
                                $scope.pageDynamicCount = $scope.totalProducts;
                            } else if (sessionStorage.getItem("tp") == unique($scope.Products).length) {
                                $scope.pageDynamicCount = sessionStorage.getItem("tp");
                            } else {
                                $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                            }
                        }
                        else {
                            $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                        }
                    }
                }

                $scope.Products = unique($scope.Products);

                if ($scope.Products.length == 0) {
                    $('#loadMsg').show();
                    $('#loadMsg').text('No results found!');
                    $scope.pageStartIndex = 0;
                    $scope.pageDynamicCount = 0;
                    sessionStorage.getItem("pageDynCount", 0);
                } else {
                    $('#loadMsg').hide();
                    $('#loadMsg').text('Loading Results...');
                    $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;

                    var dpc = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                    if (dpc > $scope.Products.length)
                        dpc = $scope.Products.length;
                    $scope.pageDynamicCount = dpc;
                }

                if ($scope.pageSize > $scope.totalProducts) {
                    $scope.pageDynamicCount = $scope.totalProducts;
                }

                $scope.totalProducts = $scope.Products.length;

                if ($scope.pageSize == 'all')
                    $scope.pageDynamicCount = $scope.totalProducts;

                if ($scope.pageDynamicCount == null)
                    $scope.pageDynamicCount = $scope.pageSize;

                hide();
            }//BindProducts Method End

            $scope.getItemByCategory = function ($event) {
                // debugger;

                try {
                    var thisElem = $($event.target).parent();
                } catch (e) {

                }

                console.log("getItemByCategory", thisElem);
                if ($(thisElem).find('input').prop('checked') != true) {
                    $(thisElem).find('input').prop('checked', true);
                } else {
                    $(thisElem).find('input').prop('checked', false);
                }

                ////hiding Banner
                //$("#show_banner").text('Show Banner');
                //$("#slides").hide();
                //showHide = 1;

                //To reset page

                sessionStorage.setItem("currentPage", 0);
                sessionStorage.setItem("pageDynCount", $scope.productsPerPage);

                show();

                console.log("$scope.BindProducts() 1");

                $scope.BindProducts();

                var loc = window.location.href;

                var page = '/Product/CategoryProduct';

                if (loc.indexOf(page) > -1) {

                    window.location.href = applicationUrl;
                }
            }

            function getDataInArray(array) {
                var names = [];
                $.each(array, function (i, d) {
                    names.push(d.ProductName + " (" + d.ProductCode + ")");
                });

                return names;
            }

            //clear filters

            $scope.clsFil = function ($event) {
                var thisElm = $event.target;
                var clsFilterName = $(thisElm).attr('id');
                sessionStorage.removeItem(clsFilterName);
                $(thisElm).parent().parent().find('input[type="checkbox"]').prop('checked', false);
                $scope.listProducts();
            }

            // Search Filter by keyword & by select category
            $scope.SearchProducts = function (from) {

                if (from == 'topSearch')
                    $("#search").val('');
                else
                    $("#topSearch").val('');
                ////hide Banner
                //var selItem = '';
                //$("#show_banner").text('Show Banner');
                //$("#slides").hide();
                //showHide = 1;

                try {
                    var productSearch = $("#search").val().trim();
                    console.log("#search", productSearch);
                } catch (e) {
                    console.log("#search", e);
                }

                //topHeader Search start's from here
                var topSearch = $("#topSearch").val().trim();
                if (topSearch.length > 0) {

                    console.log("#topSearch");

                    var searchedProducts = factorialSearch($scope.TempProducts, topSearch);

                    if (!(typeof searchedProducts === "undefined")) {

                        var Names = [];
                        Names = getDataInArray(searchedProducts);

                        $("#topSearch").autocomplete({
                            source: function (request, response) {
                                response(Names);
                                //console.log(Names)
                            },
                            select: function (event, ui) {

                                var items = $.grep($scope.TempProducts, function (obj) {

                                    if (obj.ProductName + " (" + obj.ProductCode + ")" == ui.item.value)
                                        return obj.ProductName;
                                });

                                window.location = applicationUrl + '/Product/viewproduct/' + items[0].ProductId;
                            }
                        });
                    }

                }//topHeader Search End from here
                else if (productSearch.length > 0) { //Products search control start 

                    console.log("productSearch");

                    $scope.Products = $scope.TempProducts;
                    $('#loadMsg').hide();
                    var searchWord = $("#search").val().trim();
                    var category = $("#CategorySearch").val();

                    //if "All" 
                    if (category == "All") {

                        //Searching with All option
                        var searchedProducts = factorialSearch($scope.Products, searchWord);

                        console.log("searchedProducts", searchedProducts);

                        if (!(typeof searchedProducts === "undefined")) {
                            $scope.Products = searchedProducts;
                            var Names = [];
                            Names = getDataInArray(searchedProducts);

                            $("#search").autocomplete({
                                source: function (request, response) {
                                    response(Names);
                                },
                                select: function (event, ui) {
                                    var items = $.grep($scope.TempProducts, function (obj) {

                                        if (obj.ProductName + " (" + obj.ProductCode + ")" == ui.item.value)
                                            return obj.ProductName;
                                    });

                                    window.location = applicationUrl + '/Product/viewproduct/' + items[0].ProductId;

                                }

                            });
                        }

                    }//"All" End
                    else { //Other than "All" Option Start
                        var catArr = category.split(':');
                        var products = $.grep($scope.Products, function (obj, index) {

                            if (catArr[0] == "format") {
                                return obj.Formats.toLowerCase() == catArr[1]
                            }
                            else if (catArr[0] == "category") {
                                return obj.Categories.toLowerCase() == catArr[1]
                            }
                            else {
                                return obj.TopicCode.toLowerCase() == catArr[1].toLowerCase()
                            }
                        });
                        $scope.Products = unique(products);

                        //Searching with Category 
                        var searchedProducts = factorialSearch(products, searchWord);

                        //Search Dropdown other than all option
                        if (!(typeof searchedProducts === "undefined")) {
                            var Names = [];
                            Names = getDataInArray(searchedProducts);
                            $("#search").autocomplete({
                                source: function (request, response) {
                                    response(Names);
                                },
                                select: function (event, ui) {
                                    selItem = $.grep($scope.TempProducts, function (obj) {

                                        if (obj.ProductName + " (" + obj.ProductCode + ")" == ui.item.value)
                                            return obj;
                                    });
                                    $scope.$apply(function () {
                                        $scope.Products = selItem;
                                        $scope.Products = unique($scope.Products);
                                        $scope.totalProducts = $scope.Products.length;
                                        $scope.currentPage = 0;
                                    });
                                    //Product filter and search actions
                                    if ($scope.Products.length == 0) {
                                        $('#loadMsg').show();
                                        $('#loadMsg').text('No results found!');
                                        $scope.pageStartIndex = 0;
                                        $scope.pageDynamicCount = 0;
                                        sessionStorage.getItem("pageDynCount", 0);
                                    } else {
                                        $('#loadMsg').hide();
                                        $('#loadMsg').text('Loading Results...');
                                        if ($scope.totalProducts < $scope.pageSize) {
                                            $scope.pageDynamicCount = $scope.totalProducts;
                                        } else {
                                            if ($scope.pageSize == 'all') // Added to prevent pageDynamicCount value to became NaN
                                                $scope.pageSize = $scope.totalProducts; //
                                            $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                                        }
                                        $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                                    }
                                }
                            });
                        }

                    }//Other than "All" Option End
                    $scope.Products = unique($scope.Products);
                    $scope.totalProducts = $scope.Products.length;
                    $scope.currentPage = 0;

                    if ($scope.Products != null) {
                        //Product filter and search actions
                        if ($scope.Products.length == 0) {
                            $('#loadMsg').show();
                            $('#loadMsg').text('No results found!');
                            $scope.pageStartIndex = 0;
                            $scope.pageDynamicCount = 0;
                            sessionStorage.getItem("pageDynCount", 0);
                        } else {
                            $('#loadMsg').hide();
                            $('#loadMsg').text('Loading Results...');
                            if ($scope.totalProducts < $scope.pageSize || $scope.pageSize == 'all') {
                                $scope.pageDynamicCount = $scope.totalProducts;
                            } else {
                                $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                            }
                            $scope.pageStartIndex = $scope.currentPage * $scope.productsPerPage + 1;
                        }
                    }
                }
                else {
                    if ($scope.pageSize == 'all') {
                        $scope.Products = unique($scope.TempProducts);
                        $scope.totalProducts = $scope.Products.length;
                        $scope.currentPage = 0;
                        $scope.pageDynamicCount = $scope.totalProducts;
                    }
                }
            }

            //per page value update when Per page drop down change
            $scope.ProductsPerPage = function () {
                if ($scope.pageSize == "all") {
                    $scope.productsPerPage = 0;
                    $scope.currentPage = 0;
                    //Saving pagesize
                    $scope.pageStartIndex = 1;
                    $scope.pageDynamicCount = $scope.Products.length;
                    sessionStorage.setItem("tp", $scope.Products.length);
                    sessionStorage.setItem("pagesize", $scope.productsPerPage);
                }
                else {
                    if ($scope.pageSize > $scope.Products.length) {
                        $scope.pageDynamicCount = $scope.Products.length;
                        $scope.productsPerPage = $scope.pageSize;
                        $scope.pageStartIndex = 1;
                        $scope.currentPage = 0;
                    } else {
                        $scope.productsPerPage = $scope.pageSize;
                        $scope.pageStartIndex = 1;
                        $scope.pageDynamicCount = $scope.productsPerPage;
                        $scope.currentPage = 0;

                        //Saving pagesize 
                        sessionStorage.setItem("pagesize", $scope.productsPerPage);
                    }
                }
            }

            //Selected Product
            $scope.getSelProduct = function (event) {
                $scope.pdId = event.target.id;
                $($scope.Products).filter(function (index, value) {
                    if (value.ProductId == $scope.pdId) {
                        $scope.selectedProduct = value;
                    };
                });

                setTimeout(function () {
                    $('.product_quick_view').show();
                }, 100);
            }

            //Getting Cart details   
            $scope.TotalPrice = 0;
            $scope.TotalMPrice = 0;
            $scope.TotalLPrice = 0;

            //Adding Product To Cart
            $scope.getCartData = function () {
                urlService.dataProvider(cartDetailsMethod, "POST", '').success(function (data) {

                    if (data == "ADDED_FAIL") {
                        $scope.CartDetails = [];
                        $scope.TotalPrice = 0;
                        $scope.TotalMPrice = 0;
                        $scope.TotalLPrice = 0;
                        $scope.TotalItems = 0;
                        $scope.CartDetailsLength = '0';
                        jAlert('Unable to get cart details,Please try later.');
                    }
                    else if (data != "NO_DETAILS_FOUND") {

                        var totalCartPrice = 0, totalItems = 0;
                        var totalMCPrice = 0, totalLCPrice = 0;
                        //$.each(data, function (index, obj) {

                        //    if ($scope.sesUserIsMember == '1') {
                        //        totalCartPrice = totalCartPrice + (obj.Quantity * obj.product.MemberPrice);
                        //    } else {
                        //        totalCartPrice = totalCartPrice + (obj.Quantity * obj.product.Price);
                        //    }

                        //    totalMCPrice = totalMCPrice + (obj.Quantity * obj.product.MemberPrice);
                        //    totalLCPrice = totalLCPrice + (obj.Quantity * obj.product.Price);
                        //    //console.log('MC Price :' + totalMCPrice);
                        //    //console.log('LC Price :' + totalLCPrice);

                        //    totalItems = totalItems + (obj.Quantity);
                        //});

                        $scope.CartDetails = data;
                        $scope.CartDetailsLength = data.length; //$scope.CartDetails.length;
                        $scope.TotalPrice = totalCartPrice;
                        $scope.TotalMPrice = totalMCPrice;
                        $scope.TotalLPrice = totalLCPrice;
                        //console.log(totalCartPrice);
                        //console.log($scope.TotalPrice);
                        $scope.TotalItems = totalItems;

                    } else {

                        $scope.CartDetails = [];
                        $scope.TotalPrice = 0;
                        $scope.TotalMPrice = 0;
                        $scope.TotalLPrice = 0;
                        $scope.CartDetailsLength = '0';
                    }

                });
            };
            $scope.getCartData();
            //AddToCart
            $scope.AddToCart = function ($event, from) {
                // debugger;
                productCart.ProductAddToCart($event.target.id, $scope, from, $event);
            };

            //Open Cart
            $scope.OpenCart = function () {
                $(".my_cart_actions").show();
                /* selecting first tab always*/
                $(".stepContent").removeClass("step_active");
                $("#step1_MyCart").addClass("step_active");
                //Gettings Cart Information if available
                $scope.getCartData();

                //Gettings user address
                $scope.getAddressData();

                //Gettings user CreditCatds
                $scope.getCreditCardDetails();

                //Gettings ship Via Code
                $scope.shipViaCodeClient();

                setTimeout(function () {
                    $('#CartPopUp').addClass('is-visible');
                }, 500);

            }

            //Update Cart
            $scope.UpdateToCart = function () {
                if ($('#shipViaCodeDD').val() == "") {
                    $('#shipViaCodeDD').css('box-shadow', '0px 0px 2px #FF0000');
                    return;
                } else {
                    $('#shipViaCodeDD').removeAttr('style');
                    $scope.billingAddIdDiv = false;
                    $scope.shippingAddIdDiv = false;
                }

                if ($(".cartdetails").length > 0) {
                    $('#popLoader').show();
                } else {
                    $('#alrtMsg').empty();
                    var txtLgn = "No products to update!";
                    $('#alrtMsg').show().html(txtLgn);
                    return;
                }

                var errorFlag = false;
                var cartArguArray = [];
                $(".cartdetails").each(function () {
                    var i = 0;
                    var avlQty = $(this).next().text();
                    var quantity = $(this).val();
                    var productid = $(this).prop('id');
                    var from = "update";
                    var customOrStandard = $scope.viewUmbrellProductDD;
                    var shippreference = '';
                    if ($scope.shipViaCodeDD != undefined)
                        shippreference = $scope.shipViaCodeDD.Code;

                    //var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: customOrStandard, shipviacode: shippreference };
                    var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: "", shipviacode: shippreference };
                    //var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: customOrStandard };
                    //debugger;
                    if ($(this).attr("data-Inventoried") == "true") {
                        if (quantity != 0) {
                            if (parseFloat(avlQty) >= parseFloat(quantity)) {
                                //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {

                                //    $scope.getCartData();
                                //    $('#popLoader').hide();
                                //});
                                cartArguArray.push(cartArgu);
                            } else {
                                //if ($scope.product.BackorderAvailable == true) {
                                if ($scope.CartDetails[i].product.BackorderAvailable == true) {
                                    //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {

                                    //    $scope.getCartData();
                                    //    $('#popLoader').hide();
                                    //});
                                    cartArguArray.push(cartArgu);
                                } else {

                                    $('#popLoader').hide();
                                    //jAlert(' This Product Stock Availability upto ' + avlQty + '!');
                                    jAlert('There are only ' + avlQty + ' left in stock. Please lower your quantity selection.');
                                    errorFlag = true;
                                    return false;
                                }
                            }
                        } else {
                            //if ($scope.product.BackorderAvailable == true) {
                            if ($scope.CartDetails[i].product.BackorderAvailable == true) {
                                //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {
                                //    $scope.getCartData();
                                //    $('#popLoader').hide();
                                //});
                                cartArguArray.push(cartArgu);
                            } else {
                                $('#popLoader').hide();
                                jAlert(' Product Available in minimum quantities of 1 !');
                                errorFlag = true;
                                return false;
                            }
                        }
                        i++;
                    } else {
                        //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {
                        //    $scope.getCartData();
                        //    $('#popLoader').hide();
                        //});
                        cartArguArray.push(cartArgu);
                    }

                });
                if (errorFlag == false) {
                    urlService.dataProvider(addToCartMethod, "POST", { 'cItems': JSON.stringify(cartArguArray) }).success(function (data) {
                        $scope.getCartData();
                        $('#popLoader').hide();
                    });
                }
                return errorFlag;
            }

            //Delete Cart
            $scope.DeleteCart = function (productid) {
                productCart.ProductAddToCart(productid, $scope, 'delete', '');
            };

            //Add WishList Products
            var xId = [];
            $scope.AddToWishList = function (wId, CustomerID, x) {
                var wishlistId = '';
                //select & unselect wishlist icon
                $.grep($scope.Products, function (i) {
                    if (i.ProductId == wId) {
                        if (i.IsInWishList != true) {
                            i.IsInWishList = true;
                        }
                        else {
                            i.IsInWishList = false;
                        }
                    }
                });

                var addWishArgu = { ProductId: wId, CustomerID: CustomerID, From: 1 };
                urlService.dataProvider(saveWishlistMethod, "POST", addWishArgu).success(function (status) {

                    if (status == 3) {//Already Added
                    }

                });
            };

            //get WishList Products
            $scope.GetWishListItems = function (customerId) {
                var getWishListArgu = { CustomerID: customerId };
                urlService.dataProvider(getWishlistMethod, "POST", getWishListArgu).success(function (data) {
                    $scope.WishListItems = unique(data);
                    $.grep($scope.WishListItems, function (i) {
                        xId.push(i.ProductId);
                    });

                    //after reload Wishlist icon active state
                    $.grep(xId, function (item) {
                        $.grep($scope.Products, function (y) {
                            if (y.ProductId == item) {
                                if (y.IsInWishList != true)
                                    y.IsInWishList = true;
                                else
                                    y.IsInWishList = false;
                            }
                        });
                    });

                });//for
            }

            //Get Shipping & Billing Address
            var shipCustId = '';
            $scope.getAddressData = function () {
                urlService.dataProvider(GetAddressesMethod, "POST", '').success(function (data) {
                    if (data != "ADDED_FAIL") {
                        $scope.userAddress = data;
                        //console.log($scope.userAddress);

                        var addListCount = $scope.userAddress.AddressList.length;
                        //console.log($scope.userAddress)
                        //console.log($scope.userAddress.AddressList[0].FormattedAddress)
                        // Adding ShipToFlag default to scope ShippingAddresses
                        $scope.ShippingAddresses = [];
                        if (sessionStorage.getItem('ShippingIndex') != null) {
                            if (sessionStorage.getItem('ShippingIndex').length != 0) {
                                var sessionShippingIndexVal = $scope.userAddress.AddressList[sessionStorage.getItem('ShippingIndex')];
                                $scope.ShippingAddresses.push(sessionShippingIndexVal);
                            } else {
                                $.grep($scope.userAddress.AddressList, function (item) {
                                    if (item.ShipToFlag == true) {
                                        $scope.ShippingAddresses.push(item);
                                        shipCustId = item.CustomerAddressId;
                                        sessionStorage.setItem('ShippingCustId', item.CustomerAddressId);
                                    }
                                });
                            }
                        }
                        else {
                            $.grep($scope.userAddress.AddressList, function (item) {
                                if (item.ShipToFlag == true) {
                                    $scope.ShippingAddresses.push(item);
                                    shipCustId = item.CustomerAddressId;
                                    sessionStorage.setItem('ShippingCustId', item.CustomerAddressId);
                                }
                            });
                        }

                        // Adding BillToFlag default to scope BillingAddresses
                        $scope.BillingAddresses = [];
                        if (sessionStorage.getItem('BillingIndex') != null) {
                            if (sessionStorage.getItem('BillingIndex').length != 0) {
                                var sessionBillingIndexVal = $scope.userAddress.AddressList[sessionStorage.getItem('BillingIndex')];
                                $scope.BillingAddresses.push(sessionBillingIndexVal);
                            } else {
                                $.grep($scope.userAddress.AddressList, function (item) {
                                    if (item.BillToFlag == true) {
                                        $scope.BillingAddresses.push(item);
                                        sessionStorage.setItem('billingAdd', $scope.BillingAddresses[0].FormattedAddress);
                                        sessionStorage.setItem('BillingCustId', item.CustomerAddressId);
                                    }
                                });
                            }
                        } else {
                            $.grep($scope.userAddress.AddressList, function (item) {
                                if (item.BillToFlag == true) {
                                    $scope.BillingAddresses.push(item);
                                    sessionStorage.setItem('BillingCustId', item.CustomerAddressId);
                                    sessionStorage.setItem('billingAdd', $scope.BillingAddresses[0].FormattedAddress);
                                }
                            });
                        }

                        if ($scope.ShippingAddresses.length == 0)
                            $scope.ShippingAddresses = "Shipping Address is not available!";

                        if ($scope.BillingAddresses.length == 0)
                            $scope.BillingAddresses = "Billing Address is not available";

                        //Set Default address for Shipping and Billing
                        $scope.setDefaultAddress = function ($event, $index, container) {
                            $('#popLoader').show();
                            var addCurrType = $($event.target).attr('data-type');
                            var addCurrId = $($event.target).attr('data-addid');
                            urlService.dataProvider(setAddress, "POST", { addId: addCurrId, addtype: addCurrType }).success(function () {
                                if (data != "fail") {
                                    //jAlert("Address Changed Successfully!");
                                    $scope.taxShippingPrice();
                                    $scope.getCartData();
                                    $('#popLoader').hide();
                                }
                                //else{
                                //    jAlert("Please try again!");
                                //}

                            }).error(function (ex) {
                                $('#popLoader').hide();
                            });
                            //console.log($($event.target).parent())
                            if (addCurrType == "Billing") {
                                $scope.BillingAddresses = [];
                                $.grep($scope.userAddress.BillingAddresses, function (item) {
                                    item.BillToFlag = false
                                });
                                $scope.userAddress.BillingAddresses[$index].BillToFlag = "true";
                                var addressIndex = $scope.userAddress.BillingAddresses[$index];
                                $scope.BillingAddresses.push(addressIndex);
                                sessionStorage.setItem('BillingIndex', $index);
                                sessionStorage.setItem('BillingCustId', $scope.userAddress.BillingAddresses[$index].CustomerAddressId);
                                sessionStorage.setItem('billingAdd', $scope.BillingAddresses[$scope.BillingAddresses.length - 1].FormattedAddress);
                                $("#billingAddressList").find(".shwAddress").find(".default").hide();
                                $("#billingAddressList").find(".useAdd").removeClass("btn_active");
                                $($event.target).parent().find(".default").removeClass('ng-hide').show();
                                $("#billingAddressList").find($event.target).addClass("btn_active");
                            }

                            if (addCurrType == "Shipping") {
                                $scope.ShippingAddresses = [];
                                $.grep($scope.userAddress.ShippingAddresses, function (item) {
                                    item.ShipToFlag = false
                                });
                                $scope.userAddress.ShippingAddresses[$index].ShipToFlag = "true";
                                var addressIndex = $scope.userAddress.ShippingAddresses[$index];
                                shipCustId = $scope.userAddress.ShippingAddresses[$index].CustomerAddressId;
                                sessionStorage.setItem('ShippingIndex', $index);
                                sessionStorage.setItem('ShippingCustId', $scope.userAddress.ShippingAddresses[$index].CustomerAddressId);
                                $scope.ShippingAddresses.push(addressIndex);
                                $("#shippingAddressList").find(".shwAddress").find(".default").hide();
                                $("#shippingAddressList").find(".useAdd").removeClass("btn_active");
                                $($event.target).parent().find(".default").removeClass('ng-hide').show();
                                $("#shippingAddressList").find($event.target).addClass("btn_active");
                            }
                        }
                    }

                    //$(".shwAddress").width(addListCount * 270);
                    $scope.taxShippingPrice = function (shippreference) {
                        var shippreference = '';
                        if ($scope.shipViaCodeDD != undefined)
                            shippreference = $scope.shipViaCodeDD.Code;

                        var taxErrorFlag = true;
                        shipCustId = sessionStorage.getItem('ShippingCustId');
                        return $http({
                            method: "POST",
                            url: applicationUrl + '/Order/GetTax',
                            params: { ShippingId: shippreference },
                            contentType: "application/json; charset=utf-8",
                            dataType: "json"
                        }).success(function (data) {
                            if (data != "ADDED_FAIL") {
                                $scope.getTaxData = data;
                                $scope.shippingHandling = data.TotalShipping;
                                $scope.Tax = data.TotalTax;
                                //$scope.CouponSaving = data.Coupons.length == 0 ? null : data.Coupons[0].Amount;
                                //$scope.CouponSavingDesc = data.Coupons.length == 0 ? null : data.Coupons[0].Description;
                                var totolSaving = 0;
                                var couponDesc = '';
                                var packagedisc = 0;
                                for (var i = 0; i < data.Coupons.length; i++) {
                                    totolSaving = totolSaving + data.Coupons[i].Amount
                                    if (data.Coupons[i].Code == 'SYS_PCK_DISC')
                                        packagedisc = packagedisc + data.Coupons[i].Amount;
                                    if (couponDesc.length > 0)
                                        couponDesc = couponDesc + ', ';
                                    if (data.Coupons[i].Code != 'SYS_PCK_DISC')
                                        couponDesc = couponDesc + data.Coupons[i].Description;
                                }
                                $scope.PackageDiscount = packagedisc;
                                $scope.CouponSaving = totolSaving;
                                $scope.CouponSavingDesc = couponDesc;
                            } else {
                                $('#popLoader').hide();
                                jAlert('Internal Technical Error. Please try again!');
                                taxErrorFlag = false;
                                return false;
                            }
                            $('#popLoader').hide();
                        }).error(function (x) {
                            jAlert(x);
                        });
                        return taxErrorFlag;
                    }

                });
            };
            // End

            //Get Credit Card Details
            $scope.getCreditCardDetails = function () {
                urlService.dataProvider(GetCreditCardMethod, "POST", "").success(function (data) {
                    $scope.cCard = data;
                    //console.log($scope.cCard.length);

                    if ($scope.cCard.length == 0)
                        $("#useOtherVal").text("true");
                });
            };

            //End

            //Apply coupon
            $scope.ApplyCoupon = function (act) {
                var coupon = $("#txtCoupon").val();
                $('#popLoader').show();
                $scope.CouponApplied = false;
                if (coupon != "") {
                    urlService.dataProvider(applyCouponforOrder, "POST", { coupon: coupon, actionstring: act }).success(function (resultdata) {
                        if (resultdata.Success == true) {

                            $("#lblCouponMessage").html(resultdata.Message);
                            $("#lblCoupon").html(coupon);
                            $scope.shippingHandling = resultdata.Result.TotalShipping;
                            $scope.Tax = resultdata.Result.TotalTax;
                            if (resultdata.Result.Coupons.length > 0) {
                                var totolSaving = 0;
                                var couponDesc = '';
                                var packagedisc = 0;
                                for (var i = 0; i < resultdata.Result.Coupons.length; i++) {
                                    if (resultdata.Result.Coupons[i].Code == coupon && act == "apply")
                                        $scope.CouponApplied = true;
                                    totolSaving = totolSaving + resultdata.Result.Coupons[i].Amount
                                    if (resultdata.Result.Coupons[i].Code == 'SYS_PCK_DISC')
                                        packagedisc = packagedisc + resultdata.Result.Coupons[i].Amount;
                                    if (couponDesc.length > 0)
                                        couponDesc = couponDesc + ', ';
                                    if (data.Coupons[i].Code != 'SYS_PCK_DISC')
                                        couponDesc = couponDesc + resultdata.Result.Coupons[i].Description;
                                }
                                $scope.PackageDiscount = packagedisc;
                                $scope.CouponSaving = totolSaving;
                                $scope.CouponSavingDesc = couponDesc;
                            }
                            else if (resultdata.Result.Coupons.length <= 0) {
                                $scope.CouponSaving = null;
                            }

                            //$scope.CouponSavingDesc = resultdata.Result.Coupons.length == 0 ? null : resultdata.Result.Coupons[0].Description;
                        }
                        else {
                            $scope.CouponApplied = false;
                            $("#lblCouponMessage").html(resultdata.ErrorMessage);
                        }
                        $('#popLoader').hide();
                    }).error(function (ex) {
                        $('#popLoader').hide();
                    });
                }
                else {
                    $('#popLoader').hide();
                    jAlert('Please enter coupon to apply!');
                }
            };

            //Create Order
            $scope.placeOrder = function () {
                $('#popLoader').show();
                if (($scope.TotalPrice + $scope.Tax + $scope.shippingHandling) == 0) {
                    createOrderItem();
                }
                else if ($('input[id="useOther"]').is(':checked') || $("#useOtherVal").text() == "true") {
                    $scope.cValidation();
                    if (valid == true) {
                        if ($("#saveCCCard").is(":checked") == true) { //Save CreditCard Details
                            saveCreditCardDetails();
                        }
                        else {
                            createOrderItem();
                        }
                    }
                    else {
                        $('#popLoader').hide();
                    }
                } else {
                    createOrderItem();
                }

                function saveCreditCardDetails() {
                    $('#popLoader').show();
                    $('.errorMsg').empty();
                    var selectedRadioValue = $('input[name=cardType]:checked').val();

                    var CardType = selectedRadioValue,
                        CardHolderName = CCName.value,
                        CreditCardNumber = CCNumber.value,
                        CreditCardCVVNumber = CCcvv.value,
                        ExpireMonth = $scope.months,
                        ExpireYear = $scope.years;

                    var saveCCArgu = {
                        CardType: CardType,
                        CardNumber: CreditCardNumber,
                        Cvv: CreditCardCVVNumber,
                        ExpDate: ExpireMonth,
                        ExpYear: ExpireYear,
                        NameOnCard: CardHolderName
                    };
                    urlService.dataProvider(addCCardMethod, "POST", saveCCArgu).success(function (data) {
                        if (data.Success != true) {
                            jAlert(data.ErrorMessage);
                            //if (data != true) {
                            //jAlert('Please enter valid details!');
                            $('#popLoader').hide();
                            clearCC();
                            //}
                        }
                        else {
                            createOrderItem();
                        }
                    }).error(function (errorx) {
                        clearCC();
                        $('#popLoader').hide();
                        jAlert(errorx);
                    });
                }

                function createOrderItem() {
                    $('#popLoader').show();
                    var selectedRadioValue = $('input[name=cardType]:checked').val();
                    var CardType = selectedRadioValue,
                        CardHolderName = CCName.value,
                        CreditCardNumber = CCNumber.value,
                        CreditCardCVVNumber = CCcvv.value,
                        ExpireMonth = $scope.months,
                        ExpireYear = $scope.years,
                        userOption = $("#saveCCCard").is(":checked") == true ? true : false;

                    var saveCCArgu = {
                        CreditCardType: CardType,
                        CreditCardNumber: CreditCardNumber,
                        Cvv2: CreditCardCVVNumber,
                        ExpirationMonth: ExpireMonth,
                        ExpirationYear: ExpireYear,
                        NameOnCard: CardHolderName,
                        WantToSave: userOption
                    };

                    if ($scope.getTaxData.ValidationIssues != null) {
                        var validationRes = [];
                        var valiIssuItems = $(".taxValidationsIssues");
                        $(valiIssuItems).each(function (index) {
                            var thisKey = $(this).find("p.msg").attr("data-key");
                            var tempObj = {
                                Key: thisKey,
                                SeelctedValue: $(this).find("input[name='" + thisKey + "']:checked").val()
                            };
                            validationRes.push(tempObj);
                        });
                    }

                    var billingAddId = sessionStorage.getItem("BillingCustId");   //$('input[name="billingAddId"]:checked').attr('id');
                    var shippingAddId = sessionStorage.getItem("ShippingCustId"); //$('input[name="shippingAddId"]:checked').attr('id');
                    var ccId = $('input[id="ccType"]').is(':checked') == true ? $('input[id="ccType"]').attr('data-PartialCardNumber') : '';
                    var tax = $("#tax").text().replace('$', '');
                    var shippingPrice = $("#shippingHandling").text().replace('$', '');
                    var shippreference = $scope.shipViaCodeDD.Code;   //Added By Rakesh

                    //$('.cart-popup').removeClass('is-visible');
                    show();
                    var placeOrderArgu = {
                        billingAddId: billingAddId,
                        shippingAddId: shippingAddId,
                        ccId: ccId,
                        TotalTax: tax,
                        TotalShipping: shippingPrice,
                        shipViaCode: shippreference,
                        CreditCardInfo: $('input[id="useOther"]').is(':checked') == true || $("#useOtherVal").text() == "true" ? JSON.stringify(saveCCArgu) : null,
                        ValidationResponses: $scope.getTaxData.ValidationIssues != null ? JSON.stringify(validationRes) : ''
                    };
                    urlService.dataProvider(createOrderMethod, "POST", placeOrderArgu).success(function (d) {
                        //if (d != "ADDED_FAIL") {
                        if (d.Success == true) {
                            $scope.finalOrderNumber = d.Result.OrderNumber;
                            sessionStorage.setItem('orderNumber', $scope.finalOrderNumber);
                            $('.cart-popup').removeClass('is-visible');
                            window.location = applicationUrl + '/Product/orderConfirmation';
                            clearCC();
                            $('#popLoader').hide();
                        } else {
                            $('#popLoader').hide();
                            hide();
                            //clearCC();
                            //jAlert('Unable to place order Please try again!');
                            jAlert(d.ErrorMessage);

                            //$('.cart-popup').trigger('click');
                        }
                    }).error(function (x) {
                        $('#popLoader').hide();
                        hide();
                        clearCC();
                        jAlert(x.ErrorMessage);
                    });
                }
            };
            //add Credit Card
            //Months array
            $scope.monthList = ["Month", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
            $scope.months = $scope.monthList[0];

            //get Next 100 years and store into array var
            var years = [];
            var i;
            var getYear = new Date().getFullYear();
            for (i = 0; i <= 100; i++) {
                years.push(getYear);
                getYear = getYear + 1;
            }
            years.unshift('Year');
            $scope.yearList = years;
            $scope.years = $scope.yearList[0];

            var valid = true;
            $scope.cValidation = function () {
                valid = '';
                if (!$('input[name=cardType]').is(':checked')) {
                    $('input[name=cardType]').parent().find('.errorMsg').text('Please select card type!');
                    valid = false;

                } else {
                    $('input[name=cardType]').parent().find('.errorMsg').empty();
                }

                if (CCName.value == '') {
                    $('#CCName').next().text('Please enter the Card Holder name!');
                    valid = false;
                } else {
                    $('#CCName').next().empty();
                }
                if (CCNumber.value == '') {
                    $('#CCNumber').next().text('Please enter the Credit Card Number!');
                    valid = false;
                } else {
                    $('#CCNumber').next().empty();
                }
                if (CCcvv.value == '') {
                    $('#CCcvv').next().text('Please enter the CVV Number!');
                    valid = false;
                } else {
                    $('#CCcvv').next().empty();
                }

                if ($scope.months == 'Month') {
                    $('#months').next().text('Please select the month!');
                    valid = false;
                } else {
                    $('#months').next().empty();
                }
                if ($scope.years == 'Year') {
                    $('#years').next().text('Please select the Year!');
                } else {
                    $('#years').next().empty();
                }

                var today, someday;
                var exMonth = $scope.months;
                var exYear = $scope.years;
                today = new Date();
                someday = new Date();
                someday.setFullYear(exYear, exMonth, 1);

                if (someday < today) {
                    $('#years').next().text("The expiry date is before today's date. Please select a valid expiry date!");
                    valid = false;
                } else {
                    $('#years').next().empty();
                }

                if (valid.length == 0) {
                    valid = true
                } else {
                    valid = false
                }

                return valid;
            };

            //function clearCC() {
            //    $("#CCName").val('');
            //    $("#CCNumber").val('');
            //    $("#CCcvv").val('');
            //    $("#months").val("string:Month");
            //    $("#years").val('string:Year');
            //};

            //End

            //Getting Countries
            $scope.getCountries = function () {
                urlService.dataProvider(getCountryMethod, 'POST', '').success(function (data) {

                    if (data !== undefined) {
                        var CountryList = $.grep(data, function (i) {
                            return i.CountryCode != "[ALL]";
                        });
                        $scope.CountryList = CountryList.sort()
                        //$scope.Countrys = "All Countries";
                        /*selecting default Country*/
                        $.grep($scope.CountryList, function (obj) {
                            if (obj.CountryCode == "USA") {
                                $scope.Countrys = obj;
                                $scope.onCountryChange(obj);
                            }
                        });
                    }
                });
            };

            ////Getting States
            //$scope.getStates = function () {
            //    urlService.dataProvider(getStateMethod, 'POST', '').success(function (data) {
            //        $scope.StateList = data;
            //        $scope.TmpStateList = data;
            //        //$scope.States = $scope.StateList[0];
            //    });
            //};

            $scope.billingAddIdDiv = false;
            $scope.shippingAddIdDiv = false;

            $scope.addBtnClick = function (from) {
                $(".my_cart_actions").hide();
                if (from == "Shipping") {
                    $scope.billingAddIdDiv = false;
                    $scope.shippingAddIdDiv = true;
                    $scope.addressType = "Shipping Address";
                } else {
                    $scope.billingAddIdDiv = true;
                    $scope.shippingAddIdDiv = false;
                    $scope.addressType = "Billing Address";
                }
                $(".actions").hide();
            };

            $scope.cancelBtnClick = function () {
                $scope.billingAddIdDiv = false;
                $scope.shippingAddIdDiv = false;
                $scope.clearForm();
            };

            $scope.clearForm = function () {
                $(".my_cart_actions").show();
                $scope.addressType = $scope.shippingAddIdDiv == true ? 'Shipping Address' : 'Billing Address';
                //$scope.Countrys.CountryDescription = '';
                //$scope.Countrys.CountryCode = '';
                $.grep($scope.CountryList, function (obj) {
                    if (obj.CountryCode == "USA") {
                        $scope.Countrys = obj;
                        $scope.onCountryChange(obj);
                    }
                });
                $scope.address1 = '';
                $scope.address2 = '';
                $scope.city = '';
                //$scope.States = '';
                $scope.postCode = '';
            };

            //Selecty Country code to filter states list
            $scope.onCountryChange = function (a) {

                $scope.inputEnbl = false;

                if (a.CountryDescription != "All Countries") {
                    urlService.dataProvider(getStateMethod, 'POST', { 'countrycode': a.CountryCode }).success(function (data) {
                        //$scope.States = $scope.StateList;
                        if (data !== undefined && data.length != 0) {
                            $scope.StateList = data;
                            //console.log($scope.StateList)
                        } else {
                            $scope.States = " ";
                            $scope.inputEnbl = true;
                            $("input#States").val(' ');
                        }
                    });
                    //return
                }
                //filterting states based on Country selection

                //var result = $.grep($scope.TmpStateList, function (e) { return e.CountryCodeString == a.CountryCode });
                //if (result.length != 0) {
                //    $scope.StateList = result;
                //    $scope.States = $scope.StateList;
                //} else {
                //    //if states not available
                //    //$scope.StateList = [{ StateDescription: 'No States Available' }];
                //    $scope.inputEnbl = true;
                //    $("input#States").val('');
                //}

            };
            var stateCode = $('#States').val();

            var valid = true;

            //Address Form Validations
            $scope.validations = function () {
                valid = '';
                if ($('#addressType').val() == "") {
                    $('#addressType').next().text('Please select the Address Type!');
                    valid = false;
                } else {
                    $('#addressType').next().empty();
                }

                if ($('#Countrys').val() == '') {
                    $("#Countrys").next().text('Please select Country!');
                    valid = false;
                } else {
                    $('#Countrys').next().empty();
                }

                if ($('#States').val().trim() == "") {
                    if ($scope.inputEnbl != true)
                        $("#States").next().text('Please select State!');
                    else
                        $("#States").next().text('Please Enter State!');
                } else {
                    $('#States').next().empty();
                }
                if ($('#States').val() == "undefined") {
                    stateCode = '';
                } else {
                    stateCode = $('#States').val();
                }

                if (address1.value == '') {
                    $("#address1").next().text('Please enter the Address!');
                    valid = false;
                } else {
                    $('#address1').next().empty();
                }

                if (city.value == '') {
                    $("#city").next().text('Please enter the City!');
                    valid = false;
                } else {
                    $('#city').next().empty();
                }

                if (postCode.value == '') {
                    $("#postCode").next().text('Please enter the Postal Code!');
                    valid = false;
                } else {
                    $('#postCode').next().empty();
                }

                if (valid.length == 0) {
                    valid = true
                } else {
                    valid = false
                }

                return valid;
            };

            //Inserting Address
            $scope.addAddress = function () {
                $('#popLoader').show();
                $scope.validations();
                if (valid == true) {
                    $('.errorMsg').empty();

                    var newAddress = [{
                        addressType: $scope.addressType,
                        Country: $scope.Countrys.CountryDescription,
                        CountryCode: $scope.Countrys.CountryCode,
                        Address1: $scope.address1,
                        Address2: $scope.address2 || "",
                        City: $scope.city,
                        State: $("#States").val(),//,$scope.States.StateCode,
                        PostalCode: $scope.postCode
                        //Address1: address1.value,
                        //Address2: address2.value,
                        //City: city.value,
                        //State: stateCode,
                        //PostalCode: postCode.value
                    }];

                    var saveAddArgu = { AddressObj: newAddress }
                    urlService.dataProvider(addAddressMethod, "POST", saveAddArgu).success(function (data) {

                        if (data != "ADDED_FAIL") {
                            $('#popLoader').hide();
                            jAlert('Address Added Successfully!');
                            $('#addAddress').hide();
                            $('.actions').show();
                            $scope.addressType = '';
                            $scope.Countrys.CountryDescription = '';
                            $scope.Countrys.CountryCode = '';
                            $scope.address1 = '';
                            $scope.address2 = '';
                            $scope.city = '';
                            //$scope.States = $scope.StateList[0];
                            $scope.postCode = '';
                            //Update the existing address after new address added - Start
                            urlService.dataProvider(GetAddressesMethod, "POST", '').success(function (d) {
                                $scope.userAddress = d;
                                $.grep($scope.userAddress.AddressList, function (item) {
                                    item.BillToFlag = false;
                                    item.ShipToFlag = false;
                                });

                                $.grep(d.AddressList, function (i) {
                                    if (i.CustomerAddressId == data.CusAddressId) {
                                        if ($(addressType).val() == "Billing Address") {
                                            i.BillToFlag = true;
                                            $scope.BillingAddresses = [];
                                            $scope.BillingAddresses.push(i);
                                            //console.log($scope.BillingAddresses);
                                            sessionStorage.setItem('billingAdd', $scope.BillingAddresses[0].FormattedAddress);
                                            sessionStorage.setItem('BillingCustId', data.CusAddressId);
                                        } else {
                                            //if ($(addressType).val() == "Shipping Address") {
                                            i.ShipToFlag = true;
                                            $scope.ShippingAddresses = [];
                                            $scope.ShippingAddresses.push(i);
                                            sessionStorage.setItem('ShippingAdd', $scope.ShippingAddresses[0].FormattedAddress);
                                            sessionStorage.setItem('ShippingCustId', data.CusAddressId);
                                        }
                                        return
                                    }
                                    //    }
                                });
                                $scope.billingAddIdDiv = false;
                                $scope.shippingAddIdDiv = false;
                            });//End

                        } else {
                            $('#popLoader').hide();
                            //jAlert('Please enter valid details!');
                            jAlert('Address not found');
                        }
                    }).error(function (x) {
                        $('#popLoader').hide();
                        jAlert(x);
                    });
                } else {
                    $('#popLoader').hide();
                    $(".my_cart_actions").show();
                    return
                }
                $(".my_cart_actions").show();
            };

            //Get Param by regular Expression
            function getParameterByName(name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };

            $scope.searchLoad = function () {
                var wL = window.location + '';
                var wLArray = wL.split('/');
                var indexUrl = wLArray.indexOf("search");
                if (wLArray[indexUrl] == "search") {
                    var topSearch = $("#topSearch").val(getParameterByName("SearchValue"));
                    $scope.SearchProducts();
                }
            };

            function ClearFillter() {
                sessionStorage.removeItem("Format");
                sessionStorage.removeItem("Category");
                sessionStorage.removeItem("Topic");
                sessionStorage.removeItem("nonmember");
                sessionStorage.removeItem("member");
            };

            //ng-repeat callback function
            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                slideShow();
                if ($scope.sesCustomerId != '') {
                    $scope.GetWishListItems($scope.sesCustomerId);
                }
                //$scope.querySearch();
            });

            $('#search').on('input', function (e) {
                if ('' == this.value) {
                    $scope.listProducts();
                    if ($scope.pageSize == 'all') // Added to prevent pageDynamicCount value to became NaN
                    {
                        $scope.pageSize = $scope.totalProducts; //
                        $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                        $scope.pageSize = 'all'
                    }
                    else {
                        $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                    }
                }
            });
            show();
            //delay in function, to get the DOM elements

            if (window.location.search != '') {

                sessionStorage.removeItem("Format");
                sessionStorage.removeItem("Category");
                sessionStorage.removeItem("Topic");
                sessionStorage.removeItem("member");
                sessionStorage.removeItem("nonmember");

                $timeout(function () {
                    $scope.querySearch = function () {
                        var count = 0;
                        var winSearchStr = window.location.search;
                        var searchValue = winSearchStr.replace('?', '').split('=');
                        if (window.location.search != '') {
                            if (searchValue[1] == "all") {
                                $('.' + searchValue[0]).attr("checked", true);
                            } else {
                                var catItemsList = searchValue[1];
                                var filterItems = catItemsList.split(',');
                                //start filtering the query string
                                $.grep(filterItems, function (item, index) {
                                    //Category section
                                    if (searchValue[0].toLowerCase() == "format") {
                                        $.grep($scope.catList.Formats, function (j) {
                                            if (j.Description.toLowerCase() == decodeURIComponent(item).toLowerCase()) {
                                                $('.' + searchValue[0]).each(function () {
                                                    if ($(this).attr('id') == j.FormatId)
                                                        $(this).attr("checked", true);
                                                });
                                                //console.log(j.FormatId);
                                            }
                                        });
                                        return
                                    }
                                    //Category section
                                    if (searchValue[0].toLowerCase() == "category") {
                                        $.grep($scope.catList.Categories, function (e) {
                                            if (e.CategoryName.toLowerCase() == decodeURIComponent(item).toLowerCase()) {
                                                $('.' + searchValue[0]).each(function () {
                                                    if ($(this).attr('id') == e.CategoryId)
                                                        $(this).attr("checked", true);
                                                });
                                                //console.log(e.CategoryId);
                                            }
                                        });
                                        return
                                    }
                                    //Topic section
                                    if (searchValue[0].toLowerCase() == "topic") {
                                        $.grep($scope.catList.Topics, function (t) {
                                            if (t.TopicDescription.toLowerCase() == decodeURIComponent(item).toLowerCase()) {
                                                $('.' + searchValue[0]).each(function () {
                                                    if ($(this).attr('id') == t.TopicID)
                                                        $(this).attr("checked", true);
                                                });
                                                //console.log(t.TopicID);
                                            }
                                        });
                                        return
                                    }
                                    //Member For section
                                    if (searchValue[0].toLowerCase() == "membertype") {
                                        //$.grep($scope.catList.Topics, function (j) {                                    
                                        if (decodeURIComponent(item).toLowerCase().toString() == "memberproducts" || decodeURIComponent(item).toLowerCase().toString() == "member products")
                                            $('input[id="memberUser"]').attr("checked", true);
                                        else
                                            $('input[id="nonMemberUser"]').attr("checked", true);
                                    }
                                    return
                                })
                                hide();
                            }//else End
                        }//if End

                        //updating data scope as per the query string

                        console.log("$scope.BindProducts() 2");

                        var c1 = getUrlParameter("Category");
                        if (c1.length > 0) {
                            c1 = c1.replace('%20', ' ').replace("'", "\'"); console.log("c1", c1);
                            if (c1.length > 0) {
                                var c1array = c1.split(','); console.log("c1array", c1array);
                                var arrayLength1 = c1array.length; console.log("arrayLength1", arrayLength1);
                                for (var i = 0; i < arrayLength1; i++) {
                                    console.log("i", i, c1array[i]);
                                    var f1 = $('div.catMenu:first label.checkbox-label:contains("' + c1array[i] + '")');
                                    console.log("f1", f1, $(f1).length);
                                    if (!$(f1).is(':checked')) {
                                        $(f1).prev().prop("checked", true);
                                    }
                                }
                            }
                        }

                        var c2 = getUrlParameter("SubCategory");
                        if (c2.length > 0) {
                            c2 = c2.replace('%20', ' ').replace("'", "\'"); console.log("c2", c2);
                            if (c2.length > 0) {
                                var c2array = c2.split(','); console.log("c2array", c2array);
                                var arrayLength2 = c2array.length; console.log("arrayLength2", arrayLength2);
                                for (var j = 0; j < arrayLength2; j++) {
                                    console.log("j", j, c2array[j]);
                                    var f2 = $('div.catMenu:last label.checkbox-label:contains("' + c2array[j] + '")');
                                    console.log("f2", f2, $(f2).length);
                                    if (!$(f2).is(':checked')) {
                                        $(f2).prev().prop("checked", true);
                                    }
                                }
                            }
                        }

                        $scope.BindProducts();

                    }
                    $scope.querySearch();
                }, 2000);
            };

            //ShipViaCodes
            $scope.shipViaCodeClient = function () {
                urlService.dataProvider(shipViaCodeMethod, 'POST', '').success(function (data) {
                    $scope.shipViaCode = data;
                    $scope.shipViaCodeDD = $scope.shipViaCode[0];
                }).error(function (x) {
                });
            };

            //get Favourites Products
            $scope.GetFavouriteItems = function (Masterid) {
                var getFavouritesArgu = { masterid: Masterid };
                urlService.dataProvider(getFavouriteItems, "POST", getFavouritesArgu).success(function (data) {
                    $scope.FavouriteItems = unique(data);
                });//for
            };

            if ($scope.sesCustomerId != '') {

                //Getting User Favourite Items with customer Id
                $scope.GetFavouriteItems($scope.sesCustomerId);

                //Getting Shipping Charges based on the locations
                $scope.shipViaCodeClient();

                //Getting Countries
                $scope.getCountries();

                //Getting States
                //$scope.getStates();

            }

            $scope.LoginPopup = function () {
                // var currentUrl = window.location + ''
                // window.location.href = "http://172.16.0.128/Login/?returnURL=" + currentUrl + "/&SSOL=Y";
                setTimeout(function () {
                    if ($scope.sesCustomerId == '') {

                        $('#LoginPopup').addClass('is-visible');
                    } else {
                        var currentUrl = window.location + '';
                        //window.location.href = applicationUrl + "/Login/Index" + '?url=' + currentUrl;
                        $('#LoginPopup').addClass('is-visible');
                    }
                },
                    500);
            }

            $scope.Login = function () {
                $scope.UserId = '';
                var username = $scope.UserName;
                if (isNumeric(username) == 1) {
                    $scope.UserId = lpad(username, 8);
                }
                else {
                    $scope.UserId = username;
                }

                function isNumeric(input) {
                    return (input - 0) == input && (input + '').replace(/^\s+|\s+$/g, "").length > 0;
                }

                function lpad(value, padding) {
                    var zeroes = "0";
                    for (var i = 0; i < padding; i++) { zeroes += "0"; }
                    return (zeroes + value).slice(padding * -1);
                }

                if (typeof $scope.UserName === "undefined" || $scope.UserName == "") {
                    jAlert("Please Enter Username.");
                } else if (typeof $scope.Password == "undefined" || $scope.Password == '') {
                    jAlert("Please Enter Password.");
                } else {
                    $("#LoginPopup").find('#LoginpopLoader').show();
                    var ChkRememberMe = $("#ChkRM").is(":checked");
                    var currentUrl = window.location.href;
                    var commeArgu = { Email: $scope.UserId, Password: $scope.Password, CurrentUrl: currentUrl, RememberMe: ChkRememberMe };
                    urlService.dataProvider(LoginInfo, "POST", commeArgu).success(function (response) {
                        if (response.Success) {
                            debugger;
                            if (!response.GDPR) {

                                $('#GDPRPopup').addClass('is-visible');

                            }
                            else {
                                window.location.href = response.SSOURL;
                                //window.location.href = currentUrl;
                                $scope.UserName = '';
                                $scope.Password = '';
                            }

                        }
                        else {
                            $('#LoginPopup').addClass('is-visible');
                            jAlert("Please Enter valid Username and Password.");
                            $("#LoginPopup").find('#LoginpopLoader').hide();
                            return;
                        }

                    });

                }

            };
        }]);

