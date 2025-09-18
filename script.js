// Global variables for carousel
let currentSlideIndex = 0;
let slides;
let totalSlides;
let indicators;
let autoSlideInterval;

// Global function for carousel navigation (called by HTML buttons)
function changeSlide(direction) {
    if (!slides || slides.length === 0) return;
    
    // Remove active class from current slide
    slides[currentSlideIndex].classList.remove('active');
    if (indicators) {
        indicators[currentSlideIndex].classList.remove('active');
    }
    
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
    if (indicators) {
        indicators[currentSlideIndex].classList.add('active');
    }
}

// Function to go to specific slide
function goToSlide(slideIndex) {
    if (!slides || slides.length === 0) return;
    
    // Remove active class from current slide
    slides[currentSlideIndex].classList.remove('active');
    if (indicators) {
        indicators[currentSlideIndex].classList.remove('active');
    }
    
    // Set new slide index
    currentSlideIndex = slideIndex;
    
    // Add active class to new slide
    slides[currentSlideIndex].classList.add('active');
    if (indicators) {
        indicators[currentSlideIndex].classList.add('active');
    }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    // Initialize carousel variables
    slides = document.querySelectorAll('.carousel-slide');
    totalSlides = slides.length;
    indicators = document.querySelectorAll('.carousel-indicator');

    // Auto-rotate carousel every 5 seconds with pause on hover
    if (slides.length > 0) {
        const carouselContainer = document.querySelector('.carousel-container');
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(() => {
                changeSlide(1);
            }, 5000);
        }
        
        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }
        
        startAutoSlide();
        
        // Pause on hover
        carouselContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);
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

    // Toggle mobile menu
    const menuToggle = document.getElementById("menuToggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            document.querySelector(".nav-links").classList.toggle("active");
        });
    }

    // Advanced Search Toggle Functionality
    const schemeNameBtn = document.getElementById("schemeNameBtn");
    const advanceSearchBtn = document.getElementById("advanceSearchBtn");
    const advancedSearchRow = document.getElementById("advancedSearchRow");
    const normalSearchRow = document.getElementById("normalSearchRow");

    if (schemeNameBtn && advanceSearchBtn && advancedSearchRow && normalSearchRow) {
        function showAdvancedSearch() {
            // Hide normal search row
            normalSearchRow.style.opacity = "0";
            setTimeout(() => {
                normalSearchRow.style.display = "none";

                // Show advanced search row
                advancedSearchRow.style.display = "flex";
                setTimeout(() => {
                    advancedSearchRow.classList.add("show");
                }, 10);
            }, 150);

            // Update button states
            advanceSearchBtn.classList.add("active");
            schemeNameBtn.classList.remove("active");
        }

        function showSchemeNameSearch() {
            // Hide advanced search row
            advancedSearchRow.classList.remove("show");
            setTimeout(() => {
                advancedSearchRow.style.display = "none";

                // Show normal search row
                normalSearchRow.style.display = "flex";
                setTimeout(() => {
                    normalSearchRow.style.opacity = "1";
                }, 10);
            }, 150);

            // Update button states
            schemeNameBtn.classList.add("active");
            advanceSearchBtn.classList.remove("active");
        }

        // Event listeners
        advanceSearchBtn.addEventListener("click", showAdvancedSearch);
        schemeNameBtn.addEventListener("click", showSchemeNameSearch);

        // Set initial state (Scheme Name active by default)
        schemeNameBtn.classList.add("active");
        normalSearchRow.style.opacity = "1";
    }

    // Social Media Tabs Functionality
    const socialTabs = document.querySelectorAll('.tab-btn');
    const socialFeeds = document.querySelectorAll('.social-feed');
    
    if (socialTabs.length > 0 && socialFeeds.length > 0) {
        socialTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and feeds
                socialTabs.forEach(t => t.classList.remove('active'));
                socialFeeds.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding feed
                const targetTab = tab.getAttribute('data-tab');
                const targetFeed = document.getElementById(`${targetTab}-feed`);
                if (targetFeed) {
                    targetFeed.classList.add('active');
                    
                    // Restart animation for the newly active feed
                    const scrollingFeed = targetFeed.querySelector('.scrolling-feed');
                    if (scrollingFeed) {
                        scrollingFeed.style.animation = 'none';
                        setTimeout(() => {
                            scrollingFeed.style.animation = 'smoothScroll 20s linear infinite';
                        }, 10);
                    }
                }
            });
        });
        
        // Pause animation on hover for all feeds
        socialFeeds.forEach(feed => {
            const scrollingFeed = feed.querySelector('.scrolling-feed');
            if (scrollingFeed) {
                scrollingFeed.addEventListener('mouseenter', () => {
                    scrollingFeed.style.animationPlayState = 'paused';
                });
                
                scrollingFeed.addEventListener('mouseleave', () => {
                    scrollingFeed.style.animationPlayState = 'running';
                });
            }
        });
        
        // Clone posts for infinite scroll effect
        socialFeeds.forEach(feed => {
            const scrollingFeed = feed.querySelector('.scrolling-feed');
            if (scrollingFeed) {
                const posts = scrollingFeed.querySelectorAll('.social-post');
                posts.forEach(post => {
                    const clone = post.cloneNode(true);
                    scrollingFeed.appendChild(clone);
                });
            }
        });
    }
});