/**
 * Adds a method to the Element prototype for scrolling smoothly to a target child element.
 *
 * @param {string} selector - The CSS selector for the target element to scroll to.
 * @param {number} [duration=500] - The duration of the scroll animation in milliseconds.
 */
Element.prototype.scrollToElement = function (selector: string, duration: number = 500) {
    // Find the target element within the current container
    const target = this.querySelector(selector);

    if (target) {
        // Calculate the container's position relative to the viewport
        const containerOffset = this.getBoundingClientRect().top;
        // Calculate the target's position relative to the viewport
        const targetOffset = target.getBoundingClientRect().top;
        // Compute the scroll offset to bring the target into view
        const scrollOffset = targetOffset - containerOffset + this.scrollTop;

        // Capture the initial scroll position of the container
        const start = this.scrollTop;
        // Calculate the distance to scroll
        const distance = scrollOffset - start;
        // Record the start time of the animation
        const startTime = performance.now();

        /**
         * Easing function for smooth acceleration and deceleration.
         * @param {number} t - A value between 0 and 1 representing the animation progress.
         * @returns {number} - The eased progress value.
         */
        const easeInOutQuad = (t: number) => {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        };

        /**
         * Recursive animation function to incrementally adjust the scroll position.
         *
         * @param {number} currentTime - The current timestamp provided by requestAnimationFrame.
         */
        const animateScroll = (currentTime: number) => {
            // Calculate the time elapsed since the animation started
            const timeElapsed = currentTime - startTime;

            // Determine the progress as a value between 0 and 1
            const progress = Math.min(timeElapsed / duration, 1); // Cap progress at 1

            // Apply easing to the progress value
            const easedProgress = easeInOutQuad(progress);

            // Adjust the scroll position based on eased progress
            this.scrollTop = start + distance * easedProgress;

            // Continue the animation until progress reaches 1
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        // Start the animation
        requestAnimationFrame(animateScroll);
    } else {
        // Log a warning if the target element is not found
        console.warn(`Element "${selector}" not found within the container.`);
    }
};

export class Slider {
    #currentIndex: number = 0; // Tracks the current slide index
    readonly #scrollerContainerLeft: HTMLDivElement | null;
    readonly #scrollerContainerRight: HTMLDivElement | null;

    constructor() {
        // Initialize the scroller containers
        this.#scrollerContainerLeft = document.querySelector('.scroll-container-left');
        this.#scrollerContainerRight = document.querySelector('.scroll-container-right');

        // Safeguard: Log a warning if the containers are not found
        if (!this.#scrollerContainerLeft || !this.#scrollerContainerRight) {
            console.warn("Scroller containers not found. Ensure the DOM has elements with appropriate classes.");
        }

        // Initialize default slides
        this.initializeDefaultSlides();

        // Handle window resize events
        window.addEventListener('resize', this._handleScreenResize.bind(this));

        // Initialize slider actions (click handlers)
        this._handleSliderActions();
    }

    /**
     * Initializes the default slide positions for both containers.
     * This is called when the slider is first loaded.
     */
    private initializeDefaultSlides() {
        this._scrollToCurrentSlide(900, 700);
    }

    /**
     * Scrolls both containers to the current slide index with specified durations.
     * @param leftDuration Duration for the left container scroll animation.
     * @param rightDuration Duration for the right container scroll animation.
     */
    private _scrollToCurrentSlide(leftDuration: number, rightDuration: number) {
        // @ts-ignore
        this.#scrollerContainerLeft?.scrollToElement(`.element-${this.#currentIndex}`, leftDuration, false);
        // @ts-ignore
        this.#scrollerContainerRight?.scrollToElement(`.element-${this.#currentIndex}`, rightDuration, false);
    }

    /**
     * Adds click event listeners to elements with a `data-slide-index` attribute.
     * Updates the current slide index and triggers the scroll animation.
     */
    private _handleSliderActions() {
        document.querySelectorAll<HTMLElement>('[data-slide-index]').forEach((element) => {
            element.addEventListener('click', () => {
                // Parse and set the new slide index
                const index = parseInt(element.dataset.slideIndex || '0', 10);
                if (!isNaN(index)) {
                    this.#currentIndex = index;
                    this._goToSlide();
                } else {
                    console.warn(`Invalid slide index for element:`, element);
                }
            });
        });
    }

    /**
     * Handles screen resize events to re-align the scrollers to the current slide.
     * Scrolls both containers using different directions and durations.
     */
    private _handleScreenResize() {
        // @ts-ignore
        this.#scrollerContainerLeft?.scrollToElement(`.element-${this.#currentIndex}`, 500);
        // @ts-ignore
        this.#scrollerContainerRight?.scrollToElement(`.element-${this.#currentIndex}`, 500);
    }

    /**
     * Scroll to the current slide index for both containers.
     * Uses different durations for left and right containers.
     */
    private _goToSlide() {
        // @ts-ignore
        this.#scrollerContainerLeft?.scrollToElement(`.element-${this.#currentIndex}`, 900);
        // @ts-ignore
        this.#scrollerContainerRight?.scrollToElement(`.element-${this.#currentIndex}`, 1100);
    }

}