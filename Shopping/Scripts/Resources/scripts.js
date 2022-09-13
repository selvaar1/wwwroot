//Fixed Header
//$(document).ready(function () {
//    $("#site_header").before($("#site_header").clone().addClass("animateIt"));
//    $(window).on("scroll", function () {
//        $("body").toggleClass("down", ($(window).scrollTop() > 100));
//    });
//});

//Search box header
$(document).ready(function () {
    var submitIcon = $('.searchbox-icon');
    var inputBox = $('.searchbox-input');
    var searchBox = $('.searchbox');
    var isOpen = false;
    submitIcon.click(function () {
        if (isOpen == false) {
            searchBox.addClass('searchbox-open');
            inputBox.focus();
            isOpen = true;
        } else {
            searchBox.removeClass('searchbox-open');
            inputBox.focusout();
            isOpen = false;
        }
    });
    submitIcon.mouseup(function () {
        return false;
    });
    searchBox.mouseup(function () {
        return false;
    });
    $(document).mouseup(function () {
        if (isOpen == true) {
            $('.searchbox-icon').css('display', 'block');
            submitIcon.click();
        }
    });
});
function buttonUp() {
    var inputVal = $('.searchbox-input').val();
    inputVal = $.trim(inputVal).length;
    if (inputVal !== 0) {
        $('.searchbox-icon').css('display', 'none');
    } else {
        $('.searchbox-input').val('');
        $('.searchbox-icon').css('display', 'block');
    }
}


// Sorting Navigation
$('document').ready(function(){	
		$('document').ready(function(){	
		/**
		* user defined functions
		*/
		jQuery.fn.jplist.settings = {			
			
			pricesSlider: function ($slider, $prev, $next){

				$slider.slider({
					min: 0
					,max: 100
					,range: true
					,values: [0, 80]
					,slide: function (event, ui){
						$prev.text('$' + ui.values[0]);
						$next.text('$' + ui.values[1]);
					}
				});
			}

			/* PRICES: jquery ui set values*/
			,priesValues: function ($slider, $prev, $next){

				$prev.text('$' + $slider.slider('values', 0));
				$next.text('$' + $slider.slider('values', 1));
			}		
			
		};
			
	$('#site_main').jplist({				
			itemsBox: '.product_data' 
			,itemPath: '.product_list' 
			,panelPath: '.site_main_inner'
			, effect: 'fade'	
        // ,duration: 400	//animation duration
         //,fps: 60 //frames per second value
		});
	});
	});
	
	
//Add Class Last Div
/*$(document).ready(function(){
 $('.product_list').each(function(e){
     if((e+1) % 4 == 0){
         $(this).addClass('last_div');
     }
 });
})*/	

//Word Limit
/*$(document).ready(function(){
$('.product_list h3.product_title').text(function(index, currentText) {
	if(currentText.length > 10){
    return currentText.substr(0, 40)+'...';
	}
	else
	{
	return currentText.substr(0, 10);
	}
});
})*/


function show() {
document.getElementById("preloader").style.display="block";
setTimeout("hide()", 1000); // 5 seconds
}
function hide() {
document.getElementById("preloader").style.display="none";
}


// Add to Cart

/*$(window).load(function(){
var data = {
    "total": 0,
    "rows": []
};
var totalCost = 0;
var viewModel = {
    cartItems: ko.observableArray(),
    deleteItem: function() {
        viewModel.cartItems.remove(this);
        var rowCount = document.getElementById("cartcontent1").getElementsByTagName("TR").length;
        document.getElementById("Total").innerHTML = rowCount;
    },
}

viewModel.total = ko.computed(function() {
    var sum = 0;
    ko.utils.arrayForEach(this.cartItems(), function(item) {
        sum += item.subTotal();

    });
    return sum;
},

viewModel);

function item(name, price) {
    var self = this;
    self.name = name;
    self.qty = ko.observable(1);
    self.price = price;
    self.subTotal = ko.computed(function() {
        return self.qty() * self.price;
    });
}

$(function() {
    ko.applyBindings(viewModel);

    $('.product_list .add_cart_btn').click(function() {
        addToCart($(this).parent());
    });

    $('.product_list').draggable({
        revert: true,
        proxy: 'clone',
        handle: 'img',
        //cancel: 'button', // jqueryUI only
        onStartDrag: function() {
            $(this).draggable('options').cursor = 'not-allowed';
            $(this).draggable('proxy').css('z-index', 10);
        },
        onStopDrag: function() {
            $(this).draggable('options').cursor = 'move';
        }
    });
    $('.cart').droppable({
        onDragEnter: function(e, source) {
            $(source).draggable('options').cursor = 'auto';
        },
        onDragLeave: function(e, source) {
            $(source).draggable('options').cursor = 'not-allowed';
        },
        onDrop: function(e, source) {
            addToCart($(source));
        }
    });

    function addToCart(source) {
        var name = source.find('p:eq(0)').html();
        var price = source.find('p:eq(1)').html();
        var cartItem = new item(name, parseFloat(price.split('$')[1]));

        // check duplicate
        var match = ko.utils.arrayFirst(viewModel.cartItems(), function(item) {
            return item.name == name;
        });
        if (match) {

            match.qty(match.qty() + 1);
        } else {
            viewModel.cartItems.push(cartItem);
            var rowCount = document.getElementById("cartcontent1").getElementsByTagName("TR").length;
            document.getElementById("Total").innerHTML = rowCount;
        }
    }
});
});*/


// Cart Popup

jQuery(document).ready(function($){
	//open popup
	$('.cart-popup-trigger').on('click', function(event){
		event.preventDefault();
		$('.cart-popup').addClass('is-visible');
	});
	
	//close popup
	$('.cart-popup').on('click', function(event){
		if( $(event.target).is('.cart-popup-close') || $(event.target).is('.cart-popup') ) {
			event.preventDefault();
			$(this).removeClass('is-visible');
		}
	});
	//close popup when clicking the esc keyboard button
	$(document).keyup(function(event){
    	if(event.which=='27'){
    		$('.cart-popup').removeClass('is-visible');
	    }
    });
});


//Product Display
function toggle_visibility(id) {
       var e = document.getElementById(id);
       if(e.style.display == 'block')
          e.style.display = 'none';
       else
          e.style.display = 'block';
    }
	
	
// Slider
$(function() {
      $('#slides').slidesjs({
		  
		  width: 870,
        height: 280,
		
		navigation: {
      active: true,
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
      pauseOnHover: false,
        // [boolean] pause a playing slideshow on hover
      restartDelay: 3000,
        // [number] restart delay on inactive slideshow
		
    }
	
      });
    });	
	
	
	
// Show Hide Banner

$(document).ready(function() {
    $("#show_banner").toggle(function() {
        $(this).text('Show Banner');
    }, function() {
        $(this).text('Hide Banner');
    }).click(function(){
        $("#slides").slideToggle("fast");
    });
});


//Products Zoom
	$(window).load(function() {
		$('.sp-wrap').smoothproducts();
	});

// Mobile Menu	
$(document).ready(function(){
	$('.site_navigation').slicknav({
		//prependTo:'#mobile_nav',
		closeOnClick:true,
		allowParentLinks:true
	});
});	

// Mobile Account Menu	
$(document).ready(function(){
	$('.account_links').slicknav({
		prependTo:'#account_nav_mobile',
		label:'My Account',
		closeOnClick:true,
		allowParentLinks:true
	});
});	

