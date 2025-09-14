/**
 * Enhanced LG Branches Finder - Main JavaScript File
 * Features: Modern UI, Enhanced Colors, Improved Cards, Better Alignment
 */

// Global variables
let userLocation = null;
let branchesData = [];
let filteredBranches = [];
let isLocationPermissionGranted = false;
let branchesCache = null;
let cacheExpiry = null;

// Cache settings (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// DOM elements
const elements = {
    locationStatus: document.getElementById('locationStatus'),
    statusMessage: document.getElementById('statusMessage'),
    statusIcon: document.getElementById('statusIcon'),
    locationDetails: document.getElementById('locationDetails'),
    refreshLocationBtn: document.getElementById('refreshLocationBtn'),
    loadingSkeletonSection: document.getElementById('loadingSkeletonSection'),
    allBranchesSection: document.getElementById('allBranchesSection'),
    branchesGrid: document.getElementById('branchesGrid'),
    errorSection: document.getElementById('errorSection'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    searchInput: document.getElementById('searchInput'),
    pageTitle: document.getElementById('page-title')
};

// Messages in Arabic only
const messages = {
    locating: 'جاري تحديد موقعك...',
    locationSuccess: 'تم تحديد موقعك بنجاح',
    locationDenied: 'من فضلك اسمح بمشاركة الموقع ليتم عرض أقرب فرع',
    locationError: 'حدث خطأ في تحديد الموقع',
    locationUnavailable: 'خدمة تحديد الموقع غير متاحة',
    dataError: 'خطأ في تحميل بيانات الفروع',
    noCoordinates: 'نعتذر، لا توجد إحداثيات لبعض الفروع',
    networkError: 'خطأ في الاتصال بالشبكة',
    nearestBranch: 'أقرب فرع إليك',
    allBranches: 'جميع الفروع مرتبة حسب المسافة',
    allBranchesNoDistance: 'جميع الفروع',
    searchPlaceholder: 'ابحث عن فرع بالاسم أو المنطقة...',
    loadingBranches: 'جاري تحميل الفروع...',
    viewOnMap: 'عرض في الخرائط',
    retry: 'إعادة المحاولة',
    updateLocation: 'تحديث الموقع',
    youAreAt: 'أنت الآن في:',
    nearestIs: 'أقرب فرع لك هو:'
};

// Create SVG icons with enhanced styling
const createIcon = (type) => {
    const icons = {
        phone: '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
        location: '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
        navigation: '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        distance: '<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M13 1L22 8v2h-2v4.17L22 16v2l-9-7-9 7v-2l2-1.83V10H4V8l9-7z"/></svg>'
    };
    return icons[type] || '';
};

/**
 * Update location status in UI with enhanced styling
 */
const updateLocationStatus = (message, status = 'loading') => {
    elements.statusMessage.textContent = message;
    
    // Update icon class with enhanced styling
    elements.statusIcon.className = `status-icon ${status}`;
    
    // Update button classes based on status
    if (status === 'success' || status === 'error') {
        elements.refreshLocationBtn.style.display = 'flex';
        elements.refreshLocationBtn.className = status === 'success' ? 'btn btn-success' : 'btn btn-primary';
    } else {
        elements.refreshLocationBtn.style.display = 'none';
    }
    
    // Update page title dynamically
    if (status === 'success') {
        document.title = 'تم العثور على موقعك - أقرب فرع LG';
    }
};

/**
 * Get user's location with improved error handling
 */
const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error(messages.locationUnavailable));
            return;
        }

        updateLocationStatus(messages.locating);

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                console.log('User location obtained:', location);
                isLocationPermissionGranted = true;
                updateLocationStatus(messages.locationSuccess, 'success');
                
                resolve(location);
            },
            (error) => {
                console.error('Location error:', error);
                
                let errorMessage = messages.locationError;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = messages.locationDenied;
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = messages.locationUnavailable;
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'انتهت مهلة تحديد الموقع';
                        break;
                }
                
                updateLocationStatus(errorMessage, 'error');
                reject(new Error(errorMessage));
            },
            options
        );
    });
};

/**
 * Load branches data from JSON file with enhanced caching
 */
const loadBranchesData = async () => {
    try {
        console.log('Loading branches data...');
        
        // Check cache first
        const cachedData = cacheManager.get();
        if (cachedData) {
            console.log(`Loaded ${cachedData.length} branches from cache`);
            return cachedData;
        }
        
        // Fetch data from the JSON file
        const response = await fetch('lg_branches_with_coords.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`Loaded ${data.length} branches from server`);
        
        const validBranches = data.filter(branch => 
            branch.lat && branch.lng && 
            !isNaN(parseFloat(branch.lat)) && 
            !isNaN(parseFloat(branch.lng))
        );
        
        console.log(`Valid branches: ${validBranches.length}`);
        
        if (validBranches.length === 0) {
            throw new Error(messages.noCoordinates);
        }
        
        // Cache the data
        cacheManager.set(validBranches);
        
        return validBranches;
    } catch (error) {
        console.error('Data loading error:', error);
        throw new Error(messages.dataError);
    }
};

/**
 * Calculate distance between two geographic points using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100;
};

const toRadians = (degrees) => degrees * (Math.PI / 180);

/**
 * Format distance for display with enhanced styling
 */
const formatDistance = (distance) => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} متر`;
    }
    return `${distance} كم`;
};

/**
 * Calculate distances and sort branches
 */
const calculateAndSortBranches = (branches, userLoc) => {
    const branchesWithDistance = branches.map(branch => {
        const distance = calculateDistance(
            userLoc.lat, 
            userLoc.lng,
            parseFloat(branch.lat),
            parseFloat(branch.lng)
        );
        
        return {
            ...branch,
            distance: distance
        };
    });
    
    return branchesWithDistance.sort((a, b) => a.distance - b.distance);
};

/**
 * Get place name from coordinates using Nominatim (OpenStreetMap)
 */
const getPlaceName = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`
        );
        if (!response.ok) throw new Error("Error connecting to geocoding service");

        const data = await response.json();
        return data.display_name || "موقع غير معروف";
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return "موقعك الحالي";
    }
};

/**
 * Create enhanced nearest branch card with modern design
 */
const createNearestBranchCard = (branch) => {
    return `
        <div class="branch-name">${branch.name}</div>
        <div class="branch-distance">
            ${createIcon('distance')}
            ${formatDistance(branch.distance)}
        </div>
        <div class="branch-info">
            <div class="branch-address">
                ${createIcon('location')}
                ${branch.address}
            </div>
            <div class="contact-item">
                ${createIcon('phone')}
                ${branch.phone}
            </div>
            ${branch.maps_url ? `
                <a href="${branch.maps_url}" target="_blank" rel="noopener noreferrer" class="maps-link" aria-label="${messages.viewOnMap} ${branch.name}">
                    ${createIcon('navigation')}
                    ${messages.viewOnMap}
                </a>
            ` : ''}
        </div>
    `;
};

/**
 * Update nearest branch card with enhanced styling
 */
const updateNearestBranch = (branch) => {
    const nearestCard = document.querySelector('.nearest-card');
    if (nearestCard) {
        nearestCard.innerHTML = createNearestBranchCard(branch);
    }
};

/**
 * Create enhanced branch card with modern design
 */
const createBranchCard = (branch, index) => {
    return `
        <div class="branch-card card fade-in" role="listitem" aria-labelledby="branch-${index}" style="animation-delay: ${index * 0.1}s">
            <div class="branch-name" id="branch-${index}">${branch.name}</div>
            ${branch.distance ? `
                <div class="branch-distance">
                    ${createIcon('distance')}
                    ${formatDistance(branch.distance)}
                </div>
            ` : ''}
            <div class="branch-address">
                ${createIcon('location')}
                ${branch.address}
            </div>
            <div class="branch-contact">
                <div class="contact-item">
                    <span class="contact-icon">${createIcon('phone')}</span>
                    <span>${branch.phone}</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">${createIcon('location')}</span>
                    <span>${branch.district} - ${branch.governorate}</span>
                </div>
            </div>
            ${branch.maps_url ? `
                <a href="${branch.maps_url}" target="_blank" rel="noopener noreferrer" class="maps-link" aria-label="${messages.viewOnMap} ${branch.name}">
                    ${createIcon('navigation')}
                    ${messages.viewOnMap}
                </a>
            ` : ''}
        </div>
    `;
};

/**
 * Display results with enhanced animations and styling
 */
const displayResults = async (sortedBranches) => {
    try {
        filteredBranches = sortedBranches;
        
        // Hide skeleton loading with smooth transition
        elements.loadingSkeletonSection.style.display = 'none';
        
        // Show nearest branch with enhanced styling
        if (sortedBranches.length > 0 && sortedBranches[0].distance) {
            const nearest = sortedBranches[0];

            // Update status message with user location + nearest branch
            if (userLocation) {
                const placeName = await getPlaceName(userLocation.lat, userLocation.lng);
                elements.statusMessage.textContent = `${messages.youAreAt} ${placeName}`;
                
                elements.locationDetails.innerHTML = `
                    <strong>${messages.nearestIs}</strong><br>
                    ${nearest.name} (${formatDistance(nearest.distance)})
                `;
                elements.locationDetails.style.display = 'block';
            }
        }
        
        // Show all branches with enhanced grid
        renderBranches(sortedBranches);
        elements.allBranchesSection.style.display = 'block';
        
        // Update section title
        const allBranchesTitle = document.getElementById('all-branches-title');
        if (allBranchesTitle) {
            allBranchesTitle.textContent = userLocation ? messages.allBranches : messages.allBranchesNoDistance;
        }
        
        console.log(`Displayed ${sortedBranches.length} branches`);
        
    } catch (error) {
        console.error('Display error:', error);
        showError('خطأ في عرض البيانات');
    }
};

/**
 * Render branches grid with enhanced styling
 */
const renderBranches = (branches) => {
    const branchesHTML = branches
        .map((branch, index) => createBranchCard(branch, index))
        .join('');
    
    elements.branchesGrid.innerHTML = branchesHTML;
};

/**
 * Filter branches based on search with enhanced performance
 */
const filterBranches = (searchTerm) => {
    if (!searchTerm.trim()) {
        renderBranches(filteredBranches);
        return;
    }

    const filtered = filteredBranches.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.governorate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    renderBranches(filtered);
    
    // Update results count for screen readers
    const resultsCount = filtered.length;
    elements.searchInput.setAttribute('aria-describedby', 'search-results');
    
    // Create or update results announcement
    let resultsAnnouncement = document.getElementById('search-results');
    if (!resultsAnnouncement) {
        resultsAnnouncement = document.createElement('div');
        resultsAnnouncement.id = 'search-results';
        resultsAnnouncement.className = 'sr-only';
        resultsAnnouncement.setAttribute('aria-live', 'polite');
        elements.searchInput.parentNode.appendChild(resultsAnnouncement);
    }
    
    resultsAnnouncement.textContent = `تم العثور على ${resultsCount} نتيجة`;
};

/**
 * Show/hide skeleton loading with smooth transitions
 */
const showSkeletonLoading = () => {
    elements.loadingSkeletonSection.style.display = 'block';
    elements.allBranchesSection.style.display = 'none';
};

const hideSkeletonLoading = () => {
    elements.loadingSkeletonSection.style.display = 'none';
};

/**
 * Show error with enhanced styling
 */
const showError = (message) => {
    elements.errorMessage.textContent = message;
    elements.errorSection.style.display = 'block';
    elements.allBranchesSection.style.display = 'none';
    hideSkeletonLoading();
};

/**
 * Hide error with smooth transitions
 */
const hideError = () => {
    elements.errorSection.style.display = 'none';
};

/**
 * Cache management
 */
const cacheManager = {
    set(data) {
        branchesCache = data;
        cacheExpiry = Date.now() + CACHE_DURATION;
        try {
            localStorage.setItem('lg-finder-cache', JSON.stringify({
                data: data,
                expiry: cacheExpiry
            }));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },
    
    get() {
        // Check memory cache first
        if (branchesCache && cacheExpiry && Date.now() < cacheExpiry) {
            return branchesCache;
        }
        
        // Check localStorage cache
        try {
            const cached = localStorage.getItem('lg-finder-cache');
            if (cached) {
                const { data, expiry } = JSON.parse(cached);
                if (Date.now() < expiry) {
                    branchesCache = data;
                    cacheExpiry = expiry;
                    return data;
                }
            }
        } catch (e) {
            console.warn('Could not read from localStorage:', e);
        }
        
        return null;
    },
    
    clear() {
        branchesCache = null;
        cacheExpiry = null;
        try {
            localStorage.removeItem('lg-finder-cache');
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
        }
    }
};

/**
 * Initialize the application with enhanced error handling
 */
const initializeApp = async () => {
    try {
        showSkeletonLoading();
        hideError();
        
        console.log('Initializing app...');
        
        // Load branches data first
        branchesData = await loadBranchesData();
        
        try {
            // Try to get user location
            userLocation = await getUserLocation();
            
            // Calculate distances and sort branches
            const sortedBranches = calculateAndSortBranches(branchesData, userLocation);
            
            // Display results
            displayResults(sortedBranches);
            
        } catch (locationError) {
            console.warn('Location not available:', locationError.message);
            
            // Show all branches without distance sorting
            filteredBranches = branchesData;
            renderBranches(branchesData);
            elements.allBranchesSection.style.display = 'block';
            hideSkeletonLoading();
            
            // Update section title
            const allBranchesTitle = document.getElementById('all-branches-title');
            if (allBranchesTitle) {
                allBranchesTitle.textContent = messages.allBranchesNoDistance;
            }
        }
        
    } catch (error) {
        console.error('App initialization error:', error);
        showError(error.message);
    }
};

/**
 * Retry location with enhanced feedback
 */
const retryLocation = async () => {
    try {
        showSkeletonLoading();
        
        userLocation = await getUserLocation();
        
        const sortedBranches = calculateAndSortBranches(branchesData, userLocation);
        displayResults(sortedBranches);
        
        hideError();
        
    } catch (error) {
        console.error('Location retry failed:', error);
        updateLocationStatus(error.message, 'error');
        hideSkeletonLoading();
    }
};

/**
 * Enhanced event listeners setup
 */
const setupEventListeners = () => {
    // Retry button
    elements.retryBtn.addEventListener('click', initializeApp);
    
    // Refresh location button
    elements.refreshLocationBtn.addEventListener('click', retryLocation);
    
    // Enhanced search functionality with debouncing
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterBranches(e.target.value);
        }, 300);
    });
    
    // Clear search on ESC key
    elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.target.value = '';
            filterBranches('');
        }
    });

    // Enhanced keyboard navigation
    elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            const firstCard = elements.branchesGrid.querySelector('.branch-card');
            if (firstCard) {
                const focusable = firstCard.querySelector('a, button');
                if (focusable) {
                    focusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
};

/**
 * Performance optimization - Enhanced Intersection Observer
 */
const setupIntersectionObserver = () => {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Enhanced observation for branch cards
        const observeBranchCards = () => {
            const branchCards = document.querySelectorAll('.branch-card:not(.observed)');
            branchCards.forEach(card => {
                card.classList.add('observed');
                observer.observe(card);
            });
        };

        // Set up mutation observer to watch for new cards
        const mutationObserver = new MutationObserver(() => {
            observeBranchCards();
        });

        mutationObserver.observe(elements.branchesGrid, {
            childList: true
        });
    }
};

/**
 * Enhanced accessibility features
 */
const setupAccessibilityFeatures = () => {
    // Announce page changes to screen readers
    const announcePageChange = (message) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    };

    // Enhanced focus management
    document.addEventListener('focusin', (e) => {
        if (e.target.classList.contains('.branch-card') || 
            e.target.closest('.branch-card')) {
            e.target.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + S to focus search
        if (e.altKey && e.key === 's') {
            elements.searchInput.focus();
            e.preventDefault();
        }
        
        // Alt + R to refresh location
        if (e.altKey && e.key === 'r' && elements.refreshLocationBtn.style.display !== 'none') {
            elements.refreshLocationBtn.click();
            e.preventDefault();
        }
    });
};

/**
 * Enhanced error handling and user feedback
 */
const handleNetworkError = (error) => {
    console.error('Network error:', error);
    
    if (!navigator.onLine) {
        showError('لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
    } else {
        showError(messages.networkError);
    }
};

/**
 * Enhanced user engagement tracking (privacy-friendly)
 */
const trackUserEngagement = () => {
    // Track location permission status (no personal data)
    if (isLocationPermissionGranted) {
        console.log('Location permission granted - enhanced experience enabled');
    }
    
    // Track search usage (no search terms stored)
    let searchCount = 0;
    elements.searchInput.addEventListener('input', () => {
        searchCount++;
        if (searchCount === 1) {
            console.log('User engaged with search feature');
        }
    });
};

/**
 * Initialize everything when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Enhanced LG Branch Finder initialized');
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up accessibility and performance features
    setupIntersectionObserver();
    setupAccessibilityFeatures();
    
    // Track user engagement (privacy-friendly)
    trackUserEngagement();
    
    // Initialize the main application
    initializeApp().catch(error => {
        console.error('App initialization failed:', error);
        handleNetworkError(error);
    });
});

/**
 * Enhanced online/offline event handling
 */
window.addEventListener('online', () => {
    console.log('Connection restored');
    hideError();
    if (branchesData.length === 0) {
        initializeApp();
    }
    
    // Update UI to reflect online status
    updateLocationStatus('تم استعادة الاتصال', 'success');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    updateLocationStatus('فقد الاتصال بالإنترنت. بعض الميزات قد لا تعمل.', 'error');
});

/**
 * Enhanced page visibility handling
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing operations');
    } else {
        console.log('Page visible - resuming operations');
        
        // Check if data is stale and refresh if needed
        if (cacheExpiry && Date.now() > cacheExpiry) {
            console.log('Cache expired, refreshing data');
            cacheManager.clear();
            if (navigator.onLine) {
                initializeApp();
            }
        }
    }
});

/**
 * Enhanced global error handling
 */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    if (e.error && e.error.message && 
        !e.error.message.includes('Network') && 
        !e.error.message.includes('fetch')) {
        return;
    }
    
    showError(messages.dataError);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
    
    if (e.reason && e.reason.message) {
        if (e.reason.message.includes('Location')) {
            return;
        }
        showError(messages.dataError);
    }
});

/**
 * Export functions for testing (development only)
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.lgBranchFinder = {
        calculateDistance,
        formatDistance,
        getUserLocation,
        loadBranchesData,
        cacheManager
    };
}