$(function(){
	$('.right img').click(function(){
		$('.modalContainer').toggleClass('hidden');
		return false;
	});

	$('.modalContainer .close').click(function(){
		$('.modalContainer').addClass('hidden');
		return false;
	});
});