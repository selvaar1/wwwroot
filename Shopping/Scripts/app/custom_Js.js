//loader

function hide() {
    document.getElementById("preloader").style.display = "none";
}

function show() {
    document.getElementById("preloader").style.display = "block";
}

var theDialog = $(".mydialog").dialog({
    autoOpen: false,
    resizable: false,
    modal: true,
    width: 'auto'
});

//Slider
function slideShow() {
    setTimeout(function () {
        var imgArray = $('.slideImg');
        $('#slides').slidesjs({

            width: 870,
            height: 280,

            navigation: {
                active: imgArray.length <= 1 ? false : true,
                // [boolean] Generates next and previous buttons.
                // You can set to false and use your own buttons.
                // User defined buttons must have the following:
                // previous button: class="slidesjs-previous slidesjs-navigation"
                // next button: class="slidesjs-next slidesjs-navigation"
                effect: "fade"
                // [string] Can be either "slide" or "fade".
            },

            effect: {
                slide: {
                    // Slide effect settings.
                    speed: 200
                    // [number] Speed in milliseconds of the slide animation.
                },
                fade: {
                    speed: 300,
                    // [number] Speed in milliseconds of the fade animation.
                    crossfade: true
                    // [boolean] Cross-fade the transition.
                }
            },

            pagination: {
                active: false,
                // [boolean] Create pagination items.
                // You cannot use your own pagination. Sorry.
                effect: "fade"
                // [string] Can be either "slide" or "fade".
            },
            play: {
                active: true,
                // [boolean] Generate the play and stop buttons.
                // You cannot use your own buttons. Sorry.
                effect: "fade",
                // [string] Can be either "slide" or "fade".
                interval: 3000,
                // [number] Time spent on each slide in milliseconds.
                auto: true,
                // [boolean] Start playing the slideshow on load.
                swap: true,
                // [boolean] show/hide stop and play buttons
                pauseOnHover: true,
                // [boolean] pause a playing slideshow on hover
                restartDelay: 3000,
                // [number] restart delay on inactive slideshow

            }

        });
    }, 2000);
};

var showHide = 0;
$(document).ready(function () {
    $("#show_banner").click(function () {
        if (showHide == 0) {
            $(this).text('Show Banner');
            $("#slides").hide();
            showHide = 1;
        } else if (showHide == 1) {
            $(this).text('Hide Banner');
            $("#slides").show();
            showHide = 0;
        }
    });

    //PopUp Product close
    $('#popClose').click(function () {
        $(this).parents().find('div.product_quick_view').hide();
    });
});

//Change Grid/List Views
function viewChange(id) {
    if (id == "pd_listView") {
        $('#products_view').removeClass('pd_gridView').addClass('pd_listView');
    } else if (id == "pd_gridView") {
        $('#products_view').removeClass('pd_listView').addClass('pd_gridView');
    }
};

// Cart Popup
jQuery(document).ready(function ($) {

    var sesCustomerId = '';
    //close popup
    $('.cart-popup').on('click', function (event) {
        if ($(event.target).is('.cart-popup-close') || $(event.target).is('.cart-popup')) {
            event.preventDefault();
            $(this).removeClass('is-visible');
            $('.cart-popup-container').removeAttr('style');

            $('.addressList').hide();
            sessionStorage.removeItem('fromCartPop');
            sessionStorage.removeItem('fromReviewPop');
        }
    });

    $('.wishlist-popup').on('click', function (event) {
        if ($(event.target).is('.cart-popup-close') || $(event.target).is('.cart-popup')) {
            event.preventDefault();
            $(this).removeClass('is-visible');
        }
    });

    //close popup when clicking the esc keyboard button
    $(document).keyup(function (e) {
        if (e.which == '27') {
            $('.cart-popup').removeClass('is-visible');
        }

    });

    $(document).keypress(function (e) {
        //validations
        var flag = true;
        if (e.target.className == "cartdetails" || e.target.className == "ProductQuantity" || e.target.className.indexOf("qty") != -1 || e.target.className.indexOf("ccNumInput") != -1) {

            var txtbox = e.target;

            if (txtbox.value != 0) {
                //Numeric validation           
                if (e.which != 13) {
                    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
                        e.preventDefault();
                        return false;
                    }
                }
            }
        }

    });

    $('#continue_form').keypress(function (e) {

        if (e.which === 46) return false;
    }).on('input', function () {
        var self = this;
        setTimeout(function () {
            if (self.value.indexOf('.') != -1) self.value = parseInt(self.value, 10);
        }, 0);
    });

    $("input:file").live("change", function () {
        var data = new FormData();
        var files = $(this).get(0).files;
        if (files.length > 0) {
            data.append("MyImages", files[0]);
        }

        $.ajax({
            url: applicationUrl + "/Product/UploadFile",
            type: "POST",
            processData: false,
            contentType: false,
            data: data,
            success: function (response) {
                ////code after success
                //$("#txtImg").val(response);
                //$("#imgPreview").attr('src', '/Upload/' + response);
                $("#imagepath").val(response);
            },
            error: function (er) {
                alert(er);
            }

        });
    });
});

$(document).on('click', "#useOther, #ccType", function (event) {

    var evt = event || window.event;

    if (evt.target.id == "useOther") {
        $('#CreditCardForm').show();
        $('#CreditCardForm').removeClass("ng-hide");
    } else {
        $('#CreditCardForm').hide();
        clearCC();
    }
});
function clearCC() {
    $("#CCName").val('');
    $("#CCNumber").val('');
    $("#CCcvv").val('');
    $("#months").val("string:Month");
    $("#years").val('string:Year');
    $("#useOtherVal").text("false");
    $("#saveCCCard").prop("checked", false);
};
//$("#addAddressNew").click(function () {
//    $("#addAddressBilling").show();
//});
//$('#addNewAddress').click(function () {
//    $('#addAddress').show();
//    $(".actions").hide();
//});

$('#changeAddress').click(function () {
    $('.addressList').show();
    $(".actions").hide();
});

// Multi Step
$(document).ready(function () {

    $('.btnCancel').on("click", function () {
        $('#CreditCardForm').hide();
        $('.addressList').hide();
        $(".actions").show();
    });

    $('.step_trigger').on('click', function () {
        var updateCart = true;

        //$('#CreditCardForm').hide();
        $('.addressList').hide();
        $(".actions").show();
        var scope = angular.element(document.getElementById('step1_MyCart')).scope();
        var scope1 = angular.element(document.getElementById('step2_Shipping')).scope();
        var appElement = document.querySelector('[ng-app=AoaShopping]');
        var appScope = angular.element(appElement).scope();
        var controllerScope = appScope.$$childHead;

        if ($(this).attr('id') == 'myCart') {
            if (controllerScope.CartDetailsLength == '0') {
                $('#alrtMsg').empty();
                var txtLgn = "No products to continue!";
                $('#alrtMsg').show().html(txtLgn);
                return
            }

            //check the before continue is uer is login
            if (scope.sesCustomerId == null || scope.sesCustomerId == "") {
                $('#alrtMsg').empty();
                ////  var txtLgn = "Please <a href='" + applicationUrl + "/Login/index?url=" + window.location.href + "'>Login</a> to continue!";
                //var url = applicationUrl + '/Login/index';
                ////   var txtLgn = "Please <a href='javascript:;' onclick='window.open(" + url + ", 'Login', 'scrollbars=yes, resizable=yes, top=200, left=500, width=400, height=400');'>Login</a> to continue!";
                //var txtLgn = "Please  <a href='javascript:;' onclick='RDTOLogin();'>Login</a> to continue!";
                //$('#alrtMsg').show().html(txtLgn);
                RDTOLogin();
                sessionStorage.setItem('fromCartPop', 'fromCart');
                return false;
            }

            //UpdateToCart Method access when continue
            scope.$apply(function () {

                if (scope.UpdateToCart('cart')) {

                    updateCart = false;
                }
                try {
                    //Getting Shipping Charges based on the locations
                    scope.shipViaCodeClient();

                    //Getting Countries
                    scope.getCountries();

                    //Getting States
                    scope.getStates();

                    //scope.clearForm();
                } catch (e) {

                }

            });
        }

        if (updateCart) {

            if ($(this).attr('id') == 'addressTab') {

                $('.cart-popup-container').removeAttr('style');

                if ($('#shipViaCodeDD').val() == "") {
                    jAlert("Please select Shipping Preference");
                    return;
                }
                //if (!$('.addCheckBilling').is(':checked')) {
                //    jAlert("Please Check the Billing Address!");
                //    return;
                //}
                if (!$('.addCheckShiiping').is(':checked')) {
                    jAlert('Please Check the Shipping Address!');
                    return;
                }
                $('#popLoader').show();

                scope1.taxShippingPrice();
                //scope1.clearForm();
            }

            var divID = $(this).attr('data-box');
            $(this).addClass('trigger_active').siblings().removeClass('trigger_active');
            $('#' + divID).addClass('step_active').siblings().removeClass('step_active');
        }
    });
});

//Factorial Search function

function RDTOLogin() {
    setTimeout(function () {
        $('#LoginPopup').addClass('is-visible');
    }, 500);
}

//Sorting string Array 
function length_alpha_sort2(astr, bstr) {

    astr += '';
    bstr += '';
    if (astr.length != bstr.length) {
        return astr.length - bstr.length;
    }
    return (astr < bstr) ? -1 : (astr > bstr) ? 1 : 0;
};

//Sorting object based on length of property
function SortByLength(astr, bstr) {

    astr.SearchWordLength += '';
    bstr.SearchWordLength += '';
    if (astr.SearchWordLength != bstr.SearchWordLength) {
        return astr.SearchWordLength.length - bstr.SearchWordLength;
    }
    if (astr.SearchWordLength == bstr.SearchWordLength) {
        return astr.SearchItems.length - bstr.SearchItems.length;
    }

    return (astr.SearchWordLength < bstr.SearchWordLength) ? -1 : (astr.SearchWordLength > bstr.SearchWordLength) ? 1 : 0;
};

//Generating   Combinations of search word
function getCombinationWords(searchWord) {

    var string = searchWord;
    var sArray = string.split(' ');
    var n = sArray.length;

    sArray.sort(length_alpha_sort2);

    var combinations = "";
    for (var i = 0; i < n; i++) {
        for (var j = 0; j <= i; j++) {
            combinations = combinations + sArray.slice(j, n - i + j).join(' ') + ', ';

        }
    }
    //console.log(combinations)
    return combinations;
}

//remove duplicate object in array
var unique = function (origArr) {
    var newArr = [],
        origLen = origArr.length,
        found, x, y;
    for (x = 0; x < origLen; x++) {
        found = undefined;
        for (y = 0; y < newArr.length; y++) {
            if (origArr[x] === newArr[y]) {
                found = true;
                break;
            }
        }
        if (!found) {
            var products = $.grep(newArr, function (obj) {
                return obj.ProductId == origArr[x].ProductId;
            });
            if (products.length == 0) {
                newArr.push(origArr[x]);
            }
        }
    }
    return newArr;
}

//Factorial Search
var i = 0;
function factorialSearch(products, searchWord) {
    if (searchWord.length > 0) {
        var searchItems = [];
        angular.forEach(getCombinationWords(searchWord).split(','), function (predicate) {

            if (predicate.trim().length == 0)
                return;
            var items = {};
            var arr = predicate.trim().split(' ');
            var str = "";

            $.each(arr, function (index, value) {
                str += " (n.ProductName.toLowerCase().indexOf('" + value.toLowerCase() + "') > -1 || n.ProductCode.toLowerCase().indexOf('" + value.toLowerCase() + "') > -1)   &&";
                //console.log(str)
            });

            if (str.length > 0) {
                if (str.substring(str.length, str.length - 2) == "&&") {
                    str = str.substring(0, str.length - 2);
                }
            }

            items = $.grep(products, function (n, i) { // just use arr
                return eval(str);
            });
            //console.log(items);
            if (items.length > 0) {
                var srchItems = {}
                srchItems["SearchWordLength"] = predicate.trim().length;
                srchItems["SearchItems"] = items;
                srchItems["SearchWord"] = predicate.trim();
                searchItems.push(srchItems);
            }

        });

        searchItems = searchItems.sort(SortByLength);

        var actualItems = [];

        $.each(searchItems, function (index, obj) {
            if (obj.SearchItems.length > 0)
                Array.prototype.push.apply(actualItems, obj.SearchItems);
        });

        var arrUnique = unique(actualItems);

        return arrUnique;
    }

}

//end

// Mobile Menu	
$(document).ready(function () {
    $('.site_navigation').slicknav({
        //prependTo:'#mobile_nav',
        closeOnClick: true,
        allowParentLinks: true
    });

    $(".site_navigation ul li a").click(function (e) {
        $(".site_navigation ul li a").removeClass("current");
        $(this).addClass("current");

    });
});



// Get the header
var header = document.getElementById("menu");

// Get the offset position of the navbar

// Mobile Account Menu	
$(document).ready(function () {
    $('.account_links').slicknav({
        prependTo: '#account_nav_mobile',
        label: 'My Account',
        closeOnClick: true,
        allowParentLinks: true
    });

    $(document).on('click', '.add_credit_cart_btn', function (event) {
        $('#CreditCardForm').show();
        $("#useOtherVal").text("true");
    });
});

function printOrder() {

    var divToPrint = $('.order_received_details').html();

    var contents = $('.order_received_details').html();
    var frame1 = document.createElement('iframe');
    frame1.name = "frame1";
    frame1.style.position = "absolute";
    frame1.style.top = "-1000000px";
    document.body.appendChild(frame1);
    var frameDoc = frame1.contentWindow ? frame1.contentWindow : frame1.contentDocument.document ? frame1.contentDocument.document : frame1.contentDocument;
    frameDoc.document.open();
    frameDoc.document.write('<html><head><link href="../Content/style.css" rel="stylesheet" type="text/css"></head><title>Order Contents</title>');
    frameDoc.document.write('</head><body>');
    frameDoc.document.write(contents);
    frameDoc.document.write('</body></html>');
    frameDoc.document.close();
    setTimeout(function () {
        window.frames["frame1"].focus();
        window.frames["frame1"].print();
        document.body.removeChild(frame1);
    }, 500);
    return false;
};

$(document).on('click', 'span.catTags a', function () {
    var scope = angular.element(document.getElementById('selctedCatsNames')).scope();

    var inputItem = $(this).attr("data-catType");
    var inputitemId = $(this).attr('data-catId');

    if (inputitemId != 'All') {
        $.each($('.' + inputItem), function () {
            if ($(this).attr('id') == inputitemId) {
                $(this).prop('checked', false);
            }
        });

        $(this).parent().remove();
    }
    else {
        var filter = ['category', 'format', 'topic', 'memberproducts', 'nonmemberproducts']
        var i = 0;
        for (i; i < filter.length; i++) {
            $.each($('.' + filter[i]), function () {
                $(this).prop('checked', false);
            });
            $(this).parent().remove();
        }
    }

    scope.$apply(function () {
        scope.BindProducts();
    });

});

function ViewMeetingProduct(PID) {

    window.location.href = window.location.protocol + "//" + window.location.hostname + "/Conference/users?p=" + PID;
}

//View Product
function viewProduct(href,ProductName) {
    
    if (ProductName !=null) ProductName = ProductName.replace(/[^a-z0-9\s]/gi, '');
//    console.log(b);

    var viewProduct = '/Product/viewproduct/';

    if (!isNaN(parseInt(href))) {
        window.location.href = applicationUrl + viewProduct + href + "/" + ProductName;
        return
    }
    if (href == "/Login/Index") {
        //var currentUrl = window.location + '';
        //console.log(currentUrl);
        //var xyz = applicationUrl + href + '?url=' + currentUrl;
        //var w = 500;
        //var h = 400;
        //var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
        //var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

        //var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        //var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        //var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        //var top = ((height / 2) - (h / 2)) + dualScreenTop;

        //var myWindow = window.open(xyz, 'Login', 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        RDTOLogin();

    } else {
        window.location.href = applicationUrl + href+"/aaaadddd";
    }
}

$(document).ready(function () {
    setTimeout(function () {
        if (sessionStorage.getItem('fromCartPop') == "fromCart") {
            var scope = angular.element(document.getElementById('site_header')).scope();
            scope.$apply(function () {
                scope.OpenCart();

                sessionStorage.removeItem('fromCartPop');
            });
        }
        else if (sessionStorage.getItem('fromReviewPop') == "fromReview") {
            var scope = angular.element(document.getElementById('site_header')).scope();
            scope.$apply(function () {
                scope.reviewPopup();
                sessionStorage.removeItem('fromReviewPop');
            });
        }
    }, 500);
});

function register() {
    window.location.href = window.location.protocol + "//" + window.location.hostname + "/Login/Register?returnURL=" + window.location;
    // "https://www.aoa.org/SSO/Register?return=" + encodeURIComponent('/login?redir=' + window.location);
    //https://www.aoa.org/SSO/Register?return=%2flogin%3fredir%3dhttp%3A%2F%2F182.18.172.127%2FAoaShoppingCart_v9.1%2F
}

// Mobile Filter Options
$(window).load(function () {
    $('#showFilter').click(function (e) {
        $('.left_sidebar').fadeIn('slow', function () {
            $('.left_sidebar').fadeIn('slow');
        });
    });
    $('#hideFilter').click(function (e) {
        $('.left_sidebar').fadeOut('slow', function () {
            $('.left_sidebar').fadeOut('slow');
        });
    });

    var currPage = $(".currentPage").text(),
        currPageSpl = currPage.split(">");

    $(".site_navigation ul li a").each(function () {
        if ($(this).text().toLowerCase() == currPageSpl[currPageSpl.length - 1].toLowerCase().trim()) {
            $(".site_navigation ul li a").removeClass("current");
            $(this).addClass("current");
        }
    });
});

$(window).resize(function () {
    if ($(window).width() >= 780) {
        $('.left_sidebar').removeAttr('style');
    }
});

var getQueryString = function (field, url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
};

function ShareProduct(From) {
    var tittle = $(".productTitle").text().replace("&", "%26");
    var url = window.location.href;
     
    var indexUrl = getQueryString('productid', url)

    var fburl = applicationUrl + "/Product/viewproduct/" + indexUrl;
    if (From == 'twitter') {
        window.open("https://twitter.com/share?url=" + url + "&text=" + tittle + "");
    } else if (From == 'facebook') {
        window.open("http://www.facebook.com/sharer/sharer.php?u=" + fburl);
    } else if (From == 'gplus') {
        window.open("https://plus.google.com/share?url=" + url + "&text=" + tittle + "");
    } else if (From == 'linkedin') {
        window.open("http://www.linkedin.com/shareArticle?url=" + url + "&text=" + tittle + "");
    }
    else if (from = 'email') {
        var VSubject = tittle;
        var Vbody = 'Check out this product on the ATA Store! ' + url;
        window.location.href = "mailto:?subject=" + VSubject + "&body=" + Vbody + "";
    }

    // <a class="fa fa-facebook share-base share-facebook" onclick="window.open('https://www.facebook.com/dialog/share?app_id=your_app_id&display=popup&href=the_authorized_link&redirect_uri=the_authorized_link')"></a>

}

//Time Stamp convert into Diasplay Time Zoze
function convertTimestamp(timestamp) {
    var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh == 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM	
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
    return time;
}

function selectcat(catid) {
    sessionStorage.removeItem("Format");
    sessionStorage.removeItem("Category");
    sessionStorage.removeItem("Topic");
    sessionStorage.removeItem("member");
    sessionStorage.removeItem("nonmember");
    var scope;
    $('.category').each(function () {
        if ($(this).attr('id') == catid) {
            $(this).attr("checked", true);
            $(this).trigger("click");
        }
        else {
            $(this).attr("checked", false);
            $(this).trigger("click");
        }
    });

}