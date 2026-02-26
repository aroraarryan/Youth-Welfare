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

    // =========================================
    // GALLERY PAGE LOGIC
    // =========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        let currentItems = 8; // Number of items to show initially
        let currentFilter = 'all';

        function updateGalleryVisibility() {
            let visibleCount = 0;
            let hiddenCount = 0;

            galleryItems.forEach(item => {
                const matchesFilter = currentFilter === 'all' || item.classList.contains(currentFilter);

                if (matchesFilter) {
                    if (visibleCount < currentItems) {
                        item.style.display = 'block';
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                        hiddenCount++;
                    }
                } else {
                    item.style.display = 'none';
                }
            });

            // Show or hide Load More button based on pending items
            if (loadMoreBtn) {
                if (hiddenCount > 0) {
                    loadMoreBtn.style.display = 'inline-block';
                } else {
                    loadMoreBtn.style.display = 'none';
                }
            }

            // Show or hide Show Less button
            if (showLessBtn) {
                if (currentItems > 8) {
                    showLessBtn.style.display = 'inline-block';
                } else {
                    showLessBtn.style.display = 'none';
                }
            }
        }

        // Identify initial active filter if any
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        if (activeFilterBtn) {
            currentFilter = activeFilterBtn.getAttribute('data-filter') || 'all';
        }

        // Apply initial visibility
        updateGalleryVisibility();

        // Filtering
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                this.classList.add('active');

                currentFilter = this.getAttribute('data-filter');
                currentItems = 8; // Reset item count on filter change
                updateGalleryVisibility();
            });
        });

        // Load More functionality
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function () {
                currentItems += 6; // Load 6 more items at a time
                updateGalleryVisibility();
            });
        }

        // Show Less functionality
        if (showLessBtn) {
            showLessBtn.addEventListener('click', function () {
                currentItems = 8; // Reset to initial 8 items
                updateGalleryVisibility();

                const galleryGrid = document.querySelector('.gallery-filters');
                if (galleryGrid) {
                    galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }

        // Lightbox
        const lightbox = document.getElementById('lightboxModal');
        const lightboxImg = document.getElementById('lightboxImg');
        const captionText = document.getElementById('lightboxCaption');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        let currentImageIndex = 0;

        // Get array of visible items for navigation
        function getVisibleItems() {
            return Array.from(galleryItems).filter(item => item.style.display !== 'none');
        }

        // Open Lightbox
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', function () {
                const img = this.querySelector('img');
                const title = this.querySelector('.gallery-title').innerText;

                lightbox.classList.add('show');
                lightboxImg.src = img.src;
                captionText.innerText = title;

                // Find current index in visible items
                const visible = getVisibleItems();
                currentImageIndex = visible.indexOf(this);
            });
        });

        // Close Lightbox
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                lightbox.classList.remove('show');
            });
        }

        // Click outside to close
        window.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                lightbox.classList.remove('show');
            }
        });

        // Navigation
        function showImage(n) {
            const visible = getVisibleItems();
            if (visible.length === 0) return;

            if (n >= visible.length) currentImageIndex = 0;
            if (n < 0) currentImageIndex = visible.length - 1;

            const targetItem = visible[currentImageIndex];
            lightboxImg.src = targetItem.querySelector('img').src;
            captionText.innerText = targetItem.querySelector('.gallery-title').innerText;
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => showImage(currentImageIndex += 1));
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => showImage(currentImageIndex -= 1));
        }

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('show')) return;
            if (e.key === 'Escape') lightbox.classList.remove('show');
            if (e.key === 'ArrowRight') showImage(currentImageIndex += 1);
            if (e.key === 'ArrowLeft') showImage(currentImageIndex -= 1);
        });
    }
});

// =========================================
// LANGUAGE SWITCHING LOGIC
// =========================================
function setLanguage(lang) {
    if (!window.translations) {
        console.error("Translations not loaded");
        return;
    }

    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (window.translations[lang] && window.translations[lang][key]) {
            el.textContent = window.translations[lang][key];
        }
    });

    const inputs = document.querySelectorAll("[data-i18n-placeholder]");
    inputs.forEach(input => {
        const key = input.getAttribute("data-i18n-placeholder");
        if (window.translations[lang] && window.translations[lang][key]) {
            input.placeholder = window.translations[lang][key];
        }
    });

    // Update button text
    const langToggles = document.querySelectorAll('.lang-toggle');
    langToggles.forEach(toggle => {
        toggle.textContent = lang === 'en' ? 'हिन्दी' : 'EN';
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Save preference
    localStorage.setItem("preferredLanguage", lang);
}

document.addEventListener("DOMContentLoaded", function () {
    const langToggles = document.querySelectorAll('.lang-toggle');
    let currentLang = localStorage.getItem("preferredLanguage") || "en";

    // Initial set
    setTimeout(() => setLanguage(currentLang), 100);

    langToggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            currentLang = currentLang === "en" ? "hi" : "en";
            setLanguage(currentLang);
        });
    });
});