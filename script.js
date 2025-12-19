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
let currentLang = 'ar'; // Default language

// Cache settings (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Translations
const translations = {
    ar: {
        pageTitle: 'العثور على أقرب فرع LG',
        subtitle: 'ابحث عن أقرب فرع LG إليك في مصر',
        locating: 'جاري تحديد موقعك...',
        locationSuccess: 'تم تحديد موقعك بنجاح',
        locationDenied: 'من فضلك اسمح بمشاركة الموقع ليتم عرض أقرب فرع',
        locationError: 'حدث خطأ في تحديد الموقع',
        locationUnavailable: 'خدمة تحديد الموقع غير متاحة',
        locationTimeout: 'انتهت مهلة تحديد الموقع',
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
        nearestIs: 'أقرب فرع لك هو:',
        allowLocation: 'السماح بتحديد الموقع',
        locationHint: 'سيتم استخدام موقعك فقط لحساب المسافة ولن يتم تخزينه',
        locationPrompt: 'نحتاج إذنك لتحديد موقعك حتى نتمكن من عرض أقرب فرع LG إليك',
        clickToLocate: 'اضغط على الزر لتحديد موقعك وترتيب الفروع حسب المسافة',
        share: 'مشاركة',
        copied: 'تم نسخ بيانات الفرع',
        shareError: 'حدث خطأ أثناء المشاركة',
        foundBranches: 'تم العثور على {count} فرع',
        darkModeOn: 'تم تفعيل الوضع الليلي',
        darkModeOff: 'تم تفعيل الوضع النهاري',
        noInternet: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.',
        connectionRestored: 'تم استعادة الاتصال',
        connectionLost: 'فقد الاتصال بالإنترنت. بعض الميزات قد لا تعمل.',
        newUpdate: 'تحديث جديد متاح! أعد تحميل الصفحة.',
        displayError: 'خطأ في عرض البيانات',
        allGovernorates: 'كل المحافظات',
        filterByGovernorate: 'فلترة حسب المحافظة',
        poweredBy: 'تم التطوير بواسطة',
        meter: 'متر',
        km: 'كم',
        skipToContent: 'الانتقال إلى المحتوى الرئيسي',
        darkModeToggle: 'تبديل الوضع الليلي',
        languageToggle: 'English',
        searchBranches: 'البحث في الفروع',
        sorry: 'عذراً، حدث خطأ',
        cannotLoad: 'لا يمكن تحميل بيانات الفروع'
    },
    en: {
        pageTitle: 'Find Nearest LG Branch',
        subtitle: 'Find the nearest LG branch to you in Egypt',
        locating: 'Locating you...',
        locationSuccess: 'Location found successfully',
        locationDenied: 'Please allow location access to show the nearest branch',
        locationError: 'Error getting location',
        locationUnavailable: 'Location service unavailable',
        locationTimeout: 'Location request timed out',
        dataError: 'Error loading branch data',
        noCoordinates: 'Sorry, coordinates not available for some branches',
        networkError: 'Network connection error',
        nearestBranch: 'Nearest Branch',
        allBranches: 'All Branches Sorted by Distance',
        allBranchesNoDistance: 'All Branches',
        searchPlaceholder: 'Search by name or area...',
        loadingBranches: 'Loading branches...',
        viewOnMap: 'View on Maps',
        retry: 'Retry',
        updateLocation: 'Update Location',
        youAreAt: 'You are at:',
        nearestIs: 'Nearest branch:',
        allowLocation: 'Allow Location Access',
        locationHint: 'Your location is only used to calculate distance and is not stored',
        locationPrompt: 'We need your location to show the nearest LG branch',
        clickToLocate: 'Click the button to locate yourself and sort branches by distance',
        share: 'Share',
        copied: 'Branch info copied',
        shareError: 'Error sharing',
        foundBranches: 'Found {count} branches',
        darkModeOn: 'Dark mode enabled',
        darkModeOff: 'Light mode enabled',
        noInternet: 'No internet connection. Please check and try again.',
        connectionRestored: 'Connection restored',
        connectionLost: 'Connection lost. Some features may not work.',
        newUpdate: 'New update available! Reload the page.',
        displayError: 'Error displaying data',
        allGovernorates: 'All Governorates',
        filterByGovernorate: 'Filter by Governorate',
        poweredBy: 'Developed by',
        meter: 'm',
        km: 'km',
        skipToContent: 'Skip to main content',
        darkModeToggle: 'Toggle dark mode',
        languageToggle: 'العربية',
        searchBranches: 'Search branches',
        sorry: 'Sorry, an error occurred',
        cannotLoad: 'Cannot load branch data'
    }
};

// Get translation
const t = (key) => translations[currentLang][key] || translations['ar'][key] || key;

// DOM elements
const elements = {
    locationStatus: document.getElementById('locationStatus'),
    statusMessage: document.getElementById('statusMessage'),
    statusIcon: document.getElementById('statusIcon'),
    locationDetails: document.getElementById('locationDetails'),
    getLocationBtn: document.getElementById('getLocationBtn'),
    refreshLocationBtn: document.getElementById('refreshLocationBtn'),
    loadingSkeletonSection: document.getElementById('loadingSkeletonSection'),
    allBranchesSection: document.getElementById('allBranchesSection'),
    branchesGrid: document.getElementById('branchesGrid'),
    errorSection: document.getElementById('errorSection'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    searchInput: document.getElementById('searchInput'),
    governorateFilter: document.getElementById('governorateFilter'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    pageTitle: document.getElementById('page-title')
};

// Current filter state
let currentGovernorate = '';

/**
 * Language toggle function
 */
const toggleLanguage = async () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lg-finder-lang', currentLang);
    applyLanguage();

    // Reload branch data for the new language
    try {
        showSkeletonLoading();
        branchesData = await loadBranchesData(true);

        // If user has location, recalculate distances
        if (userLocation) {
            const sortedBranches = calculateAndSortBranches(branchesData, userLocation);
            await displayResults(sortedBranches);
        } else {
            filteredBranches = branchesData;
            renderBranches(branchesData);
            elements.allBranchesSection.style.display = 'block';
            hideSkeletonLoading();
        }

        // Repopulate governorate filter
        elements.governorateFilter.innerHTML = `<option value="">${t('allGovernorates')}</option>`;
        populateGovernorateFilter();
    } catch (error) {
        console.error('Error loading branch data for new language:', error);
        showError(t('dataError'));
    }
};

/**
 * Apply language to the page
 */
const applyLanguage = () => {
    const html = document.documentElement;
    const isRTL = currentLang === 'ar';

    // Update HTML attributes
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.body.style.direction = isRTL ? 'rtl' : 'ltr';
    document.body.style.textAlign = isRTL ? 'right' : 'left';

    // Update page title
    document.title = t('pageTitle') + ' - LG Egypt';

    // Update main title
    const mainTitle = document.querySelector('.main-title');
    if (mainTitle) mainTitle.textContent = t('pageTitle');

    // Update subtitle
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = t('subtitle');

    // Update search placeholder
    if (elements.searchInput) {
        elements.searchInput.placeholder = t('searchPlaceholder');
        elements.searchInput.setAttribute('aria-label', t('searchBranches'));
    }

    // Update governorate filter
    if (elements.governorateFilter) {
        const firstOption = elements.governorateFilter.querySelector('option[value=""]');
        if (firstOption) firstOption.textContent = t('allGovernorates');
        elements.governorateFilter.setAttribute('aria-label', t('filterByGovernorate'));
    }

    // Update location buttons
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
        getLocationBtn.innerHTML = `
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            ${t('allowLocation')}
        `;
    }

    const refreshLocationBtn = document.getElementById('refreshLocationBtn');
    if (refreshLocationBtn) {
        refreshLocationBtn.innerHTML = `
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            ${t('updateLocation')}
        `;
    }

    // Update status hint
    const statusHint = document.querySelector('.status-hint');
    if (statusHint) statusHint.textContent = t('locationHint');

    // Update section titles
    const allBranchesTitle = document.getElementById('all-branches-title');
    if (allBranchesTitle) {
        allBranchesTitle.textContent = userLocation ? t('allBranches') : t('allBranchesNoDistance');
    }

    // Update loading section
    const loadingTitle = document.querySelector('#loadingSkeletonSection .section-title');
    if (loadingTitle) loadingTitle.textContent = t('loadingBranches');

    // Update error section
    const errorTitle = document.querySelector('#errorSection h3');
    if (errorTitle) errorTitle.textContent = t('sorry');

    // Update retry button
    if (elements.retryBtn) elements.retryBtn.textContent = t('retry');

    // Update language toggle button
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = t('languageToggle');
        langToggle.setAttribute('aria-label', currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    }

    // Update dark mode toggle
    if (elements.darkModeToggle) {
        elements.darkModeToggle.setAttribute('aria-label', t('darkModeToggle'));
        elements.darkModeToggle.setAttribute('title', t('darkModeToggle'));
    }

    // Update skip link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = t('skipToContent');

    // Update powered by text
    const poweredBy = document.querySelector('.powered-by');
    if (poweredBy) {
        poweredBy.innerHTML = `
            ${t('poweredBy')}
            <a href="https://smartstand-eg.com/" target="_blank" rel="noopener noreferrer" class="powered-link">
                Smart Stand Egypt
            </a>
        `;
    }

    // Announce change
    announceToScreenReader(currentLang === 'ar' ? 'تم التغيير إلى العربية' : 'Switched to English');
};

/**
 * Initialize language
 */
const initLanguage = () => {
    const savedLang = localStorage.getItem('lg-finder-lang');
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
        currentLang = savedLang;
    }
    applyLanguage();
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
            reject(new Error(t('locationUnavailable')));
            return;
        }

        updateLocationStatus(t('locating'));

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
                updateLocationStatus(t('locationSuccess'), 'success');
                
                resolve(location);
            },
            (error) => {
                console.error('Location error:', error);
                
                let errorMessage = t('locationError');
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = t('locationDenied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = t('locationUnavailable');
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
const loadBranchesData = async (forceRefresh = false) => {
    try {
        console.log('Loading branches data...');

        // Check cache first (but respect language and forceRefresh)
        const cacheKey = `lg-finder-cache-${currentLang}`;
        const cachedData = !forceRefresh ? cacheManager.get(cacheKey) : null;
        if (cachedData) {
            console.log(`Loaded ${cachedData.length} branches from cache (${currentLang})`);
            return cachedData;
        }

        // Fetch data from the appropriate JSON file based on language
        const dataFile = currentLang === 'en' ? 'lg_branches_en.json' : 'lg_branches_with_coords.json';
        const response = await fetch(dataFile);
        
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
            throw new Error(t('noCoordinates'));
        }

        // Cache the data with language-specific key
        cacheManager.set(validBranches, cacheKey);

        return validBranches;
    } catch (error) {
        console.error('Data loading error:', error);
        throw new Error(t('dataError'));
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
        return `${Math.round(distance * 1000)} ${t('meter')}`;
    }
    return `${distance} ${t('km')}`;
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
                <a href="${branch.maps_url}" target="_blank" rel="noopener noreferrer" class="maps-link" aria-label="${t('viewOnMap')} ${branch.name}">
                    ${createIcon('navigation')}
                    ${t('viewOnMap')}
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
    const branchData = encodeURIComponent(JSON.stringify({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        maps_url: branch.maps_url
    }));

    return `
        <div class="branch-card card fade-in" role="listitem" aria-labelledby="branch-${index}" style="animation-delay: ${index * 0.1}s">
            <div class="branch-card-header">
                <div class="branch-name" id="branch-${index}">${branch.name}</div>
                <button class="share-btn" onclick="shareBranch('${branchData}')" aria-label="${t('share')} ${branch.name}" title="${t('share')}">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                    </svg>
                </button>
            </div>
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
            <div class="branch-actions">
                ${branch.maps_url ? `
                    <a href="${branch.maps_url}" target="_blank" rel="noopener noreferrer" class="maps-link" aria-label="${t('viewOnMap')} ${branch.name}">
                        ${createIcon('navigation')}
                        ${t('viewOnMap')}
                    </a>
                ` : ''}
            </div>
        </div>
    `;
};

/**
 * Share branch functionality
 */
const shareBranch = async (encodedData) => {
    try {
        const branch = JSON.parse(decodeURIComponent(encodedData));
        const branchLabel = currentLang === 'ar' ? 'فرع LG' : 'LG Branch';
        const shareText = `${branchLabel} - ${branch.name}\n📍 ${branch.address}\n📞 ${branch.phone}`;

        if (navigator.share) {
            await navigator.share({
                title: `${branchLabel} - ${branch.name}`,
                text: shareText,
                url: branch.maps_url || window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(`${shareText}\n🗺️ ${branch.maps_url || window.location.href}`);
            showToast(t('copied'));
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share error:', error);
            showToast(t('shareError'));
        }
    }
};

/**
 * Show toast notification
 */
const showToast = (message) => {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
                elements.statusMessage.textContent = `${t('youAreAt')} ${placeName}`;
                
                elements.locationDetails.innerHTML = `
                    <strong>${t('nearestIs')}</strong><br>
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
            allBranchesTitle.textContent = userLocation ? t('allBranches') : t('allBranchesNoDistance');
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
 * Populate governorate filter dropdown
 */
const populateGovernorateFilter = () => {
    const governorates = [...new Set(branchesData.map(b => b.governorate))].sort();

    governorates.forEach(gov => {
        const option = document.createElement('option');
        option.value = gov;
        option.textContent = gov;
        elements.governorateFilter.appendChild(option);
    });
};

/**
 * Apply all filters (search + governorate)
 */
const applyFilters = () => {
    const searchTerm = elements.searchInput.value.trim().toLowerCase();

    let filtered = filteredBranches;

    // Apply governorate filter
    if (currentGovernorate) {
        filtered = filtered.filter(branch => branch.governorate === currentGovernorate);
    }

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(branch =>
            branch.name.toLowerCase().includes(searchTerm) ||
            branch.district.toLowerCase().includes(searchTerm) ||
            branch.governorate.toLowerCase().includes(searchTerm) ||
            branch.address.toLowerCase().includes(searchTerm)
        );
    }

    renderBranches(filtered);

    // Update results count for screen readers
    announceResults(filtered.length);
};

/**
 * Announce results count for screen readers
 */
const announceResults = (count) => {
    let resultsAnnouncement = document.getElementById('search-results');
    if (!resultsAnnouncement) {
        resultsAnnouncement = document.createElement('div');
        resultsAnnouncement.id = 'search-results';
        resultsAnnouncement.className = 'sr-only';
        resultsAnnouncement.setAttribute('aria-live', 'polite');
        document.body.appendChild(resultsAnnouncement);
    }

    resultsAnnouncement.textContent = `تم العثور على ${count} فرع`;
};

/**
 * Filter branches based on search with enhanced performance
 */
const filterBranches = (searchTerm) => {
    applyFilters();
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
 * Cache management with language-specific keys
 */
const cacheManager = {
    memoryCache: {},

    set(data, cacheKey = 'lg-finder-cache') {
        this.memoryCache[cacheKey] = {
            data: data,
            expiry: Date.now() + CACHE_DURATION
        };
        try {
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                expiry: Date.now() + CACHE_DURATION
            }));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },

    get(cacheKey = 'lg-finder-cache') {
        // Check memory cache first
        if (this.memoryCache[cacheKey] && Date.now() < this.memoryCache[cacheKey].expiry) {
            return this.memoryCache[cacheKey].data;
        }

        // Check localStorage cache
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { data, expiry } = JSON.parse(cached);
                if (Date.now() < expiry) {
                    this.memoryCache[cacheKey] = { data, expiry };
                    return data;
                }
            }
        } catch (e) {
            console.warn('Could not read from localStorage:', e);
        }

        return null;
    },

    clear(cacheKey = null) {
        if (cacheKey) {
            delete this.memoryCache[cacheKey];
            try {
                localStorage.removeItem(cacheKey);
            } catch (e) {
                console.warn('Could not clear localStorage:', e);
            }
        } else {
            // Clear all caches
            this.memoryCache = {};
            try {
                localStorage.removeItem('lg-finder-cache-ar');
                localStorage.removeItem('lg-finder-cache-en');
            } catch (e) {
                console.warn('Could not clear localStorage:', e);
            }
        }
    }
};

/**
 * Initialize the application with enhanced error handling
 * Shows branches first without requesting location permission
 */
const initializeApp = async () => {
    try {
        showSkeletonLoading();
        hideError();

        console.log('Initializing app...');

        // Load branches data first
        branchesData = await loadBranchesData();

        // Populate governorate filter
        populateGovernorateFilter();

        // Show all branches without distance sorting (don't request location yet)
        filteredBranches = branchesData;
        renderBranches(branchesData);
        elements.allBranchesSection.style.display = 'block';
        hideSkeletonLoading();

        // Update section title
        const allBranchesTitle = document.getElementById('all-branches-title');
        if (allBranchesTitle) {
            allBranchesTitle.textContent = t('allBranchesNoDistance');
        }

        // Update status message to prompt user
        elements.statusMessage.textContent = t('clickToLocate');
        elements.statusIcon.className = 'status-icon';

    } catch (error) {
        console.error('App initialization error:', error);
        showError(error.message);
    }
};

/**
 * Request location and sort branches - called when user clicks the button
 */
const requestLocationAndSort = async () => {
    try {
        // Hide get location button, show loading state
        elements.getLocationBtn.style.display = 'none';
        elements.statusMessage.textContent = t('locating');
        elements.statusIcon.className = 'status-icon loading';

        // Request user location
        userLocation = await getUserLocation();

        // Calculate distances and sort branches
        const sortedBranches = calculateAndSortBranches(branchesData, userLocation);

        // Display results
        await displayResults(sortedBranches);

        // Show refresh button instead of get location button
        elements.refreshLocationBtn.style.display = 'flex';

    } catch (locationError) {
        console.warn('Location not available:', locationError.message);

        // Show get location button again
        elements.getLocationBtn.style.display = 'flex';
        elements.statusMessage.textContent = locationError.message;
        elements.statusIcon.className = 'status-icon error';
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
 * Dark Mode functionality
 */
const initDarkMode = () => {
    const savedTheme = localStorage.getItem('lg-finder-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
};

const toggleDarkMode = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lg-finder-theme', newTheme);

    // Announce change to screen readers
    const announcement = newTheme === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري';
    announceToScreenReader(announcement);
};

const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
};

/**
 * Enhanced event listeners setup
 */
const setupEventListeners = () => {
    // Retry button
    elements.retryBtn.addEventListener('click', initializeApp);

    // Get location button - requests permission only when clicked
    elements.getLocationBtn.addEventListener('click', requestLocationAndSort);

    // Refresh location button
    elements.refreshLocationBtn.addEventListener('click', retryLocation);

    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // Language toggle
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }

    // Governorate filter
    elements.governorateFilter.addEventListener('change', (e) => {
        currentGovernorate = e.target.value;
        applyFilters();
    });

    // Enhanced search functionality with debouncing
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
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
        showError(t('networkError'));
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
 * Register Service Worker for PWA
 */
const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('[PWA] Service Worker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        showToast('تحديث جديد متاح! أعد تحميل الصفحة.');
                    }
                });
            });
        } catch (error) {
            console.error('[PWA] Service Worker registration failed:', error);
        }
    }
};

/**
 * Initialize everything when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Enhanced LG Branch Finder initialized');

    // Initialize dark mode first (before content loads)
    initDarkMode();

    // Initialize language
    initLanguage();

    // Register Service Worker
    registerServiceWorker();

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
    
    showError(t('dataError'));
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
    
    if (e.reason && e.reason.message) {
        if (e.reason.message.includes('Location')) {
            return;
        }
        showError(t('dataError'));
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