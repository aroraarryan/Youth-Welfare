// Global variables for carousel
let currentSlideIndex = 0;
let slides;
let totalSlides;

// Global function for carousel navigation (called by HTML buttons)
function changeSlide(direction) {
    if (!slides || slides.length === 0) return;
    
    // Remove active class from current slide
    slides[currentSlideIndex].classList.remove('active');
    
    // Calculate new slide index
    currentSlideIndex += direction;
    
    // Loop back to start or end
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    }
    
    // Add active class to new slide
    slides[currentSlideIndex].classList.add('active');
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Initialize carousel variables
    slides = document.querySelectorAll('.carousel-slide');
    totalSlides = slides.length;

    // Auto-rotate carousel every 4 seconds
    if (slides.length > 0) {
        setInterval(() => {
            changeSlide(1);
        }, 4000);
    }

    // Accordion functionality
    const accordionHeaders = document.querySelectorAll(".accordion-header");
    accordionHeaders.forEach((header) => {
        header.addEventListener("click", function () {
            const accordionItem = this.parentElement;
            const accordionBody = accordionItem.querySelector(".accordion-body");
            const isActive = this.classList.contains("active");

            // Close all accordion items
            accordionHeaders.forEach((otherHeader) => {
                otherHeader.classList.remove("active");
                const otherBody = otherHeader.parentElement.querySelector(".accordion-body");
                otherBody.style.maxHeight = "0";
            });

            // If the clicked item wasn't active, open it
            if (!isActive) {
                this.classList.add("active");
                accordionBody.style.maxHeight = accordionBody.scrollHeight + "px";
            }
        });
    });
});