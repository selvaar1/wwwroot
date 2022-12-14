/*
 jPList - jQuery Data Grid Controls - http://jplist.com 
 Copyright 2014 jPList Software. All rights reserved.
*/
(function(){jQuery.fn.jplist.ui.controls.ViewsDTO=function(d){this.view=d}})();(function(){var d=function(a,b){var c;c=null;c=a.params.defaultView;c=b?a.params.defaultView:a.params.currentView;c=new jQuery.fn.jplist.ui.controls.ViewsDTO(c);return c=new jQuery.fn.jplist.app.dto.StatusDTO(a.name,a.action,a.type,c,a.inStorage,a.inAnimation,a.isAnimateToTop,a.inDeepLinking)},f=function(a){a.params.$buttons.on("click",function(){var b=jQuery(this).attr("data-type");a.$root.removeClass(a.params.types.join(" ")).addClass(b);a.params.currentView=b;a.history.addStatus(d(a,!1));a.observer.trigger(a.observer.events.unknownStatusesChanged,
[!1])})},e=function(a){a.params={$buttons:a.$control.find("[data-type]"),defaultView:a.$control.attr("data-default")||"list-view",currentView:a.$control.attr("data-default")||"list-view",types:[]};0<a.params.$buttons.length&&(a.params.$buttons.each(function(){var b=jQuery(this).attr("data-type");b&&a.params.types.push(b)}),f(a));return jQuery.extend(this,a)};e.prototype.getStatus=function(a){return d(this,a)};e.prototype.getDeepLink=function(){var a="",b;this.inDeepLinking&&(b=d(this,!1),b.data&&
(a=this.name+this.options.delimiter0+"view="+b.data.view));return a};e.prototype.getStatusByDeepLink=function(a,b){var c=null;this.inDeepLinking&&(c=d(this,!0),c.data.view=b);return c};e.prototype.setStatus=function(a,b){a.data&&(this.$root.removeClass(this.params.types.join(" ")),!this.inStorage&&b?(this.$root.addClass(this.params.defaultView),a.data.view=this.params.defaultView,this.params.currentView=this.params.defaultView,this.observer.trigger(this.observer.events.statusChanged,[a])):(this.$root.addClass(a.data.view),
this.params.currentView=a.data.view))};jQuery.fn.jplist.ui.controls.Views=function(a){return new e(a)};jQuery.fn.jplist.controlTypes.views={className:"Views",options:{}}})();


