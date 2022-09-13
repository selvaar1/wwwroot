//Get data from Methods
var LoginInfo = '/Login/LoginInfo',

    categoryMethod = '/home/getItems',
    allProductsMethod = '/home/GetProducts',

    sessionMethod = '/Product/GetSessionInfo',
    addToCartMethod = '/Product/AddProductToCart',
    cartDetailsMethod = '/Product/GetCartDetails',
    saveWishlistMethod = '/Product/SaveWishList',
    getWishlistMethod = '/Product/GetWishListItems',
    getFavouriteItems = '/Product/GetFavouriteItems',
    removeFavouriteItems = '/Product/RemoveFavouriteItem',
    relatedProductsMethod = '/Product/GetRelatedItems',
    getRecentlyViewedItems = '/Product/GetRecentlyViewedItems',
    addRecentlyViewedItems = '/Product/AddToRecentlyVieweddItem',
    getOrInsertProductRevuew = '/Product/GetProductReviews',
    getSingleProduct = '/Product/GetProductDetails',

    getCountryMethod = '/Order/GetCountries',
    getStateMethod = '/Order/GetStates',
    GetAddressesMethod = '/Order/GetAddresses',
    GetCreditCardMethod = '/Order/GetCreditCards',
    GetOrderHistory = '/Order/GetOrderHistory',
    GetSearchedOrderHistoryDetails = '/Order/GetSearchedOrderHistoryDetails',
    GetSearchedOrderHistoryDetailsByDates = '/Order/GetSearchedOrderHistoryDetailsByDates',
    GetOrderReorder = '/Order/OrderReorder',
    GetOrderInvoiceByOrNo = '/Order/GetOrderInvoiceByOrNo',
    GetDigitalDownloads = '/Order/GetOrderedECDFileLinks',
    createOrderMethod = '/Order/CreateOrderNew',
    applyCouponforOrder = '/Order/ApplyCouponforOrder',
    getOrderdeatilsMethod = '/Order/GetOrderdeatils',
    addCCardMethod = '/Order/AddCreditCard',
    addAddressMethod = '/Order/AddAddress',
    shipViaCodeMethod = '/Order/GetShipViaCodes',
    ProductComposeFileds = '/Order/ProductComposeFileds',
    ComposePreview = '/Order/PreviewUrl',
    setAddress = '/Order/ChangeAddress',
    GetPageURLPreview = "/Order/GetPageURL";

//set Default image service
AoaShopping.factory('defaultImg', function () {
    return {
        noImageUrl: applicationUrl + '/Images/Image-not-available.png'
    };
});

//Accessing all methods
AoaShopping.factory('urlService', ['$http', function ($http) {
    show();
    return {
        dataProvider: function (url, type, params) {
            return $http({
                method: type,
                url: applicationUrl + url,
                params: params,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).success(function (data) {
                return data;
            }).error(function (x) {

            });
        }
    }
}]);

AoaShopping.factory("productCart", function ($http, $log, $q, urlService) {
    function addingToCart(obj, scope, from) {
        if (from == 'delete')
            $('#popLoader').show();
        var reqdata = { 'cItems': JSON.stringify(obj) };
        console.log(reqdata);

        //return $http({
        //    method: "POST",
        //    url: applicationUrl + '/Product/AddProductToCart',
        //    params: { 'itemstoUpdate': JSON.stringify(obj) },
        //    contentType: "application/json; charset=utf-8",
        //    dataType: "json"
        //}).success(function (data) {
        //    debugger;
        //    console.log('success:'+data)
        //}).error(function (x) {
        //    debugger;
        //    jAlert(x);
        //});

        urlService.dataProvider(addToCartMethod, "POST", reqdata).success(function (data) {
            if (data == "PRODUCTMEMBER_ONLY") {
                if (scope.sesCustomerId != '') {
                    jAlert('This Product is only for members.');
                    hide();
                } else {
                    jConfirm("This product is for Members Only. \n please login to add to your cart or cancel to return to the previous screen?", function (status) {
                        if (status == true) {
                            var currentUrl = window.location + '';
                            $('#LoginPopup').addClass('is-visible');
                        }
                    });
                }
                
            }
            if (data.indexOf("REMAINING_") != -1) {
                //jAlert('You remain to add upto ' + parseFloat(data.replace('REMAINING_', '')) + ' out of ' + parseFloat(this.currentProduct.StockAvailable) + '!');
                jAlert('There are only ' + parseFloat(data.replace('REMAINING_', '')) + ' left in stock. Please lower your quantity selection.');
            }
            else if (data == "ADDED_FAIL") {
                jAlert('Unable to add product to cart, Please try later.');
            }

            var winLoc = window.location + '',
                wLArray = winLoc.split('/'),
                pageUrl = wLArray.indexOf("Product")==-1?wLArray.indexOf("Order"):0;

            if (pageUrl > -1) {
                scope.GetCartProducts(from);
            } else {
                scope.getCartData();
            }

            hide();

            if (from == 'delete')
                $('#popLoader').hide();

            if (data == "ADDED_SUCCESSFULLY") {
                /* Deleting Wishlist item once its added to cart */
                if (from == "wishlist")
                    scope.AddToWishList(obj.ProductId, scope.sesCustomerId);
                $('#checkout').show();
                $("#cartMsg").show(function () {
                    setTimeout(function () { $("#cartMsg").hide(); }, 2000);
                });
            }
        }).error(function () {
            try {
                hide();
                $('#popLoader').hide();
            } catch (e) {

            }
        });
    };
    return {
        currentProduct: '',
        view: true,
        wishlist: false,
        favourite: false,
        userQuantity: '',
        isUmbrella: false,

        ProductAddToCart: function (id, scope, from, event) {
            show();
            $('#alrtMsg').empty();
            if ($("#avalQuantity").val() == 0) {
                jAlert("Minimum Quantity Should be 1!");
                return
            }
            var getEvent = window.event || event;
            this.productSetting(from);
            this.getProductItem(id, getEvent).success(function (d) {
                 
                if ($(getEvent.target).attr("data-umb") != "true" || typeof $(getEvent.target).attr("data-umb") === "undefined") {
                    this.currentProduct = d;
                } else {
                    //this.currentProduct = $.grep(d.UmbrellaSubProducts, function (itemType, i) {
                    //    //console.log($("#prdQuantity").val())
                    //    return (itemType.Option1Subcode == $("#prdQuantity").val())
                    //});
                    this.currentProduct = $.grep(d.UmbrellaSubProducts, function (itemType, i) {
                        //console.log($("#prdQuantity").val())
                        return (itemType.ProductId == id)
                    });
                    this.currentProduct = this.currentProduct[0];
                };
                var svcode = scope.shipViaCodeDD == undefined ? 'UPS-G' : scope.shipViaCodeDD.Code;
                var cartArguArray = [];
                var cartArgu = {
                    ProductId: this.currentProduct.ProductId,
                    Quantity: from == "delete" ? 0 : $("#avalQuantity").val() || $("#" + this.currentProduct.ProductId).val() || 1,
                    From: from,
                    StrCustomOrStandard: '',//scope.viewUmbrellProductDD || '',
                    ComposeID: '',
                    IP:$(getEvent.target).attr("data-IP"),
                    shipviacode: svcode,
                    OriginalProductId: $("#opid").val()
                };
                cartArguArray.push(cartArgu);
                //console.log(this.currentProduct.Inventoried);

                if (this.currentProduct.Inventoried == true) {
                    if (this.currentProduct.StockAvailable >= 1) {
                        if (from == "delete")
                        {
                            addingToCart(cartArguArray, scope, from);
                        }
                        else if (this.currentProduct.StockAvailable >= parseFloat($("#avalQuantity").val() || $("#" + this.currentProduct.ProductId).val()) || typeof $("#avalQuantity").val() === "undefined") {
                            addingToCart(cartArguArray, scope, from);
                        } else {
                            hide();
                            //jAlert('This Product Stock Availability upto ' + parseFloat(this.currentProduct.StockAvailable) + '!');
                            jAlert('There are only ' + parseFloat(this.currentProduct.StockAvailable) + ' left in stock. Please lower your quantity selection.');
                            return
                        }
                    } else {
                        //console.log("Check Backorder is available");
                        if (this.currentProduct.BackorderAvailable == true && this.currentProduct.StockAvailable <= 0) {
                            //jConfirm("Are you sure you want to place a backorder for this item?", function (status) {
                            //    if (status == true) {
                            addingToCart(cartArguArray, scope, from);
                            //    } else {
                            //        hide();
                            //    }
                            //});
                        } else {
                            hide();
                            jAlert('Out Of Stock!');
                        }
                    }
                } else {

                    addingToCart(cartArguArray, scope, from);
                }
            });
        },
        ProductUpdatedFromCart: function () {

        },
        getProductItem: function (itemId, umb) {
            var umbProduct = $(umb.target).attr("data-umb");

            console.log("itemId", itemId);

            if (umbProduct != "true") {
                var deferred = $q.defer();
                return $http({
                    method: "GET",
                    url: applicationUrl + '/Product/GetProductDetails',
                    params: { ProductId: itemId },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (data) {
                    //console.log("Product");
                    //console.log(data);
                    deferred.resolve(data);
                }).error(function (x) {
                    deferred.reject(x);
                });
                return deferred.promise;
            } else {
                itemId = $(umb.target).attr("data-parenetId")
                var deferred = $q.defer();
                return $http({
                    method: "GET",
                    url: applicationUrl + '/Product/GetSubProductDetails',
                    params: { ProductId: itemId },
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (data) {
                    //console.log("Sub Product");
                    //console.log(data);
                    deferred.resolve(data);
                }).error(function (x) {
                    deferred.reject(x);
                });
                return deferred.promise;
            }
        },
        productSetting: function (from) {
            if (from == "wishlist") {
                this.wishlist = true;
            } else if (from == "fav") {
                this.favourite = true;
            } else {
                this.wishlist = false;
                this.favourite = false;
            };
        }

    }
});