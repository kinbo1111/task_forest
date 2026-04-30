wow = new WOW(
    {
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: true,
        live: true
    }
)
wow.init();
(() => {
    const initSmoothAnchorScroll = () => {
        const header = document.querySelector(".header");
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        if (!anchorLinks.length) return;

        anchorLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                const href = link.getAttribute("href");
                if (!href || href === "#") {
                    event.preventDefault();
                    return;
                }

                const target = document.querySelector(href);
                if (!target) return;

                event.preventDefault();
                const headerHeight = header ? header.offsetHeight : 0;
                const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                window.scrollTo({
                    top: Math.max(targetTop, 0),
                    behavior: "smooth",
                });
            });
        });
    };

    const initHeaderMenu = () => {
        const header = document.querySelector(".header");
        const menuButton = document.querySelector(".header__menu");
        const dropdown = document.querySelector(".header__dropdown");

        if (!header || !menuButton || !dropdown) return;

        const syncHeaderScrollState = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 0);
        };

        syncHeaderScrollState();
        window.addEventListener("scroll", syncHeaderScrollState, { passive: true });

        const closeMenu = () => {
            menuButton.classList.remove("is-open");
            dropdown.classList.remove("is-open");
            menuButton.setAttribute("aria-expanded", "false");
        };

        const openMenu = () => {
            menuButton.classList.add("is-open");
            dropdown.classList.add("is-open");
            menuButton.setAttribute("aria-expanded", "true");
        };

        menuButton.addEventListener("click", () => {
            const isOpen = menuButton.classList.contains("is-open");
            if (isOpen) {
                closeMenu();
                return;
            }
            openMenu();
        });

        document.addEventListener("click", (event) => {
            if (!menuButton.classList.contains("is-open")) return;
            if (menuButton.contains(event.target) || dropdown.contains(event.target)) return;
            closeMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });

        dropdown.addEventListener("click", (event) => {
            const anchor = event.target.closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (href && href.startsWith("#") && href !== "#") {
                closeMenu();
            }
        });
    };

    const initFaq = () => {
        const categories = document.querySelectorAll(".faq__category");
        const navButtons = document.querySelectorAll(".faq__category-link");
        const questions = document.querySelectorAll(".faq__question");
        if (!categories.length) return;

        const setAccordionState = (element, isOpen) => {
            if (isOpen) {
                element.style.maxHeight = `${element.scrollHeight}px`;
                const onOpenEnd = (event) => {
                    if (event.target !== element || event.propertyName !== "max-height") return;
                    element.style.maxHeight = "none";
                    element.removeEventListener("transitionend", onOpenEnd);
                };
                element.addEventListener("transitionend", onOpenEnd);
                return;
            }

            if (element.style.maxHeight === "none") {
                element.style.maxHeight = `${element.scrollHeight}px`;
                void element.offsetHeight;
            }
            element.style.maxHeight = "0px";
        };

        const syncActiveNav = () => {
            const openedCategory = document.querySelector(".faq__category.is-open");
            const activeId = openedCategory?.dataset.faqCategory;
            navButtons.forEach((button) => {
                button.classList.toggle("is-active", button.dataset.faqNav === activeId);
            });
        };

        const refreshOpenCategoryHeights = () => {
            categories.forEach((category) => {
                const body = category.querySelector(".faq__category-body");
                if (!body) return;
                if (category.classList.contains("is-open")) {
                    body.style.maxHeight = "none";
                }
            });
        };

        categories.forEach((category) => {
            const trigger = category.querySelector(".faq__category-trigger");
            const body = category.querySelector(".faq__category-body");
            if (!trigger || !body) return;

            setAccordionState(body, category.classList.contains("is-open"));

            trigger.addEventListener("click", () => {
                const opened = category.classList.toggle("is-open");
                trigger.setAttribute("aria-expanded", opened ? "true" : "false");
                setAccordionState(body, opened);
                syncActiveNav();
            });
        });

        navButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const targetCategory = document.querySelector(`[data-faq-category="${button.dataset.faqNav}"]`);
                if (!targetCategory) return;

                const trigger = targetCategory.querySelector(".faq__category-trigger");
                const body = targetCategory.querySelector(".faq__category-body");
                if (!trigger || !body) return;

                categories.forEach((category) => {
                    const categoryTrigger = category.querySelector(".faq__category-trigger");
                    const categoryBody = category.querySelector(".faq__category-body");
                    if (!categoryTrigger || !categoryBody) return;
                    const isTarget = category === targetCategory;
                    category.classList.toggle("is-open", isTarget);
                    categoryTrigger.setAttribute("aria-expanded", isTarget ? "true" : "false");
                    setAccordionState(categoryBody, isTarget);
                });

                targetCategory.scrollIntoView({ behavior: "smooth", block: "start" });
                syncActiveNav();
            });
        });

        syncActiveNav();

        questions.forEach((button) => {
            const item = button.closest(".faq__item");
            const answer = item?.querySelector(".faq__answer");
            if (answer) {
                setAccordionState(answer, item.classList.contains("is-open"));
            }

            button.addEventListener("click", () => {
                const item = button.closest(".faq__item");
                const answer = item?.querySelector(".faq__answer");
                if (!item || !answer) return;
                const expanded = item.classList.toggle("is-open");
                button.setAttribute("aria-expanded", expanded ? "true" : "false");
                setAccordionState(answer, expanded);

                const categoryBody = item.closest(".faq__category-body");
                if (categoryBody && categoryBody.style.maxHeight !== "0px") {
                    requestAnimationFrame(() => {
                        categoryBody.style.maxHeight = `${categoryBody.scrollHeight}px`;
                    });
                }
            });
        });

        window.addEventListener("resize", () => {
            refreshOpenCategoryHeights();
        });

        // Prevent initial clipping after fonts/layout finalize.
        requestAnimationFrame(() => {
            refreshOpenCategoryHeights();
        });
        window.addEventListener("load", refreshOpenCategoryHeights);
        if (document.fonts?.ready) {
            document.fonts.ready.then(refreshOpenCategoryHeights);
        }
    };

    const initToTopButton = () => {
        const footer = document.querySelector(".footer");
        const toTopButton = document.querySelector(".footer__to-top");
        if (!footer || !toTopButton) return;

        const showButton = () => toTopButton.classList.add("is-visible");
        const hideButton = () => toTopButton.classList.remove("is-visible");

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        showButton();
                        return;
                    }
                    hideButton();
                },
                { threshold: 0.2 }
            );
            observer.observe(footer);
        } else {
            const onScroll = () => {
                const footerTop = footer.getBoundingClientRect().top;
                if (footerTop <= window.innerHeight * 0.9) {
                    showButton();
                    return;
                }
                hideButton();
            };
            window.addEventListener("scroll", onScroll);
            onScroll();
        }

        toTopButton.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    };

    const initUnderlineReveal = () => {
        const underlines = document.querySelectorAll(".underline-reveal");
        if (!underlines.length) return;

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
                (entries, currentObserver) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add("is-visible");
                        currentObserver.unobserve(entry.target);
                    });
                },
                { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
            );

            underlines.forEach((underline) => observer.observe(underline));
            return;
        }

        underlines.forEach((underline) => underline.classList.add("is-visible"));
    };

    initSmoothAnchorScroll();
    initHeaderMenu();
    initFaq();
    initToTopButton();
    initUnderlineReveal();
})();
