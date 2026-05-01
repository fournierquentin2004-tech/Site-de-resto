/**
 * Restaurant Website - JavaScript
 * Handles navigation, menu tabs, form validation, and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    MenuTabs.init();
    BoissonsSubTabs.init();
    MenuSlider.init();
    FAQ.init();
    ReservationForm.init();
    ScrollEffects.init();
});

/* ================================
   Navigation Module
================================ */
const Navigation = {
    header: null,
    toggle: null,
    menu: null,
    links: null,

    init() {
        this.header = document.getElementById('header');
        this.toggle = document.getElementById('nav-toggle');
        this.menu = document.getElementById('nav-menu');
        this.links = document.querySelectorAll('.nav__link');

        this.bindEvents();
    },

    bindEvents() {
        // Mobile menu toggle
        this.toggle?.addEventListener('click', () => this.toggleMenu());

        // Close menu on link click
        this.links.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!this.menu?.contains(e.target) && !this.toggle?.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Header scroll effect
        window.addEventListener('scroll', () => this.handleScroll());

        // Active link on scroll
        window.addEventListener('scroll', () => this.updateActiveLink());
    },

    toggleMenu() {
        this.menu?.classList.toggle('open');
        this.toggle?.classList.toggle('open');
    },

    closeMenu() {
        this.menu?.classList.remove('open');
        this.toggle?.classList.remove('open');
    },

    handleScroll() {
        if (window.scrollY > 100) {
            this.header?.classList.add('scrolled');
        } else {
            this.header?.classList.remove('scrolled');
        }
    },

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav__link[href="#${id}"]`);

            if (scrollPos >= top && scrollPos < top + height) {
                this.links.forEach(l => l.classList.remove('active'));
                link?.classList.add('active');
            }
        });
    }
};

/* ================================
   Menu Tabs Module
================================ */
const MenuTabs = {
    tabs: null,
    categories: null,

    init() {
        this.tabs = document.querySelectorAll('.menu__tab');
        this.categories = document.querySelectorAll('.menu__category');

        this.bindEvents();
    },

    bindEvents() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    },

    switchTab(selectedTab) {
        const targetId = selectedTab.dataset.tab;

        this.tabs.forEach(tab => tab.classList.remove('active'));
        selectedTab.classList.add('active');

        this.categories.forEach(category => {
            category.classList.remove('active');
            if (category.id === targetId) {
                category.classList.add('active');
                category.querySelectorAll('.menu__list').forEach(list => {
                    if (list._sliderGoTo) list._sliderGoTo(0);
                });
            }
        });
    }
};

/* ================================
   Menu Slider Module
================================ */
const MenuSlider = {
    perPage() {
        return window.innerWidth <= 768 ? 6 : 12;
    },

    init() {
        document.querySelectorAll('.menu__list').forEach(list => {
            const items = [...list.querySelectorAll(':scope > .menu__list-item')];
            if (items.length > this.perPage()) this.build(list, items);
        });
    },

    build(list, items) {
        const pp = this.perPage();
        const total = Math.ceil(items.length / pp);
        let current = 0;

        const track = document.createElement('div');
        track.className = 'menu__slider-track';

        for (let p = 0; p < total; p++) {
            const slide = document.createElement('div');
            slide.className = 'menu__slide';
            items.slice(p * pp, (p + 1) * pp).forEach(item => slide.appendChild(item));
            track.appendChild(slide);
        }

        const viewport = document.createElement('div');
        viewport.className = 'menu__slider-viewport';
        viewport.appendChild(track);

        const prev = this.btn('‹', 'menu__arrow menu__arrow--prev', 'Précédent');
        const next = this.btn('›', 'menu__arrow menu__arrow--next', 'Suivant');

        const outer = document.createElement('div');
        outer.className = 'menu__slider-outer';
        outer.appendChild(prev);
        outer.appendChild(viewport);
        outer.appendChild(next);

        const dotsEl = document.createElement('div');
        dotsEl.className = 'menu__slider-dots';
        const dots = Array.from({ length: total }, (_, i) => {
            const d = this.btn('', 'menu__dot', `Page ${i + 1}`);
            d.addEventListener('click', () => goTo(i));
            dotsEl.appendChild(d);
            return d;
        });

        let startX = 0;
        viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        viewport.addEventListener('touchend', e => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
        });

        const goTo = (page) => {
            current = Math.max(0, Math.min(page, total - 1));
            const w = viewport.offsetWidth;
            track.querySelectorAll('.menu__slide').forEach(s => { s.style.width = w + 'px'; });
            track.style.transform = `translateX(${-current * w}px)`;
            prev.disabled = current === 0;
            next.disabled = current === total - 1;
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        };

        prev.addEventListener('click', () => goTo(current - 1));
        next.addEventListener('click', () => goTo(current + 1));

        list.innerHTML = '';
        list.appendChild(outer);
        if (total > 1) list.appendChild(dotsEl);
        list._sliderGoTo = goTo;
        goTo(0);
    },

    btn(text, className, label) {
        const b = document.createElement('button');
        b.className = className;
        if (text) b.innerHTML = text;
        b.setAttribute('aria-label', label);
        return b;
    }
};

/* ================================
   Boissons Sub-Tabs Module
================================ */
const BoissonsSubTabs = {
    init() {
        document.querySelectorAll('.menu__subtab').forEach(tab => {
            tab.addEventListener('click', () => this.switchSubTab(tab));
        });
    },

    switchSubTab(tab) {
        const parent = tab.closest('.menu__category');
        const targetId = tab.dataset.subtab;

        parent.querySelectorAll('.menu__subtab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        parent.querySelectorAll('.menu__subcategory').forEach(cat => {
            cat.classList.remove('active');
            if (cat.id === targetId) {
                cat.classList.add('active');
                cat.querySelectorAll('.menu__list').forEach(list => {
                    if (list._sliderGoTo) list._sliderGoTo(0);
                });
            }
        });
    }
};

/* ================================
   FAQ Accordion Module
================================ */
const FAQ = {
    init() {
        document.querySelectorAll('.faq__question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq__item');
                const isOpen = item.classList.contains('open');
                document.querySelectorAll('.faq__item').forEach(el => el.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            });
        });
    }
};

/* ================================
   Reservation Form Module
================================ */
const ReservationForm = {
    form: null,
    confirmation: null,
    submitBtn: null,
    newReservationBtn: null,

    init() {
        this.form = document.getElementById('reservation-form');
        this.confirmation = document.getElementById('confirmation');
        this.submitBtn = document.getElementById('submit-btn');
        this.newReservationBtn = document.getElementById('new-reservation');

        this.setMinDate();
        this.initDateHint();
        this.bindEvents();
    },

    initDateHint() {
        const dateInput = document.getElementById('date');
        const hint = document.querySelector('.date-hint');
        if (!dateInput || !hint) return;

        const update = () => {
            if (dateInput.value) {
                dateInput.classList.add('has-value');
                hint.classList.add('hidden');
            } else {
                dateInput.classList.remove('has-value');
                hint.classList.remove('hidden');
            }
        };

        dateInput.addEventListener('change', update);
        update();
    },

    setMinDate() {
        // Set minimum date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    },

    bindEvents() {
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
        this.newReservationBtn?.addEventListener('click', () => this.resetForm());

        // 8+ guests handler
        const guestsSelect = document.getElementById('guests');
        guestsSelect?.addEventListener('change', () => this.handleGuestsChange(guestsSelect));

        // Real-time validation
        const inputs = this.form?.querySelectorAll('.form__input');
        inputs?.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    },

    handleGuestsChange(select) {
        const guestsExact = document.getElementById('guests-exact');
        const isLarge = select.value === '8+';
        if (guestsExact) {
            guestsExact.hidden = !isLarge;
            guestsExact.required = isLarge;
            if (!isLarge) guestsExact.value = '';
        }
    },

    validateField(field) {
        const value = field.value.trim();
        const name = field.name;
        const errorElement = document.getElementById(`${name}-error`);
        let error = '';

        // Required field check
        if (field.required && !value) {
            error = 'Ce champ est requis';
        } else if (value) {
            // Specific validations
            switch (name) {
                case 'name':
                    if (value.length < 2) {
                        error = 'Le nom doit contenir au moins 2 caractères';
                    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
                        error = 'Le nom contient des caractères invalides';
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        error = 'Veuillez entrer une adresse email valide';
                    }
                    break;

                case 'phone':
                    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
                    const cleanPhone = value.replace(/[\s.-]/g, '');
                    if (cleanPhone.length < 10 || !phoneRegex.test(value)) {
                        error = 'Veuillez entrer un numéro de téléphone valide';
                    }
                    break;

                case 'date':
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        error = 'La date ne peut pas être dans le passé';
                    } else if (selectedDate.getDay() === 0) {
                        error = 'Nous sommes fermés le dimanche';
                    }
                    break;

                case 'guests':
                    if (!value) {
                        error = 'Veuillez sélectionner le nombre de personnes';
                    }
                    break;

                case 'time':
                    if (!value) {
                        error = 'Veuillez sélectionner une heure';
                    }
                    break;
            }
        }

        // Display error
        if (error) {
            field.classList.add('error');
            if (errorElement) errorElement.textContent = error;
            return false;
        } else {
            field.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
            return true;
        }
    },

    clearError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (field.classList.contains('error') && field.value.trim()) {
            field.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
        }
    },

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    },

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            // Scroll to first error
            const firstError = this.form.querySelector('.form__input.error');
            firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Show loading state
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;

        // Simulate API call
        await this.simulateSubmission();

        // Hide loading state
        this.submitBtn.classList.remove('loading');
        this.submitBtn.disabled = false;

        // Show confirmation
        this.showConfirmation();
    },

    simulateSubmission() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    },

    showConfirmation() {
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Format date
        const dateObj = new Date(data.date);
        const formattedDate = dateObj.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Update confirmation content
        document.getElementById('confirm-name').textContent = data.name;
        document.getElementById('confirm-date').textContent = formattedDate;
        document.getElementById('confirm-time').textContent = data.time;
        const guestsCount = data.guests === '8+' ? data['guests-exact'] : data.guests;
        document.getElementById('confirm-guests').textContent =
            guestsCount === '1' ? '1 personne' : `${guestsCount} personnes`;
        document.getElementById('confirm-email').textContent = data.email;

        // Save to localStorage for admin dashboard
        const reservation = {
            id: Date.now().toString(),
            nom: data.name,
            email: data.email,
            tel: data.phone || '',
            date: data.date,
            dateFormatee: formattedDate,
            heure: data.time,
            couverts: guestsCount,
            message: data.message || '',
            createdAt: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('tabledor_reservations') || '[]');
        existing.push(reservation);
        localStorage.setItem('tabledor_reservations', JSON.stringify(existing));

        // Switch views
        this.form.hidden = true;
        this.confirmation.hidden = false;

        // Scroll to confirmation
        this.confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Log reservation (in production, send to backend)
        console.log('Reservation submitted:', data);
    },

    resetForm() {
        this.form.reset();
        this.form.hidden = false;
        this.confirmation.hidden = true;
        
        // Clear all errors
        this.form.querySelectorAll('.form__input').forEach(input => {
            input.classList.remove('error');
        });
        this.form.querySelectorAll('.form__error').forEach(error => {
            error.textContent = '';
        });

        // Scroll to form
        this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

/* ================================
   Scroll Effects Module
================================ */
const ScrollEffects = {
    backToTop: null,

    init() {
        this.backToTop = document.getElementById('back-to-top');
        this.bindEvents();
        this.initSmoothScroll();
    },

    bindEvents() {
        window.addEventListener('scroll', () => this.toggleBackToTop());
        this.backToTop?.addEventListener('click', () => this.scrollToTop());
    },

    toggleBackToTop() {
        if (window.scrollY > 500) {
            this.backToTop?.classList.add('visible');
        } else {
            this.backToTop?.classList.remove('visible');
        }
    },

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    target?.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
};

/* ================================
   Intersection Observer for Animations
================================ */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.menu__item, .gallery__item, .about__feature, .contact__card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animation styles
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);