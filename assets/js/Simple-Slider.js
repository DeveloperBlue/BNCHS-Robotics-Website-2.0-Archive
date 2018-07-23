$(function(){

    // Initializing the swiper plugin for the slider.
    // Read more here: http://idangero.us/swiper/api/
    
    var mySwiper = new Swiper ('.swiper-container', {
        loop: true,
        speed: 800,
        autoHeight: true,
        effect: "slide",
        autoplay: 8000,
        pagination: '.swiper-pagination',
        // paginationClickable: true,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev'
    });
    
    /*
    function autoFlipSlide(){
        
        console.log("Flipping slide . . .");
        var shouldRotate = true;
        
        $(".swiper-container").getElementsByTagName("*").each(function(){
            if ($(this).is(':focus') == true){
                console.log($(this) + " currently focused.");
                shouldRotate = false;
                break;
            }
        })
        
        if (shouldRotate){
            console.log("Flipping slide");
            mySwiper.slideNext();
        }
        
    }
    
    setInterval(autoFlipSlide, 4000);
    */
    
});