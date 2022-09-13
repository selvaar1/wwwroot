AoaShopping.controller('viewProductController',
    ['$http'
        , '$scope'
        , 'urlService'
        , 'productCart'
        , '$cookies'
        , '$cookieStore'
        , '$rootScope'
        , '$window'
        , function ($http
            , $scope
            , urlService
            , productCart
            , $location
            , $cookies
            , $cookieStore
            , $rootScope
            , $window) {

            "user strict";

            //Session variable data
            var pageLoad = false;
            $scope.sesCustomerId = '';
            $scope.sesToken = '';
            $scope.sesCustomerName = '';
            $scope.sesUserIsMember = '';
            $scope.viewUmbrellProducts = [];
            $scope.recentView = [];
            $scope.viewUmbrellSelectProduct = '';
            $scope.Products = '';
            $scope.viewProduct = '';
            $scope.rating = 0;
            $scope.showDetails = false;

            $scope.currentPage = 0;
            $scope.ordersPerPage = 2;
            $scope.Orders = '';
            $scope.pageSize = "2";
            $scope.pageStartIndex = '';
            $scope.pageDynamicCount = $scope.ordersPerPage;
            $scope.totalOrders = '';
            $scope.currentdate = new Date();
            $scope.IsOrderHistoryByDates = false;
            $scope.IsSearchOrderHistory = false;
            // <!--
            $scope.lastSelectObj = '';
            // -->
            var noimgurl = applicationUrl + '/Images/Image-not-available.png';
            var wL = window.location + '';
            var wLArray = wL.split('/');

            //getCategories
            urlService.dataProvider(categoryMethod, "GET", '').success(function (data) {
                $scope.catList = data;
            });

            //Cart Implementation
            var lSRcentItem = [];
            $scope.listProducts = function () {
                urlService.dataProvider(allProductsMethod, "POST", '').success(function (data) {
                    $scope.TempProducts = data;
                    $scope.Products = unique($scope.TempProducts);
                    $scope.ServerProducts = data;
                    $scope.totalProducts = $scope.Products.length;
                    $scope.searchLoad();

                    ////LocalStorage RecentItems
                    //if (localStorage.getItem("RecentItems") != null) {
                    //    var lSRecentItems = localStorage.getItem("RecentItems").split(",");
                    //    $.grep($scope.Products, function (key, index) {
                    //        $.grep(lSRecentItems, function (j, i) {
                    //            if (j != $scope.id) {
                    //                if (key.ProductId == j) {
                    //                    lSRcentItem.push(key);
                    //                }
                    //            }
                    //        });
                    //    });
                    //};
                    //$scope.recentView = lSRcentItem;

                    hide();
                });
            };
            if (window.location.href.indexOf("OrderHistory") == -1)
                $scope.listProducts();

            //Get sessioninfo
            $scope.sessionDetails = function () {
                urlService.dataProvider(sessionMethod, "POST", '').success(function (data) {
                    $scope.sesCustomerId = data[0].CustomerId;
                    $scope.sesToken = data[0].Token;
                    $scope.sesCustomerName = data[0].CustomerName;
                    $scope.sesUserIsMember = data[0].IsMember;
                    $scope.userEmail = data[0].Email;

                    var indexFavUrl = wLArray.indexOf("Favourites");
                    if (wLArray[indexFavUrl] == "Favourites") {
                        if ($scope.sesCustomerId != '') {
                            //Getting User Favourite Items with customer Id
                            $scope.GetFavouriteItems($scope.sesCustomerId);
                        }
                    }
                    /* To Open Popup after login */
                    if (sessionStorage.getItem("CustomPro") == "fromCompse") {
                        if (!sessionStorage.getItem("UMBID")) {
                            var cprt = window.location.search.split("=")[1];
                            var isprodmemonly = window.location.search.split("=")[2];
                        }
                        else {
                            var cprt = sessionStorage.getItem("UMBID");
                            var isprodmemonly = sessionStorage.getItem("UMBID_IsMem") == "true" ? true : false;

                        }
                        show();
                        if ($scope.sesUserIsMember != "1" && isprodmemonly) {
                            jAlert('This Product is only for members.');
                            sessionStorage.removeItem("CustomPro");
                            return false
                        } else {
                            $scope.ProductCompose(cprt, '', cprt, isprodmemonly);
                        }
                    }
                });

            }
            $scope.sessionDetails();

            //Get Param by regular Expression
            function getParameterByName(name) {
                 
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }
            //debugger;
            ////Assigning param valur to scope.id
            //$scope.id = getParameterByName("ProductId").replace("/", "");
            var sPageURL = window.location.href.split('/');
            var index = sPageURL.indexOf("viewproduct");
            $scope.id =sPageURL[index + 1];
  
            //Getting data by scope.id
            console.log(" $scope.id", $scope.id);

            if ($scope.id.indexOf("?") > 0) {
                $scope.id = $scope.id.substr(0, $scope.id.indexOf("?"));
            }

            console.log("$scope.id", $scope.id);

            var indexUrl = wLArray.indexOf("viewproduct");
            if (wLArray[indexUrl] == "viewproduct") {
                show();
                (function () {
                    return $http({
                        method: "GET",
                        url: applicationUrl + '/Product/GetProductDetails',
                        params: { ProductId: $scope.id },
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    }).success(function (data) {

                        if (data != "ERROR_FAIL") {
                            $scope.viewProduct = data;
                            //console.log($scope.viewProduct);
                            $scope.productRatingCount = $scope.viewProduct.RatingCount;
                            //updateRatings($scope.viewProduct.Rating);
                            //console.log($scope.viewProduct.QuantityDiscounts.length);
                            //if Umbrella Product true Method
                            if ($scope.viewProduct.IsUmbrellaProduct == true) {
                                $http({
                                    method: "GET",
                                    url: applicationUrl + '/Product/GetSubProductDetails',
                                    params: { ProductId: $scope.id },
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json"
                                }).success(function (data) {
                                    $scope.viewUmbrellProducts = data;
                                }).error(function (x) {
                                });
                            }

                            //Get Related & Recent & favourite Products
                            $scope.GetrelatedItems();
                            $scope.GetrecentlyItems();

                            //Load Reviews
                            $scope.loadReviews($scope.id, 9);
                            hide();
                        }
                        else {
                            jAlert('Unable to get product details,Please try later.');
                        }
                    }).error(function (x) {
                    });
                })();
            };

            $scope.IsUmbrellaProductTrue = true;
            $scope.IsUmbrellaProductElements = false;
            $scope.IsUmbrellaProductAddToCart = false;
            // <!-- 
            var lastActivityOpt1, lastActivityOpt2;
            // -->
            $scope.onProductChange = function ($event) {
                $(".preImageLoader").show();
                /* To Open Popup after login */
                setTimeout(function () {
                    if ($scope.sesCustomerId == '') {
                        sessionStorage.setItem("UMBID", $(".ProductCompose").attr("data-prdId"));
                        sessionStorage.setItem("UMBID_IsMem", $(".ProductCompose").attr("data-ismem"));
                    }
                }, 2000);

                $("#CreateProof").attr("data-umb", "true").attr("data-parenetId", $("#parentId").text());
                $(document.body).off();

                if ($('#prdQuantity').val() == "") {
                    $('#prdQuantity').css('box-shadow', '0px 0px 2px #FF0000');
                } else {
                    $('#prdQuantity').removeAttr('style');
                }

                if ($('#viewUmbrellProductDD').val() == "") {
                    $('#viewUmbrellProductDD').css('box-shadow', '0px 0px 2px #FF0000');
                } else {
                    if ($('#prdQuantity').val() == "") {
                        // <!-- 
                        $scope.viewUmbrellProductDD = "";
                        setTimeout(function () {
                            isUmbrellaProdTrue();
                        }, 500);
                        $(".preImageLoader").hide();
                        return false;
                        // -->
                    } else {
                        $('#viewUmbrellProductDD').removeAttr('style');
                    }
                }
                //This will define the Zoom Image change state
                //child = 1;
                //zoomImage("On Change");

                // <!-- 
                var imgGallery = [];
                // -->
                function isUmbrellaProdTrue() {
                    // <!-- 
                    // in this last && condition added
                    if ($("#viewUmbrellProductDD").val() == "" && $("#viewUmbrellProductDD").is(":visible") == true && $("#prdQuantity").val() == "") {
                        // -->
                        $scope.IsUmbrellaProductTrue = true;
                        $scope.IsUmbrellaProductElements = false;
                        $scope.IsUmbrellaProductAddToCart = false;
                        $scope.viewUmbrellSelectProduct = $scope.viewUmbrellProducts;
                        //This will define the Zoom Image change state
                        //child = 0;
                        //zoomImage("viewUmbrellProductDD index 0");
                        //updateRatings($scope.viewProduct.Rating);
                        $scope.productRatingCount = $scope.viewProduct.RatingCount;
                        $scope.loadReviews($scope.id, 9);
                        // <!-- 
                        $(".sp-large").remove();
                        $(".sp-thumbs").remove();
                        setTimeout(function () {
                            $('.sp-wrap').smoothproducts();
                            if ($(".product_img").index("a") == -1 && $(".product_img").index("div") == -1) {
                                $(".product_img").append("<img src='http://avenir-it.com/HRMS/Images/Image-not-available.png' alt='' />");
                            }
                            $(".preImageLoader").hide();
                        }, 2000);
                        return false;
                        // -->
                    }
                    if ($("#prdQuantity").val() == "") {
                        //jAlert("Please select Quantity!");
                        $scope.IsUmbrellaProductTrue = true;
                        $scope.IsUmbrellaProductElements = false;
                        $scope.IsUmbrellaProductAddToCart = false;
                        $scope.viewUmbrellSelectProduct = $scope.viewUmbrellProducts;
                        //This will define the Zoom Image change state
                        //child = 0;
                        //zoomImage("prdQuantity index 0");
                        $(".sp-large").remove();
                        $(".sp-thumbs").remove();
                        setTimeout(function () {
                            $('.sp-wrap').smoothproducts();
                            if ($(".product_img").index("a") == -1 && $(".product_img").index("div") == -1) {
                                $(".product_img").append("<img src='" + noimgurl + "' alt='' />");
                            }
                            $(".preImageLoader").hide();
                        }, 1000);
                        //updateRatings($scope.viewProduct.Rating);
                        $scope.productRatingCount = $scope.viewProduct.RatingCount;
                        $scope.loadReviews($scope.id, 9);
                    }
                }

                if (($scope.viewUmbrellProducts.SubProductOption02).length == 0) {
                    if ($("#prdQuantity").val() == "") {
                        isUmbrellaProdTrue();
                    } else {
                        $.grep($scope.viewUmbrellProducts.UmbrellaSubProducts, function (obj) {
                            if (obj.Option1Subcode == $('#prdQuantity').val()) {
                                $scope.viewUmbrellSelectProduct = obj;
                                if ($scope.viewUmbrellSelectProduct.LongDescription == null || $scope.viewUmbrellSelectProduct.LongDescription.length <= 0)
                                    $(".moreDetails").hide();
                                else
                                    $(".moreDetails").show();
                                $scope.productRatingCount = $scope.viewUmbrellSelectProduct.RatingCount;
                                //updateRatings($scope.viewUmbrellSelectProduct.Rating);
                                $scope.loadReviews($scope.viewUmbrellSelectProduct.ProductId, 9);
                            }
                        });
                        //updating product gallery if data source is null
                        var imgGallery = [];
                        if ($scope.viewUmbrellSelectProduct.ProductGalleryImgs == null) {
                            imgGallery.push($scope.viewUmbrellSelectProduct.ProductImage);
                            $scope.viewUmbrellSelectProduct.ProductGalleryImgs = imgGallery;
                            $(".sp-large").remove();
                            $(".sp-thumbs").remove();
                            setTimeout(function () {
                                $('.sp-wrap').smoothproducts();
                                if ($(".product_img").index("a") == -1 && $(".product_img").index("div") == -1) {
                                    $(".product_img").append("<img src='" + noimgurl + "' alt='' />");
                                }
                                $(".preImageLoader").hide();
                            }, 2000);
                        } else {
                            $scope.viewUmbrellSelectProduct.ProductGalleryImgs = $scope.viewUmbrellSelectProduct.ProductGalleryImgs;
                            $(".sp-large").remove();
                            $(".sp-thumbs").remove();
                            setTimeout(function () {
                                $('.sp-wrap').smoothproducts();
                                if ($(".product_img").index("a") == -1 && $(".product_img").index("div") == -1) {
                                    $(".product_img").append("<img src='" + noimgurl + "' alt='' />");
                                }
                                $(".preImageLoader").hide();
                            }, 2000);
                        }

                        //Enable data divs for umbrella products
                        $scope.IsUmbrellaProductTrue = false;
                        $scope.IsUmbrellaProductElements = true;
                        $scope.IsUmbrellaProductAddToCart = true;
                    }
                } else {

                    if ($("#viewUmbrellProductDD").val() != "" && $('#prdQuantity').val() != "") {
                        // <!-- 
                        $scope.viewUmbrellSelectProduct = '';
                        // -->
                        $.grep($scope.viewUmbrellProducts.UmbrellaSubProducts, function (obj) {
                            if (obj.Option1Subcode == $scope.prdQuantity.OptionMasterListCode && obj.Option2Subcode == $scope.viewUmbrellProductDD.OptionMasterListCode) {

                                $scope.viewUmbrellSelectProduct = obj;
                                $scope.productRatingCount = $scope.viewUmbrellSelectProduct.RatingCount;
                                //updateRatings($scope.viewUmbrellSelectProduct.Rating);
                                $scope.loadReviews($scope.viewUmbrellSelectProduct.ProductId, 9);
                            }
                        });

                        // <!-- 
                        if ($scope.viewUmbrellSelectProduct != "") {
                            $scope.lastSelectObj = $scope.viewUmbrellSelectProduct;
                            lastActivityOpt1 = $('#prdQuantity')[0].selectedIndex;
                            lastActivityOpt2 = $('#viewUmbrellProductDD')[0].selectedIndex;

                        } else {
                            if ($('#viewUmbrellProductDD').val() != "") {
                                jAlert("No Products Available");
                                $scope.viewUmbrellSelectProduct = $scope.lastSelectObj;
                                $scope.prdQuantity = $scope.viewUmbrellProducts.SubProductOption01[parseInt(lastActivityOpt1) - 1];
                                $scope.viewUmbrellProductDD = $scope.viewUmbrellProducts.SubProductOption02[parseInt(lastActivityOpt2) - 1];
                                $(".preImageLoader").hide();
                                return false;
                            } else {
                                isUmbrellaProdTrue();
                                $(".preImageLoader").hide();
                            }
                        };
                        // -->

                        var imgGallery = [];
                        if ($scope.viewUmbrellSelectProduct.ProductGalleryImgs == null) {
                            imgGallery.push($scope.viewUmbrellSelectProduct.ProductImage);
                            $scope.viewUmbrellSelectProduct.ProductGalleryImgs = imgGallery;
                            $(".sp-large").remove();
                            $(".sp-thumbs").remove();
                            setTimeout(function () {
                                $('.sp-wrap').smoothproducts();
                                if ($(".product_img").index("a") == -1 && $(".product_img").index("div") == -1) {
                                    $(".product_img").append("<img src='" + noimgurl + "' alt='' />");
                                }
                                $(".preImageLoader").hide();
                            }, 2000);
                        } else {
                            $scope.viewUmbrellSelectProduct.ProductGalleryImgs = $scope.lastSelectObj.ProductGalleryImgs;
                            $(".sp-large").remove();
                            $(".sp-thumbs").remove();
                            setTimeout(function () {
                                $('.sp-wrap').smoothproducts();
                                if ($(".product_img").index("a") == -1 && $(".product_img").index("div") == -1) {
                                    $(".product_img").append("<img src='" + noimgurl + "' alt='' />");
                                }
                                $(".preImageLoader").hide();
                            }, 2000);
                            $(".preImageLoader").hide();
                        }

                        //Enable data divs for umbrella products
                        $scope.IsUmbrellaProductTrue = false;
                        $scope.IsUmbrellaProductElements = true;
                        $scope.IsUmbrellaProductAddToCart = true;

                    } else {
                        isUmbrellaProdTrue();
                        $(".preImageLoader").hide();
                    }
                }

            };

            //viewUmbrellProductsShortDescription
            urlService.dataProvider(cartDetailsMethod, "POST", '').success(function (data) {
                $scope.viewCartData = data;
            });

            //Getting Cart details  
            $scope.TotalPrice = 0;
            $scope.TotalMPrice = 0;
            $scope.TotalLPrice = 0;

            $scope.GetCartProducts = function (from) {
                from = from || '';
                var catUrl = applicationUrl + '/Product/GetCartDetails';
                return $http({
                    method: "POST",
                    url: catUrl,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (data) {

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

                        if (from == "delete" || from == "update") {
                            $scope.viewCartData = data;
                        }

                        //Caliculating Total Price
                        var totalPrice = 0, totalItems = 0;
                        var totalMPrice = 0, totalLPrice = 0;
                        //$.each(data, function (index, obj) {

                        //    if ($scope.sesUserIsMember == "1") {
                        //        totalPrice = totalPrice + (obj.Quantity * obj.product.MemberPrice);
                        //    } else {
                        //        totalPrice = totalPrice + (obj.Quantity * obj.product.Price);
                        //    }
                        //    totalMPrice = totalMPrice + (obj.Quantity * obj.product.MemberPrice);
                        //    totalLPrice = totalLPrice + (obj.Quantity * obj.product.Price);
                        //    //console.log('M Price :' + totalMPrice);
                        //    //console.log('L Price :' + totalLPrice);

                        //    totalItems = totalItems + (obj.Quantity);

                        //});
                        $scope.CartDetails = data;
                        $scope.CartDetailsLength = data.length; //$scope.CartDetails.length;
                        $scope.TotalPrice = totalPrice;
                        $scope.TotalMPrice = totalMPrice;
                        $scope.TotalLPrice = totalLPrice;
                        //console.log(totalCartPrice);
                        //console.log($scope.TotalPrice);
                        $scope.TotalItems = totalItems;

                    }
                    else {

                        $scope.CartDetails = [];
                        $scope.TotalPrice = 0;
                        $scope.TotalMPrice = 0;
                        $scope.TotalLPrice = 0;
                        $scope.TotalItems = 0;
                        $scope.CartDetailsLength = '0';

                    }

                }).error(function (x) {
                });
            }
            $scope.GetCartProducts();
            $scope.cartSuccess = '';



            //Adding Product To Cart
            $scope.AddToCart = function (productid, $event, from) {
                 
                productCart.ProductAddToCart(productid, $scope, from, $event);
            };

            //Open Cart
            $scope.OpenCart = function () {
                $(".my_cart_actions").show();
                $scope.GetCartProducts();

                //Gettings user CreditCatds
                $scope.getCreditCardDetails();

                //Gettings ship Via Code
                $scope.shipViaCodeClient();

                setTimeout(function () {
                    $('#CartPopUp').addClass('is-visible');
                    $('#step1_MyCart').addClass('step_active').siblings().removeClass('step_active');
                }, 500);
            }

            //Update Cart
            $scope.UpdateToCart = function (from) {
                //debugger;
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

                var selector = "";
                var viewcartflag = false;

                if (from == "viewcart") {
                    viewcartflag = true;
                    selector = ".qty";
                }
                else if (from == "cart") {
                    selector = ".cartdetails";
                }
                var cartArguArray = [];
                $(selector).each(function () {

                    var avlQty = $(this).next().text();
                    var quantity = $(this).val();
                    var productid = $(this).prop('id');

                    var bo = $(this).attr("data-bo");
                    var from = "update";
                    var customOrStandard = $scope.viewUmbrellProductDD;
                    var shippreference = '';
                    if ($scope.shipViaCodeDD != undefined)
                        shippreference = $scope.shipViaCodeDD.Code;

                    var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: "", shipviacode: shippreference };
                    //var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: customOrStandard, shipviacode: shippreference };
                    // var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: customOrStandard };
                    if ($(this).attr("data-Inventoried") == "true") {
                        if (quantity >= 0) {
                            if (parseFloat(avlQty) >= parseFloat(quantity)) {
                                //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {

                                //    if (viewcartflag) {
                                //        from = "viewcart";
                                //    }

                                //    $scope.GetCartProducts(from);
                                //    $('#popLoader').hide();
                                //});
                                cartArguArray.push(cartArgu);
                            } else {
                                if (bo == "true") {
                                    //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {

                                    //    if (viewcartflag) {
                                    //        from = "viewcart";
                                    //    }

                                    //    $scope.GetCartProducts(from);
                                    //    $('#popLoader').hide();
                                    //});
                                    cartArguArray.push(cartArgu);
                                } else {
                                    $('#popLoader').hide();
                                    //debugger;
                                    //jAlert(' This Product Stock Availability upto ' + avlQty + '!');
                                    jAlert('There are only ' + avlQty + ' left in stock. Please lower your quantity selection.');
                                    errorFlag = true;
                                    return false;
                                }
                            }
                        } else {
                            if (bo == "true") {
                                //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {

                                //    if (viewcartflag) {
                                //        from = "viewcart";
                                //    }

                                //    $scope.GetCartProducts(from);
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
                    } else {
                        //urlService.dataProvider(addToCartMethod, "POST", cartArgu).success(function (data) {
                        //    if (viewcartflag) {
                        //        from = "viewcart";
                        //    }
                        //    $scope.GetCartProducts(from);
                        //    $('#popLoader').hide();
                        //});
                        cartArguArray.push(cartArgu);
                    }

                });
                if (errorFlag == false) {
                    urlService.dataProvider(addToCartMethod, "POST", { 'cItems': JSON.stringify(cartArguArray) }).success(function (data) {
                        if (viewcartflag) {
                            from = "viewcart";
                        }
                        $scope.GetCartProducts(from);
                        $('#popLoader').hide();
                    });
                }
                return errorFlag;

            }

            //Delete Cart
            $scope.DeleteCart = function (productid) {
                productCart.ProductAddToCart(productid, $scope, 'delete', '');
            };

            //Get Credit Card Details
            $scope.getCreditCardDetails = function () {
                urlService.dataProvider(GetCreditCardMethod, "POST", "").success(function (data) {
                    $scope.cCard = data;
                    if ($scope.cCard.length == 0)
                        $("#useOtherVal").text("true");
                });
            }
            $scope.getCreditCardDetails();

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
                    valid = false;
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

            //Add WishList Products
            $scope.AddToWishList = function (wId, CustomerID, x, from) {
                var tempWishListArry = '';
                var wishlistId = '';
                if (from == "recent") {
                    tempWishListArry = $scope.recentView;
                    //select & unselect wishlist icon
                    $.grep($scope.recentView, function (i) {
                        if (i.ProductId == wId) {
                            if (i.IsInWishList != true) {
                                i.IsInWishList = true;
                            }
                            else {
                                i.IsInWishList = false;
                            }
                        }
                    });
                }
                else if (from == "related") {
                    //select & unselect wishlist icon
                    $.grep($scope.relatedView, function (i) {
                        if (i.ProductId == wId) {
                            if (i.IsInWishList != true) {
                                i.IsInWishList = true;
                            }
                            else {
                                i.IsInWishList = false;
                            }
                        }
                    });
                };

                // '1' for add, '2' for remove
                var addWishArgu = { ProductId: wId, CustomerID: CustomerID, From: 2 };
                urlService.dataProvider(saveWishlistMethod, "POST", addWishArgu).success(function (status) {

                    //if (status == 2) {
                    //    jAlert('removed successfully');
                    //}

                    //Scope Refreshed
                    //$scope.listProducts();

                    //for Adding to Wish List
                    $scope.GetWishListItems(CustomerID);
                });
            };
            $scope.GetWishListItems = function (customerId) {
                var getWishListArgu = { CustomerID: customerId };
                urlService.dataProvider(getWishlistMethod, "POST", getWishListArgu).success(function (data) {
                    if (data.length == 0) {
                        sessionStorage.removeItem("wData");
                    }
                    $scope.WishListItems = unique(data);
                });
            };
            //Only at WishList Page checking by Url
            var indexWishUrl = wLArray.indexOf("WishList");
            if (wLArray[indexWishUrl] == "WishList") {
                $scope.GetWishListItems($scope.sesCustomerId);
            };


            var shipCustId = '';
            //Get Shipping & Billing Address
            urlService.dataProvider(GetAddressesMethod, "POST", '').success(function (data) {
                $scope.userAddress = data;
                //console.log($scope.userAddress);
                var addListCount = $scope.userAddress.AddressList.length;
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
                                sessionStorage.setItem('BillingCustId', item.CustomerAddressId);
                                sessionStorage.setItem('billingAdd', $scope.BillingAddresses[0].FormattedAddress);
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
                            $scope.taxShippingPrice();
                            $scope.getCartData();
                            $('#popLoader').hide();
                        }
                    }).error(function (ex) {
                        $('#popLoader').hide();
                    });
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
                            jAlert('Internal Technical Error. Please try again!');
                            taxErrorFlag = false
                            return false;
                        }
                        $('#popLoader').hide();
                    }).error(function (x) {
                        jAlert(x);
                    });
                    return taxErrorFlag;
                }

            });

            //Apply coupon
            $scope.ApplyCoupon = function (act) {
                var coupon = $("#txtCoupon").val();
                $('#popLoader').show();

                if (coupon != "") {
                    urlService.dataProvider(applyCouponforOrder, "POST", { coupon: coupon, actionstring: act }).success(function (resultdata) {
                        if (resultdata.Success == true) {

                            $scope.CouponApplied = false;
                            $("#lblCouponMessage").html(resultdata.Message);

                            $scope.shippingHandling = resultdata.Result.TotalShipping;
                            $scope.Tax = resultdata.Result.TotalTax;
                            if (resultdata.Result.Coupons.length > 0) {
                                var totolSaving = 0;
                                var couponDesc = '';
                                var packagedisc = 0;
                                for (var i = 0; i < resultdata.Result.Coupons.length; i++) {
                                    if (resultdata.Result.Coupons[i].Code == coupon && act == "apply") {
                                        $scope.CouponApplied = true;
                                        $("#lblCoupon").html(coupon);
                                    }
                                    totolSaving = totolSaving + resultdata.Result.Coupons[i].Amount
                                    if (resultdata.Result.Coupons[i].Code == 'SYS_PCK_DISC')
                                        packagedisc = packagedisc + resultdata.Result.Coupons[i].Amount;
                                    if (couponDesc.length > 0)
                                        couponDesc = couponDesc + ', ';
                                    if (resultdata.Result.Coupons[i].Code != 'SYS_PCK_DISC')
                                        couponDesc = couponDesc + resultdata.Result.Coupons[i].Description;
                                }
                                $scope.PackageDiscount = packagedisc;
                                $scope.CouponSaving = totolSaving;
                                $scope.CouponSavingDesc = couponDesc;
                            }
                            else if (resultdata.Result.Coupons.length <= 0) {
                                $("#txtCoupon").val('');
                                $scope.CouponSaving = null;
                                $scope.CouponApplied = false;
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
                        if (d.Success == true) {
                            //if (d != "ADDED_FAIL") {
                            $scope.finalOrderNumber = d.Result.OrderNumber;
                            sessionStorage.setItem('orderNumber', $scope.finalOrderNumber);
                            $('.cart-popup').removeClass('is-visible');
                            window.location = applicationUrl + '/Product/orderConfirmation';
                            clearCC();
                            $('#popLoader').hide();
                        } else {
                            hide();
                            $('#popLoader').hide();
                            //clearCC();
                            //jAlert('Unable to place order Please try again!');
                            jAlert(d.ErrorMessage);

                            //$('.cart-popup').trigger('click');
                        }
                    }).error(function (x) {
                        hide();
                        $('#popLoader').hide();
                        clearCC();
                        jAlert(x.ErrorMessage);
                    });
                }
            };

            $scope.orderResponse = function () {

                urlService.dataProvider(getOrderdeatilsMethod, "POST", "").success(function (data) {
                    $scope.repOrderData = data;

                    //$scope.repCouponSaving = data.Coupons.length == 0 ? null : data.Coupons[0].Amount;
                    //$scope.repCouponSavingDesc = data.Coupons.length == 0 ? null : data.Coupons[0].Description;
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
                    $scope.repPackageDiscount = packagedisc;
                    $scope.repCouponSaving = totolSaving;
                    $scope.repCouponSavingDesc = couponDesc;
                });

                var placeOrderAddress = sessionStorage.getItem('billingAdd');
                placeOrderAddressFormat = placeOrderAddress.replace(',', ', <br />');
                $scope.bilAddress = placeOrderAddressFormat;
                $scope.orderNumber = sessionStorage.getItem('orderNumber');
            }

            // Search Filter by keyword & by select category
            $scope.SearchProducts = function (from) {
                if (from == 'topSearch')
                    $("#search").val('');
                else
                    $("#topSearch").val('');

                var topSearch = $("#topSearch").val().trim();

                if (topSearch.length > 0) {

                    var searchedProducts = factorialSearch($scope.TempProducts, topSearch);

                    if (!(typeof searchedProducts === "undefined")) {
                        $scope.Products = searchedProducts;

                        var Names = [];
                        Names = getDataInArray(searchedProducts);

                        $("#topSearch").autocomplete({
                            source: function (request, response) {
                                response(Names);
                            },
                            select: function (event, ui) {
                                var items = $.grep($scope.Products, function (obj) {

                                    if (obj.ProductName + " (" + obj.ProductCode + ")" == ui.item.value)
                                        return obj.ProductName;
                                });

                                window.location = applicationUrl + '/Product/viewproduct/' + items[0].ProductId;
                            }
                        });
                    }

                }
                else {

                    $scope.Products = $scope.TempProducts;
                    var searchWord = $("#search").val();//.trim();
                    if (searchWord != undefined && searchWord.length > 0)
                        searchWord = searchWord.trim();

                    var category = $("#CategorySearch").val();
                    if (category == "All") {

                        //Searching with All option
                        var searchedProducts = factorialSearch($scope.Products, searchWord);

                        if (!(typeof searchedProducts === "undefined")) {
                            $scope.Products = searchedProducts;

                            var Names = [];
                            Names = getDataInArray(searchedProducts);

                            $("#search").autocomplete({
                                source: function (request, response) {
                                    response(Names);
                                }
                            });
                        }
                    }
                    else {
                        var catArr = (category != undefined && category.length > 0) ? category.split(':') : "";

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

                        if (!(typeof searchedProducts === "undefined")) {
                            $scope.Products = searchedProducts;

                            var Names = [];
                            Names = getDataInArray(searchedProducts);
                            $("#search").autocomplete({
                                source: function (request, response) {
                                    response(Names);
                                }
                            });
                        }
                    }
                    $scope.Products = unique($scope.Products);
                    $scope.totalProducts = $scope.Products.length;
                    $scope.currentPage = 0;
                }
            }

            $scope.digitalDownloads = function () {
                show();
                urlService.dataProvider(GetDigitalDownloads, "POST", "").success(function (data) {
                    $('#popLoader').hide();
                    if (data.length > 0) {
                        $('#divDigitalDownloads').show();
                        $('#ShowDDtitle').show();
                        $('#ShowNoDDtitle').hide();
                        $scope.repDigitalDownloads = data;
                        //console.log(data);
                    }
                    else {
                        $('#divDigitalDownloads').hide();
                        $('#ShowDDtitle').hide();
                        $('#ShowNoDDtitle').show();
                        //jAlert('No Digital Downloads Found!');
                        //window.location.href = applicationUrl;
                    }
                    hide();
                }).error(function (ex) {
                    hide();
                });
            }

            $scope.orderHistory = function (pageno, pagesize) {
                if (pagesize != undefined)
                    $scope.ordersPerPage = pagesize;
                if (pageno != undefined)
                    $scope.currentPage = pageno;

                show();

                urlService.dataProvider(GetOrderHistory, "POST", { pageno: $scope.currentPage, pagesize: $scope.ordersPerPage }).success(function (odata) {
                    console.log(odata);
                    if (odata.length > 0) {
                        $('#ShowOHtitle').show();
                        $('#ShowNoOHtitle').hide();
                        $('#divOrderHistory').show();

                        $scope.repOrderHistory = odata;
                        $scope.Orders = odata;
                        $scope.totalOrders = $scope.Orders.length;
                        $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                        if ($scope.currentPage == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                            $scope.pageDynamicCount = $scope.totalOrders;
                        } else {
                            $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                        }

                        if (odata.Coupons != null && odata.Coupons != undefined) {
                            $scope.repCpSaving = odata.Coupons.length == 0 ? null : odata.Coupons[0].Amount;
                            $scope.repCpSavingDesc = odata.Coupons.length == 0 ? null : odata.Coupons[0].Description;
                        }
                        //console.log(odata);

                        for (j = 0; j < odata.length; j++) {
                            if (odata[j].Products != null && odata[j].Products != undefined) {
                                if (odata[j].Products.length > 0) {
                                    for (i = 0; i < odata[j].Products.length; i++) {

                                        if (odata[j].Products[i].TrackingNo != null && odata[j].Products[i].TrackingNo.length > 0) {
                                            var re = /TRACK_NO/gi;
                                            str = str.replace("&amp;", "&");
                                            var newstr = encodeURI(str.replace(re, odata[j].Products[i].TrackingNo));
                                            odata[j].Products[i].TrackURL = newstr;
                                        }
                                        else {
                                            odata[j].Products[i].TrackURL = "";
                                        }
                                    }
                                }
                            }
                        }
                        //console.log(odata);
                    }
                    else {
                        $('#ShowOHtitle').hide();
                        $('#ShowNoOHtitle').show();
                        $('#divOrderHistory').hide();
                        //jAlert('No Order History Found!');
                        //window.location.href = applicationUrl;
                    }
                    hide();
                }).error(function (ex) {
                    hide();
                });
            }

            // Order History Search Based on Category
            $scope.SearchOrderHistory = function (pageno, pagesize) {
                if (pagesize != undefined)
                    $scope.ordersPerPage = pagesize;
                if (pageno != undefined)
                    $scope.currentPage = pageno;

                var sWord = $("#SearchOrderHistory").val().trim();
                var sType = $("#SearchType").val();

                $("#SearchStartDate").val("");
                $("#SearchEndDate").val("");

                show();

                if (sWord != "") {
                    urlService.dataProvider(GetSearchedOrderHistoryDetails, "POST", { searchWord: sWord, searchType: sType, pageno: $scope.currentPage, pagesize: $scope.ordersPerPage })
                        .success(function (searchedResults) {
                            if (searchedResults.length > 0) {
                                $('#ShowOHtitle').show();
                                $('#ShowNoOHtitle').hide();
                                $('#divOrderHistory').show();
                                $scope.IsSearchOrderHistory = true;

                                $scope.repOrderHistory = searchedResults;
                                $scope.Orders = searchedResults;
                                $scope.totalOrders = $scope.Orders.length;
                                $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                                if ($scope.currentPage == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                                    $scope.pageDynamicCount = $scope.totalOrders;
                                } else {
                                    $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                                }

                                if (searchedResults.Coupons != null && searchedResults.Coupons != undefined) {
                                    $scope.repCpSaving = searchedResults.Coupons.length == 0 ? null : searchedResults.Coupons[0].Amount;
                                    $scope.repCpSavingDesc = searchedResults.Coupons.length == 0 ? null : searchedResults.Coupons[0].Description;
                                }

                                for (j = 0; j < searchedResults.length; j++) {
                                    if (searchedResults[j].Products != null && searchedResults[j].Products != undefined) {
                                        if (searchedResults[j].Products.length > 0) {
                                            for (i = 0; i < searchedResults[j].Products.length; i++) {

                                                if (searchedResults[j].Products[i].TrackingNo != null && searchedResults[j].Products[i].TrackingNo.length > 0) {
                                                    var re = /TRACK_NO/gi; str = str.replace("&amp;", "&"); var newstr = str.replace(re, searchedResults[j].Products[i].TrackingNo);
                                                    searchedResults[j].Products[i].TrackURL = newstr;
                                                }
                                                else {
                                                    searchedResults[j].Products[i].TrackURL = "";
                                                }
                                            }
                                        }
                                    }
                                }
                                //console.log(searchedResults);
                            }
                            else {
                                $('#ShowOHtitle').hide();
                                $('#ShowNoOHtitle').show();
                                $('#divOrderHistory').hide();
                                //jAlert('No Order History Found!');
                            }
                            hide();
                        }).error(function (ex) {
                            hide();
                        });
                }
                else {
                    hide();
                    jAlert('Please enter data for search!');
                }
            }

            // Order History Full Details
            $scope.orderFullDetails = function (orNo, pageno, pagesize) {
                if (pagesize != undefined)
                    $scope.ordersPerPage = pagesize;
                if (pageno != undefined)
                    $scope.currentPage = pageno;

                var sWord = orNo;
                var sType = "OrderNo";

                $("#SearchStartDate").val("");
                $("#SearchEndDate").val("");

                show();

                if (sWord != "") {
                    urlService.dataProvider(GetSearchedOrderHistoryDetails, "POST", { searchWord: sWord, searchType: sType, pageno: $scope.currentPage, pagesize: $scope.ordersPerPage })
                        .success(function (searchedRs) {
                            if (searchedRs.length > 0) {
                                $('#ShowOHtitle').show();
                                $('#ShowNoOHtitle').hide();
                                $('#divOrderHistory').show();
                                $scope.IsSearchOrderHistory = true;

                                $scope.repOrderHistory = searchedRs;
                                $scope.Orders = searchedRs;
                                $scope.totalOrders = $scope.Orders.length;
                                $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                                if ($scope.currentPage == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                                    $scope.pageDynamicCount = $scope.totalOrders;
                                } else {
                                    $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                                }

                                if (searchedRs.Coupons != null && searchedRs.Coupons != undefined) {
                                    $scope.repCpSaving = searchedRs.Coupons.length == 0 ? null : searchedRs.Coupons[0].Amount;
                                    $scope.repCpSavingDesc = searchedRs.Coupons.length == 0 ? null : searchedRs.Coupons[0].Description;
                                }

                                for (j = 0; j < searchedRs.length; j++) {
                                    if (searchedRs[j].Products != null && searchedRs[j].Products != undefined) {
                                        if (searchedRs[j].Products.length > 0) {
                                            for (i = 0; i < searchedRs[j].Products.length; i++) {

                                                if (searchedRs[j].Products[i].TrackingNo != null && searchedRs[j].Products[i].TrackingNo.length > 0) {
                                                    var re = /TRACK_NO/gi; str = str.replace("&amp;", "&"); var newstr = str.replace(re, searchedRs[j].Products[i].TrackingNo);
                                                    searchedRs[j].Products[i].TrackURL = newstr;
                                                }
                                                else {
                                                    searchedRs[j].Products[i].TrackURL = "";
                                                }
                                            }
                                        }
                                    }
                                }
                                //console.log(searchedRs);
                            }
                            else {
                                $('#ShowOHtitle').hide();
                                $('#ShowNoOHtitle').show();
                                $('#divOrderHistory').hide();
                                //jAlert('No Order History Found!');
                            }
                            hide();
                        }).error(function (ex) {
                            hide();
                        });
                }
                else {
                    hide();
                    jAlert('Please enter data for search!');
                }
            }

            // Order History Search Based on Dates
            $scope.SearchOrderHistoryByDates = function (pageno, pagesize) {
                if (pagesize != undefined)
                    $scope.ordersPerPage = pagesize;
                if (pageno != undefined)
                    $scope.currentPage = pageno;

                var sDate = $("#SearchStartDate").val();
                var eDate = $("#SearchEndDate").val();

                $("#SearchOrderHistory").val("");
                $("#SearchType").val("OrderNo");

                var datefrom = new Date(Date.parse(sDate));
                var dateto = new Date(Date.parse(eDate));

                show();

                if (sDate != "") {
                    if (eDate != "") {
                        if (sDate != "" & eDate != "") {
                            if (datefrom > dateto) {
                                hide();
                                jAlert('Start Date Should be less than or equal to End Date');
                            }
                            else {
                                urlService.dataProvider(GetSearchedOrderHistoryDetailsByDates, "POST", { startDate: sDate, endDate: eDate, pageno: $scope.currentPage, pagesize: $scope.ordersPerPage })
                                    .success(function (searchedDetails) {
                                        if (searchedDetails.length > 0) {
                                            $('#ShowOHtitle').show();
                                            $('#ShowNoOHtitle').hide();
                                            $('#divOrderHistory').show();
                                            $scope.IsOrderHistoryByDates = true;

                                            $scope.repOrderHistory = searchedDetails;
                                            $scope.Orders = searchedDetails;
                                            $scope.totalOrders = $scope.Orders.length;
                                            $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                                            if ($scope.currentPage == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                                                $scope.pageDynamicCount = $scope.totalOrders;
                                            } else {
                                                $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                                            }

                                            if (searchedDetails.Coupons != null && searchedDetails.Coupons != undefined) {
                                                $scope.repCpSaving = searchedDetails.Coupons.length == 0 ? null : searchedDetails.Coupons[0].Amount;
                                                $scope.repCpSavingDesc = searchedDetails.Coupons.length == 0 ? null : searchedDetails.Coupons[0].Description;
                                            }

                                            for (j = 0; j < searchedDetails.length; j++) {
                                                if (searchedDetails[j].Products != null && searchedDetails[j].Products != undefined) {
                                                    if (searchedDetails[j].Products.length > 0) {
                                                        for (i = 0; i < searchedDetails[j].Products.length; i++) {

                                                            if (searchedDetails[j].Products[i].TrackingNo != null && searchedDetails[j].Products[i].TrackingNo.length > 0) {
                                                                var re = /TRACK_NO/gi; str = str.replace("&amp;", "&"); var newstr = str.replace(re, searchedDetails[j].Products[i].TrackingNo);
                                                                searchedDetails[j].Products[i].TrackURL = newstr;
                                                            }
                                                            else {
                                                                searchedDetails[j].Products[i].TrackURL = "";
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            //console.log(searchedDetails);
                                        }
                                        else {
                                            $('#ShowOHtitle').hide();
                                            $('#ShowNoOHtitle').show();
                                            $('#divOrderHistory').hide();
                                            //jAlert('No Order History Found!');
                                        }
                                        hide();
                                    }).error(function (ex) {
                                        hide();
                                    });
                            }
                        }
                        else {
                            hide();
                            jAlert('Please select both dates to search!');
                        }
                    }
                    else {
                        hide();
                        jAlert('Please select both dates to search!');
                    }
                }
                else {
                    hide();
                    jAlert('Please select dates to search!');
                }
            }

            // Order History Reset
            $scope.SearchReset = function (pageno, pagesize) {
                if (pagesize != undefined)
                    $scope.ordersPerPage = pagesize;
                if (pageno != undefined)
                    $scope.currentPage = pageno;

                var sWord = "";
                var sType = "";

                $("#SearchOrderHistory").val("");
                $("#SearchType").val("OrderNo");

                $("#SearchStartDate").val("");
                $("#SearchEndDate").val("");

                show();

                urlService.dataProvider(GetSearchedOrderHistoryDetails, "POST", { searchWord: sWord, searchType: sType, pageno: $scope.currentPage, pagesize: $scope.ordersPerPage })
                    .success(function (searchResults) {
                        if (searchResults.length > 0) {
                            $('#ShowOHtitle').show();
                            $('#ShowNoOHtitle').hide();
                            $('#divOrderHistory').show();

                            $('.sorting_navigation').show();
                            $('#searchCategoryDiv').show();
                            $('.searchDatesDiv').show();

                            $scope.IsSearchOrderHistory = false;
                            $scope.IsOrderHistoryByDates = false;

                            $scope.repOrderHistory = searchResults;
                            $scope.Orders = searchResults;
                            $scope.totalOrders = $scope.Orders.length;
                            $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                            if ($scope.currentPage == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                                $scope.pageDynamicCount = $scope.totalOrders;
                            } else {
                                $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                            }

                            if (searchResults.Coupons != null && searchResults.Coupons != undefined) {
                                $scope.repCpSaving = searchResults.Coupons.length == 0 ? null : searchResults.Coupons[0].Amount;
                                $scope.repCpSavingDesc = searchResults.Coupons.length == 0 ? null : searchResults.Coupons[0].Description;
                            }

                            for (j = 0; j < searchResults.length; j++) {
                                if (searchResults[j].Products != null && searchResults[j].Products != undefined) {
                                    if (searchResults[j].Products.length > 0) {
                                        for (i = 0; i < searchResults[j].Products.length; i++) {

                                            if (searchResults[j].Products[i].TrackingNo != null && searchResults[j].Products[i].TrackingNo.length > 0) {
                                                var re = /TRACK_NO/gi; str = str.replace("&amp;", "&"); var newstr = str.replace(re, searchResults[j].Products[i].TrackingNo);
                                                searchResults[j].Products[i].TrackURL = newstr;
                                            }
                                            else {
                                                searchResults[j].Products[i].TrackURL = "";
                                            }
                                        }
                                    }
                                }
                            }
                            //console.log(searchResults);
                        }
                        else {
                            $('#ShowOHtitle').hide();
                            $('#ShowNoOHtitle').show();
                            $('#divOrderHistory').hide();
                            //jAlert('No Order History Found!');
                        }
                        hide();
                    }).error(function (ex) {
                        hide();
                    });
            }

            // Order Re-order
            $scope.orderReorder = function (orNo, pageno, pagesize) {

                if ($scope.ordersPerPage == undefined)
                    $scope.ordersPerPage = pagesize;
                if ($scope.currentPage == undefined)
                    $scope.currentPage = pageno;

                var OrderNumber = orNo;

                show();

                urlService.dataProvider(GetOrderReorder, "POST", { ordernumber: OrderNumber, pageno: $scope.currentPage, pagesize: $scope.ordersPerPage })
                    .success(function (data) {

                        if (data == "NO_PRODUCTS_FOUND" || data == "NO_PRODUCTS_ADDED") {
                            jAlert('Unable to add products in cart. May be product not found / discontinued / for members only / low in stock than required quantity.');
                        }

                        if (data == "ALL_PRODUCTS_DISCONTINUED") {
                            jAlert('All order products have been discontinued.');
                        }

                        if (data == "ALL_PRODUCTS_MEMBER_ONLY") {
                            jAlert('All order products are only for members.');
                        }

                        if (data == "ALL_PRODUCTS_STOCK_LOW") {
                            jAlert('All order products are out of stock.');
                        }

                        if (data == "NO_PRODUCTS_FOUND") {
                            jAlert('No Products found to ReOrder');
                        }

                        $scope.GetCartProducts();

                        if (data == "SOME_ADDED_SUCCESSFULLY" || data == "SOME_PRODUCTS_DISCONTINUED" || data == "SOME_PRODUCTS_MEMBER_ONLY" || data == "SOME_PRODUCTS_STOCK_LOW") {
                            $("#cartMsg").show(function () {
                                jAlert('Only valid order products are added to cart. Products which are discontinued / for members only / low in stock than required quantity are not added to cart.');
                                setTimeout(function () { $("#cartMsg").hide(); }, 2000);
                            });
                        }

                        if (data == "ALL_ADDED_SUCCESSFULLY") {
                            $("#cartMsg").show(function () {
                                setTimeout(function () { $("#cartMsg").hide(); }, 2000);
                            });
                        }

                        hide();
                    }).error(function (ex) {
                        hide();
                    });
            }

            // Order Inovice
            $scope.orderInvoiceByOrNo = function (orNo) {
                show();

                var orDate = $('#orderInvoice').data('orderdate');

                urlService.dataProvider(GetOrderInvoiceByOrNo, "POST", { OrderNumber: orNo, OrderDate: orDate })
                    .success(function (sResults) {
                        $('#ShowOHtitle').show();
                        $('#divOrderHistory').show();
                        $scope.repOrderData = sResults;
                        window.location = applicationUrl + '/Order/OrderInvoice';
                        hide();
                    }).error(function (ex) {
                        hide();
                    });
            }

            $scope.orderInvoice = function () {

                urlService.dataProvider(getOrderdeatilsMethod, "POST", "").success(function (data) {
                    $scope.repOrderData = data;
                    console.log(data);
                    //$scope.repCouponSaving = data.Coupons.length == 0 ? null : data.Coupons[0].Amount;
                    //$scope.repCouponSavingDesc = data.Coupons.length == 0 ? null : data.Coupons[0].Description;
                    var totolSaving = 0;
                    var couponDesc = '';
                    var packagedisc = 0;
                    for (var i = 0; i < data.Coupons.length; i++) {
                        totolSaving = totolSaving + resultdata.Result.Coupons[i].Amount
                        if (resultdata.Result.Coupons[i].Code == 'SYS_PCK_DISC')
                            packagedisc = packagedisc + resultdata.Result.Coupons[i].Amount;
                        if (couponDesc.length > 0)
                            couponDesc = couponDesc + ', ';
                        if (data.Coupons[i].Code != 'SYS_PCK_DISC')
                            couponDesc = couponDesc + resultdata.Result.Coupons[i].Description;
                    }
                    $scope.repPackageDiscount = packagedisc;
                    $scope.repCouponSaving = totolSaving;
                    $scope.repCouponSavingDesc = couponDesc;
                });

                //var placeOrderAddress = sessionStorage.getItem('billingAdd');
                //placeOrderAddressFormat = placeOrderAddress.replace(',', ', <br />');
                //$scope.bilAddress = placeOrderAddressFormat;
                //$scope.orderNumber = sessionStorage.getItem('orderNumber');
            }

            // Orders Navigation START
            $scope.prevPage = function () {
                if ($scope.currentPage > 0) {
                    $scope.currentPage--;
                    sessionStorage.setItem("currentPage", $scope.currentPage);

                    if ($scope.currentPage == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                        $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                        $scope.pageDynamicCount = $scope.totalOrders;
                    } else {
                        $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                        $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                        sessionStorage.setItem("pageDynCount", $scope.pageDynamicCount);
                    }
                    if ($scope.IsSearchOrderHistory) {
                        $scope.SearchOrderHistory($scope.currentPage, $scope.pageSize);
                    }
                    else if ($scope.IsOrderHistoryByDates) {
                        $scope.SearchOrderHistoryByDates($scope.currentPage, $scope.pageSize);
                    }
                    else {
                        $scope.orderHistory($scope.currentPage, $scope.pageSize);
                    }
                }
            };

            $scope.prevPageDisabled = function () {
                return $scope.currentPage === 0 ? "disabled" : "";
            };

            $scope.pageCount = function () {
                if ($scope.ordersPerPage == 0) {
                    return 0;
                }
                return Math.ceil($scope.totalOrders / $scope.ordersPerPage) - 1;
            };

            $scope.nextPage = function () {

                if ($scope.currentPage < $scope.pageCount()) {
                    $scope.currentPage++;
                    sessionStorage.setItem("currentPage", $scope.currentPage);

                    if ($scope.currentPage == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                        $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                        $scope.pageDynamicCount = $scope.totalOrders;
                    } else {
                        $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                        $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                        sessionStorage.setItem("pageDynCount", $scope.pageDynamicCount);
                    }
                    if ($scope.IsSearchOrderHistory) {
                        $scope.SearchOrderHistory($scope.currentPage, $scope.pageSize);
                    }
                    else if ($scope.IsOrderHistoryByDates) {
                        $scope.SearchOrderHistoryByDates($scope.currentPage, $scope.pageSize);
                    }
                    else {
                        $scope.orderHistory($scope.currentPage, $scope.pageSize);
                    }
                }
                //paging();
            };

            $scope.nextPageDisabled = function () {
                return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
            };

            $scope.range = function () {

                var rangeSize = 15;
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

                if (n == parseInt($scope.totalOrders / parseInt($scope.pageSize))) {
                    $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                    $scope.pageDynamicCount = $scope.totalOrders;
                } else {
                    $scope.pageStartIndex = $scope.currentPage * $scope.ordersPerPage + 1;
                    $scope.pageDynamicCount = parseInt($scope.pageSize) * ($scope.currentPage + 1);
                    sessionStorage.setItem("pageDynCount", $scope.pageDynamicCount);
                }
                sessionStorage.setItem("currentPage", $scope.currentPage);
                if ($scope.IsSearchOrderHistory) {
                    $scope.SearchOrderHistory($scope.currentPage, $scope.pageSize);
                }
                else if ($scope.IsOrderHistoryByDates) {
                    $scope.SearchOrderHistoryByDates($scope.currentPage, $scope.pageSize);
                }
                else {
                    $scope.orderHistory($scope.currentPage, $scope.pageSize);
                }
            };

            $scope.numberOfPages = function () {
                return Math.ceil($scope.Orders.length / $scope.pageSize);
            }
            //

            function getDataInArray(array) {
                var names = [];
                $.each(array, function (i, d) {
                    names.push(d.ProductName + " (" + d.ProductCode + ")");
                    // names.push(d.ProductCode);
                });
                return names;
            }

            //Adding new address
            urlService.dataProvider(getCountryMethod, 'POST', '').success(function (data) {
                $scope.CountryList = data;
                //$scope.Countrys = $scope.CountryList[0];
                /*selecting default Country*/
                $.grep($scope.CountryList, function (obj) {
                    if (obj.CountryCode == "USA") {
                        $scope.Countrys = obj;
                        //debugger;
                        $scope.onCountryChange(obj);
                    }
                });
            });

            //urlService.dataProvider(getStateMethod, 'POST', '').success(function (data) {
            //    $scope.StateList = data;
            //    $scope.TmpStateList = data;
            //    //$scope.States = $scope.StateList[0];
            //});

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
                $.grep($scope.CountryList, function (obj) {
                    if (obj.CountryCode == "USA") {
                        $scope.Countrys = obj;
                        //debugger;
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
                //debugger;
                $scope.inputEnbl = false;
                if (a.CountryDescription != "All Countries") {
                    urlService.dataProvider(getStateMethod, 'POST', { 'countrycode': a.CountryCode }).success(function (data) {
                        if (data !== undefined && data.length != 0) {
                            $scope.StateList = data;
                            //$scope.States = $scope.StateList[0];
                        } else {
                            $scope.States = " ";
                            $scope.inputEnbl = true;
                            $("input#States").val(' ');
                        }
                    });
                }

                ////filterting states based on Country selection
                //if ($scope.TmpStateList !== undefined) {
                //    var result = $.grep($scope.TmpStateList, function (e) { return e.CountryCodeString == a.CountryCode });

                //    if (result!==undefined && result.length != 0) {
                //        $scope.StateList = result;
                //        //$scope.States = $scope.StateList[0];
                //    } else {
                //        //if states not available
                //        //$scope.StateList = [{ StateDescription: 'No States Available' }];
                //        $scope.inputEnbl = true;
                //        $("input#States").val('');
                //    }
                //}

            }

            var stateCode = $('#States').val();
            var valid = true;
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

            //Add New address Method
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
                        State: $("#States").val(),
                        PostalCode: $scope.postCode
                    }];

                    var saveAddArgu = { AddressObj: newAddress }
                    urlService.dataProvider(addAddressMethod, "POST", saveAddArgu).success(function (data) {
                        if (data != "ADDED_FAIL") {
                            $('#popLoader').hide();
                            jAlert('Address Added Successfully!');
                            $('#addAddress').hide();
                            $('.actions').hide();
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
                        }
                        else {
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
            }
            //End

            //For Top search
            var wL = window.location + '';
            var wLArray = wL.split('/');
            var indexUrl = wLArray.indexOf("search");
            $scope.searchLoad = function () {

                if (wLArray[indexUrl] == "search") {
                    var topSearch = $("#topSearch").val(getParameterByName("SearchValue"));
                    window.location = applicationUrl + '/Product/search?SearchValue=' + ui.item.value;
                    $scope.SearchProducts();
                }
            };

            //ng-repeat callback function
            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                //zoomImage("Scope load Complete");
            });

            //ShipViaCodes
            $scope.shipViaCodeClient = function () {
                urlService.dataProvider(shipViaCodeMethod, 'POST', '').success(function (data) {
                    $scope.shipViaCode = data;
                    $scope.shipViaCodeDD = $scope.shipViaCode[0];
                }).error(function (x) {
                });
            }
            $scope.shipViaCodeClient();

            //get Favourites Products
            $scope.GetFavouriteItems = function (Masterid) {
                var getFavouritesArgu = { masterid: Masterid };
                urlService.dataProvider(getFavouriteItems, "POST", getFavouritesArgu).success(function (data) {
                    $scope.FavouriteItems = unique(data);
                });
            }

            //Delete Favourite Item
            $scope.DeleteFavouriteItem = function (productid) {
                $('#popLoader').show();
                var removeFavouriteArgu = { productid: productid };
                urlService.dataProvider(removeFavouriteItems, "POST", removeFavouriteArgu).success(function (data) {
                    $('#popLoader').hide();
                }).error(function () {
                    $('#popLoader').hide();
                });
                $scope.GetFavouriteItems($scope.sesCustomerId);
            }

            //Get Recently Viewed Items From LocalStorage
            var recentViewItemID = [];
            var existItem = [];

            //if ($scope.sesCustomerId == null) {
            //    if (localStorage.getItem('RecentItems') != null) {
            //        var xItems = localStorage.getItem('RecentItems').split(',');
            //        if (xItems.length >= 6) {
            //            var exItems = xItems.splice(6, xItems.length - 1);
            //        };
            //        existItem = $.grep(xItems, function (i) {
            //            return $scope.id == i;
            //        });
            //    };

            //    if (existItem.length == 0) {
            //        recentViewItemID.push($scope.id);
            //        recentViewItemID.push(xItems);
            //    } else {
            //        recentViewItemID.push(xItems);
            //    };

            //    localStorage.setItem('RecentItems', recentViewItemID);
            //};

            //Get Recently Viewed Items From Service
            $scope.GetrecentlyItems = function () {
                //localStorage.removeItem('RecentItems');
                var custIdArgu = { productid: $scope.id };
                urlService.dataProvider(getRecentlyViewedItems, "POST", custIdArgu).success(function (data) {
                    $scope.recentView = data;

                    //$.grep($scope.recentView, function (obj, i) {
                    //    recentViewItemID.push(obj.ProductId);
                    //});
                    $("#recentlyViewdProducts").show();
                    if ($scope.recentView.length == 0) {
                        $("#recentlyViewdProducts span.noData").text("No Products Found.");
                    }
                    //localStorage.setItem('RecentItems', recentViewItemID);
                });

            }

            //Get Recently Viewed Items
            $scope.GetrelatedItems = function () {
                var pdId = { productid: $scope.id };
                urlService.dataProvider(relatedProductsMethod, "POST", pdId).success(function (data) {
                    $scope.relatedView = data;
                    $("#relatedProducts").show();
                    if ($scope.relatedView.length == 0) {
                        $("#relatedProducts span.noData").text("No Products Found.");
                    }
                });
            }

            //Check Comments input length
            $scope.currentInputLength = "0 of 256";
            $scope.checklenth = function ($event) {
                if ($event.currentTarget.value.length <= 256) {
                    $scope.currentInputLength = $event.currentTarget.value.length + " of 256";
                } else {
                    $event.currentTarget.value = $event.currentTarget.value.substr(0, 255);
                }
            }

            //AddComments
            $scope.commentsDataView = [];
            var currentTimeStamp = '';

            //onLoadReviews
            $scope.loadReviews = function (selPrdId, count) {
                var getCommeArgu = { comments: "", productId: selPrdId, starRating: 0, ratingTitle: "" };
                urlService.dataProvider(getOrInsertProductRevuew, "POST", getCommeArgu).success(function (response) {
                    $scope.reviewLength = response.length;

                    $scope.commentsDataView = $.grep(response, function (obj, i) {
                        if (i <= count) {
                            return obj
                        };
                    });

                    $("#userReview").show();
                    $.grep($scope.commentsDataView, function (iObj, i) {
                        var resTime = $scope.commentsDataView[i].ReviewDate;
                        var conVTime = resTime.replace(/[()\D\a\t\e]/g, "");
                        iObj.ReviewDate = convertTimestamp(Math.round(conVTime / 1000.0));

                    });
                    if ($scope.commentsDataView.length == 0) {
                        $("#userReview span.noData").text("No Reviews Found.");
                    };

                    //calc Review load count out of total count
                    if ($scope.reviewLength > count) {
                        $scope.reviewInfo = (count + 1) + " out of " + $scope.reviewLength + " Reviews";
                    } else {
                        $scope.reviewInfo = $scope.reviewLength + " out of " + $scope.reviewLength + " Reviews";
                    };

                });
            };

            //Load More Reviews
            $scope.loadMore = function ($event) {
                var nextCount = parseFloat($($event.currentTarget).attr('data-reviewlength')) + 9;
                $scope.loadReviews($scope.id, nextCount);
            };

            //Insert Reviews
            $scope.addReviews = function () {

                if (typeof $scope.commentsInput === "undefined" || $scope.commentsInput == "") {
                    jAlert("Please Enter Comment.");
                } else if (currentUserRating == "undefined" || currentUserRating == '') {
                    jAlert("Please let us know your Rating.");
                    return
                } else {
                    $("#reviewPopup").find('#popLoader').show();
                    //Data Insert
                    var commeArgu = { comments: $scope.commentsInput, productId: $scope.id, starRating: currentUserRating, ratingTitle: "" };
                    urlService.dataProvider(getOrInsertProductRevuew, "POST", commeArgu).success(function (response) {
                        if (response != "SESSION_NULL" && response != "ERROR_FAIL") {
                            $scope.commentsDataView = response;
                            $.grep($scope.commentsDataView, function (iObj, i) {
                                var resTime = $scope.commentsDataView[i].ReviewDate;
                                var conVTime = resTime.replace(/[()\D\a\t\e]/g, "");
                                iObj.ReviewDate = convertTimestamp(Math.round(conVTime / 1000.0));
                            });

                            $("#reviewPopup").find('#popLoader').hide();
                            jAlert("Thanks for your Feedback.");
                        } else if (response == "SESSION_NULL") {
                            var currentUrl = window.location + '';
                            //window.location.href = applicationUrl + "/Login/Index" + '?url=' + currentUrl;
                            $('#LoginPopup').addClass('is-visible');
                        } else if (response == "ERROR_FAIL") {
                            jAlert("Please try again.");
                            $("#reviewPopup").find('#popLoader').hide();
                        }

                    });

                    $('#reviewPopup').removeClass('is-visible');
                    //Reset the values
                    $scope.commentsInput = '';
                    $scope.currentInputLength = "0 of 256";
                    //$().rating('select', 0)
                    $('div.star-rating').removeClass('star-rating-on');
                }

            };

            //Open Review Popup
            $scope.reviewPopup = function () {
                setTimeout(function () {
                    if ($scope.sesCustomerId == '') {
                        var currentUrl = window.location + '';
                        sessionStorage.setItem('fromReviewPop', 'fromReview');
                        //  window.location.href = applicationUrl + "/Login/Index" + '?url=' + currentUrl;
                        $('#LoginPopup').addClass('is-visible');
                    }
                    else
                        $('#reviewPopup').addClass('is-visible');
                }, 500);
            }

            //Open Login Popup
            $scope.LoginPopup = function () {
                //var currentUrl = window.location + ''
                //window.location.href = "http://172.16.0.128/Login/?returnURL=" + currentUrl + "/&SSOL=Y";
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
                    // var ChkRememberMe = $('input[name="ChkRM"]:checked')
                    var ChkRememberMe = $("#ChkRM").is(":checked");
                    $("#LoginPopup").find('#LoginpopLoader').show();
                    //Data Insert
                    var currentUrl = window.location.href;
                    var commeArgu = { Email: $scope.UserId, Password: $scope.Password, CurrentUrl: currentUrl, RememberMe: ChkRememberMe };
                    urlService.dataProvider(LoginInfo, "POST", commeArgu).success(function (response) {
                        if (response.Success) {
                            window.location.href = response.SSOURL;

                            //window.location.href = currentUrl;
                            $scope.UserName = '';
                            $scope.Password = '';
                            if (sessionStorage.setItem("CustomPro") != null && sessionStorage.setItem("CustomPro") == "fromCompse") {
                                localStorage.setItem("CustomPro", "true");
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

            //AddToCart
            $scope.AddToCartR = function ($event) {
                show();
                $('#alrtMsg').empty();
                var avQal = $($event.target).parent().find('#aQval').text();
                var productid = $($event.target).attr('id');
                var bo = $('#bo').attr('data-bo');
                var quantity = 1;
                var from = "add";
                var customOrStandard = $scope.viewUmbrellProductDD;
                var shippreference = '';
                if ($scope.shipViaCodeDD != undefined)
                    shippreference = $scope.shipViaCodeDD.Code;
                var cartArguArray = [];
                //var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: customOrStandard, shipviacode: shippreference };
                var cartArgu = { ProductId: productid, Quantity: quantity, From: from, StrCustomOrStandard: "", shipviacode: shippreference };
                if (parseInt(avQal) != 0) {
                    cartArguArray.push(cartArgu);
                    urlService.dataProvider(addToCartMethod, "POST", cartArguArray).success(function (data) {
                        if (data == "PRODUCTMEMBER_ONLY") {
                            if ($scope.sesCustomerId != '') {
                                jAlert('This Product is only for members.');
                            } else {
                                jConfirm("This product is for Members Only please login to add to you cart or cancel to return to the previous screen?", function (status) {
                                    if (status == true) {
                                        var currentUrl = window.location + '';
                                        //window.location.href = applicationUrl + "/Login/Index" + '?url=' + currentUrl;
                                        $('#LoginPopup').addClass('is-visible');
                                    }
                                });
                            }
                        }
                        if (data.indexOf("REMAINING_") != -1) {
                            //debugger;
                            //jAlert('You remain to add upto ' + parseFloat(data.replace('REMAINING_', '')) + ' out of ' + parseFloat(avQal) + '!');
                            jAlert('There are only ' + parseFloat(data.replace('REMAINING_', '')) + ' left in stock. Please lower your quantity selection.');
                        }
                        else if (data == "ADDED_FAIL") {
                            jAlert('Unable to add product to cart,Please try later.');
                        }
                        $scope.getCartData();
                        hide();

                        if (data == "ADDED_SUCCESSFULLY") {
                            $('#checkout').show();
                            $("#cartMsg").show(function () {
                                setTimeout(function () { $("#cartMsg").hide(); }, 2000);
                            });
                        }


                    });
                } else {
                    if (bo == "true") {
                        //jConfirm("Are you sure you want to place a backorder for this item?", function (status) {
                        //    if (status == true) {
                        cartArguArray.push(cartArgu);
                        urlService.dataProvider(addToCartMethod, "POST", cartArguArray).success(function (data) {
                            if (data == "PRODUCTMEMBER_ONLY") {
                                jAlert('This Product is only for members.');
                            }
                            if (data.indexOf("REMAINING_") != -1) {
                                //debugger;
                                //jAlert('You remain to add upto ' + parseFloat(data.replace('REMAINING_', '')) + ' out of ' + parseFloat(avQal) + '!');
                                jAlert('There are only ' + parseFloat(data.replace('REMAINING_', '')) + ' left in stock. Please lower your quantity selection.');
                            }
                            else if (data == "ADDED_FAIL") {
                                jAlert('Unable to add product to cart,Please try later.');
                            }
                            $scope.getCartData();
                            hide();

                            if (data == "ADDED_SUCCESSFULLY") {
                                $('#checkout').show();
                                $("#cartMsg").show(function () {
                                    setTimeout(function () { $("#cartMsg").hide(); }, 2000);
                                });
                            }

                        });
                        //    } else {
                        //        hide();
                        //    }
                        //});
                    } else {
                        hide();
                        jAlert('Out Of Stock!');
                    }
                }
            };

            $scope.ProductCompose = function (Productname, GroupName, Templatename, IsProdMemberonly) {
                show();
                /* To Open Popup after login */
                if ($scope.sesCustomerId == '') {
                    sessionStorage.setItem("CustomPro", "fromCompse");
                    var currentUrl = window.location + '';
                    $('#LoginPopup').addClass('is-visible');
                    hide();
                    return false;
                }
                if ($scope.sesUserIsMember != "1" && IsProdMemberonly) {
                    jAlert('This Product is only for members.');
                    sessionStorage.removeItem("CustomPro");
                    hide();
                    return false;
                }

                //$scope.AddToCart(Productname);
                //if ($scope.cartSuccess == true) {
                var getCommeArgu = { ProductName: Productname, Group: GroupName, TemplateName: Templatename };
                urlService.dataProvider(ProductComposeFileds, "POST", getCommeArgu).success(function (response) {
                    if (response != "No Codes Received") {
                        //Create a HTML Table element.
                        var table = document.createElement("TABLE");
                        table.width = "100%";
                        table.border = "1";

                        //Add the data rows.
                        for (var i = 0; i < response.Fields.length; i++) {
                            row = table.insertRow(-1);
                            var cell = row.insertCell(-1);
                            cell.width = '30%';
                            cell.innerHTML = response.Fields[i]['FieldPrompt'];
                            var cell = row.insertCell(-1);
                            var RequriedFiled = '';
                            var RequriedFiledMark = '';
                            if (response.Fields[i]['RequriedFiled']) {
                                RequriedFiled = 'required';
                                RequriedFiledMark = '<span>*</span>';
                            }
                            if (response.Fields[i]['FieldType'] == 'SingleLine') {
                                cell.innerHTML = '<input class="ng-pristine ng-valid ng-touched" id="' + response.Fields[i]['FiledName'] + '" type="text"  value="' + response.Fields[i]['FiledValue'] + '" ' + RequriedFiled + ' /> ' + RequriedFiledMark + '';
                            } else if (response.Fields[i]['FieldType'] == 'GraphicUpload') {
                                cell.innerHTML = '<input id="' + response.Fields[i]['FiledName'] + '" type="file" accept="image/*"  value="' + response.Fields[i]['FiledValue'] + '" ' + RequriedFiled + ' /> ' + RequriedFiledMark + '';
                            }
                        }

                        var dvTable = document.getElementById("tblPreview");
                        dvTable.innerHTML = "";
                        dvTable.appendChild(table);

                        var VPageCount = response.NoOfPages;
                        //Show Paging
                        $('#lblComposeId').val(response.ComposeID);
                        $("#DivPaging button").remove();
                        //console.log($('#lblComposeId').val());
                        for (var i = 1; i <= VPageCount; i++) {
                            var btnhtml = "<button class='' style='background-image: none;'>" + i + "</button>";
                            var newButt = angular.element(btnhtml);
                            newButt.bind('click', $scope.ComposePagePreview);
                            angular.element($("#DivPaging").append(newButt));
                        }
                        //Show Paging End

                        $('#lblGroup').val(GroupName);
                        $('#lblTemplatename').val(Templatename);
                        $('#lblProductId').val(Productname);
                        $("#Imgpreview").attr("src", response.ImgUrl);
                        //$('#CreateProof').prop('disabled', true);
                        $('#ProductPreview').addClass('is-visible');
                        sessionStorage.removeItem("CustomPro");
                        sessionStorage.removeItem("UMBID");
                        sessionStorage.removeItem("UMBID_IsMem");
                        hide();
                    }
                    else {
                        jAlert('No template found.');
                        sessionStorage.removeItem("CustomPro");
                        sessionStorage.removeItem("UMBID");
                        sessionStorage.removeItem("UMBID_IsMem");
                        hide();
                    }

                });
                //else {
                //            hide();
                //        }
            }

            $scope.ComposePreview = function () {
                //console.log('called');
                var div = document.getElementById('tblPreview');
                var Flag = true;
                var ComposeFiledsWithValues = '';
                $("#ProductPreview").find('#PreviewpopLoader').show();
                $(div).find('input:text, input:file, textarea').each(function () {
                    var IsReq = $(this).attr('required');
                    if (IsReq != undefined && $(this).val().trim() == '') {
                        jAlert("Please Enter " + this.id);
                        Flag = false;
                        $("#ProductPreview").find('#PreviewpopLoader').hide();
                        return false;
                    }
                    if (this.type == 'file') {
                        datavalue = $("#imagepath").val().lastIndexOf('Upload') > 0 ? $("#imagepath").val() : '';
                        //console.log(datavalue);
                    }
                    else {
                        datavalue = $(this).val();
                    }
                    if (ComposeFiledsWithValues == '')
                        ComposeFiledsWithValues = this.id + '#~|~#' + datavalue + '#~|~#' + this.type;
                    else
                        ComposeFiledsWithValues = ComposeFiledsWithValues + '~#|#~' + this.id + '#~|~#' + datavalue + '#~|~#' + this.type;

                });

                var Group = $('#lblGroup').val();
                var Templatename = $('#lblTemplatename').val();

                if (Flag) {
                    var getCommeArgu = { GroupName: Group, TemplateName: Templatename, ComposeData: ComposeFiledsWithValues, PageNumber: '0' };
                    urlService.dataProvider(ComposePreview, "POST", getCommeArgu).success(function (response) {
                        if (response['ErrorMsg'] == "") {
                            $("#Imgpreview").attr("src", response['FiledPath']);
                            $("#lblComposeId").val(response['CompositionID']);
                            //  $('#CreateProof').prop('disabled', false);
                            $("#ProductPreview").find('#PreviewpopLoader').hide();
                            $("#hlkDownload").attr("href", response['DownloadLink']);

                            //Show Paging
                            //clear old buttons
                            $("#DivPaging button").remove();
                            var count = $("#lblCount").val();
                            for (var i = 1; i <= count; i++) {
                                var btnhtml = "<button class='' style='background-image: none;'>" + i + "</button>";
                                var newButt = angular.element(btnhtml);
                                newButt.bind('click', $scope.ComposePagePreview);
                                angular.element($("#DivPaging").append(newButt));
                            }
                            //Show Paging End

                            $("#spanDDL").show();
                        }
                        else {
                            jAlert(response['ErrorMsg']);
                            $("#ProductPreview").find('#PreviewpopLoader').hide();
                        }
                    });
                }
            };

            $scope.ComposePagePreview = function () {
                var pgnum = $(this).text();
                var getCommeArgu = { CompositionID: $("#lblComposeId").val(), PageOrChunkNumber: pgnum };
                urlService.dataProvider(GetPageURLPreview, "POST", getCommeArgu).success(function (response) {
                    if (response != 'File Not Found') {
                        $("#Imgpreview").attr("src", response);
                    }
                });
            };

            $scope.ComposePreviewClose = function () {
                $('#ProductPreview').removeClass('is-visible');
            };

            $scope.ComposeAddCart = function ($event, from) {
                //console.log('adding to cart');
                $scope.ComposePreview();
                if ($("#lblComposeId").val().trim() != '') {
                    $scope.AddToCart($("#lblProductId").val(), $event, from);
                    $('#ProductPreview').removeClass('is-visible');
                } else {
                    jAlert("Please preview the document before submitting it to shopping cart.");
                }

            }
        }]);


