/**
 * JANMASETHU ELEVATED SHIMMER EFFECT SYSTEM - LOGIC CONTROLLER
 * Manages progress bar timelines, skeleton entry delays, contextual loading text, and materializing reveals.
 */

(function () {
  'use strict';

  // Text loading hints removed to keep skeletons purely visual and glowing as requested

  let progressBar = null;
  let progressInterval = null;
  let progressTimeout = null;
  let progressStartTime = 0;
  const sectionStates = new Map(); // sectionId -> { isLoaded: boolean, startTime: number }

  const ShimmerEffectsSystem = {
    /**
     * Spawns and configures the top progress bar.
     */
    createProgressBar: function () {
      if (document.getElementById('shimmer-progress-bar')) return;

      progressBar = document.createElement('div');
      progressBar.id = 'shimmer-progress-bar';
      
      // Fully color-agnostic, using theme HSL system (falls back to purple gradient)
      Object.assign(progressBar.style, {
        position: 'fixed',
        left: '0',
        height: '2px',
        width: '0%',
        zIndex: '9999',
        background: 'linear-gradient(90deg, var(--primary, #9333EA), var(--secondary, #EC4899))',
        opacity: '1',
        transition: 'width 800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease'
      });

      document.body.appendChild(progressBar);
      this.positionProgressBar();

      // Recalculate on window resize (e.g. if header height changes)
      window.addEventListener('resize', () => this.positionProgressBar());
    },

    /**
     * Positions progress bar exactly below navbar if sticky header exists.
     */
    positionProgressBar: function () {
      if (!progressBar) return;
      
      // Search for standard header tags or Janmasethu specific class (.site-header)
      const header = document.querySelector('header') || document.querySelector('.site-header') || document.querySelector('nav');
      
      if (header && window.getComputedStyle(header).position === 'fixed' || 
          header && window.getComputedStyle(header).position === 'sticky') {
        progressBar.style.top = `${header.offsetHeight}px`;
      } else {
        progressBar.style.top = '0px';
      }
    },

    /**
     * Starts the smart progress bar animation (Effect 4).
     */
    startProgress: function () {
      this.createProgressBar();
      if (!progressBar) return;

      // Clean up past cycles
      clearInterval(progressInterval);
      clearTimeout(progressTimeout);
      progressBar.classList.remove('shimmer-progress-oscillate');
      progressBar.style.opacity = '1';
      progressBar.style.width = '0%';
      progressStartTime = performance.now();

      // Step 1: Fast start to 70% in first 800ms
      setTimeout(() => {
        progressBar.style.width = '70%';
      }, 50);

      // Step 2: Slow crawl from 70% to 85%
      progressTimeout = setTimeout(() => {
        let currentWidth = 70;
        progressBar.style.transition = 'width 1.2s ease-out';
        
        progressInterval = setInterval(() => {
          if (currentWidth < 85) {
            currentWidth += 0.8;
            progressBar.style.width = `${currentWidth}%`;
          }
          
          // Step 3: Oscillation if loading takes more than 4 seconds
          const elapsed = performance.now() - progressStartTime;
          if (elapsed > 4000 && !progressBar.classList.contains('shimmer-progress-oscillate')) {
            progressBar.classList.add('shimmer-progress-oscillate');
          }
        }, 300);
      }, 800);
    },

    /**
     * Completes progress bar animation, sweeping to 100% then fading out.
     */
    completeProgress: function () {
      clearInterval(progressInterval);
      clearTimeout(progressTimeout);

      if (!progressBar) return;

      // Transition to 100%
      progressBar.style.transition = 'width 250ms ease-out, opacity 400ms ease';
      progressBar.style.width = '100%';

      // Fade out
      setTimeout(() => {
        progressBar.style.opacity = '0';
        // Reset after fade out completes
        setTimeout(() => {
          progressBar.style.width = '0%';
          progressBar.classList.remove('shimmer-progress-oscillate');
        }, 400);
      }, 250);
    },

    /**
     * Initializes staggered skeleton entrance on the page (Effect 3).
     */
    initStaggeredEntries: function () {
      const sections = document.querySelectorAll('.shimmer-grid-parent');
      
      sections.forEach((section, sectionIdx) => {
        const sectionId = section.id || `section-idx-${sectionIdx}`;
        if (!section.id) section.id = sectionId;
        
        const skeleton = section.querySelector('.shimmer-stage-skeleton');
        if (skeleton) {
          // Set section-level entry stagger delay
          const sectionDelay = sectionIdx * 80;
          skeleton.style.animationDelay = `${sectionDelay}ms`;
          
          // Set staggered delays for cards/children inside this section
          const cards = skeleton.querySelectorAll('.skeleton-card, .tool-item, .detail-card');
          cards.forEach((card, cardIdx) => {
            card.classList.add('sk-breath'); // Enable breathing pulse (Effect 2)
            const cardDelay = sectionDelay + (cardIdx * 50);
            card.style.animationDelay = `${cardDelay}ms`;
          });
        }

        sectionStates.set(sectionId, {
          isLoaded: false,
          startTime: performance.now()
        });
      });
    },

    /* Removed injectLoadingHint function to keep layout purely visual and glowing */

    /**
     * Dynamic double-step content reveal swap function (Effect 6).
     */
    revealSection: function (sectionId) {
      const parent = document.getElementById(sectionId);
      if (!parent) return;

      const skeleton = parent.querySelector('.shimmer-stage-skeleton');
      const content = parent.querySelector('.shimmer-stage-content');
      
      const state = sectionStates.get(sectionId);
      if (state) state.isLoaded = true;

      // Step 1: Skeleton fades out and scales down (250ms ease-in)
      if (skeleton) {
        skeleton.classList.add('loaded');
        skeleton.setAttribute('aria-busy', 'false');
      }

      // Step 2: Content starts fading in 100ms before skeleton ends (i.e. at 150ms delay)
      setTimeout(() => {
        if (content) {
          content.classList.add('loaded');
          content.removeAttribute('aria-hidden');

          // Step 3: Reveal and stagger children inside content (40ms delay)
          const childElements = content.querySelectorAll('.real-card, .tool-item, .info-item, .bullet-list-item, p, h1, h2, h3, .grid > *, .flex > *');
          
          childElements.forEach((child, childIdx) => {
            child.classList.add('reveal-child');
            // Force reflow to ensure transition starts from translateY(8px)
            child.getBoundingClientRect();
            
            setTimeout(() => {
              child.classList.add('reveal-active');
            }, childIdx * 40);
          });
        }

        // Clean up skeleton display once it is fully invisible
        setTimeout(() => {
          if (skeleton) skeleton.style.display = 'none';
        }, 250);

        // Check if all active sections have loaded. If so, close top progress loader.
        let allLoaded = true;
        for (const sState of sectionStates.values()) {
          if (!sState.isLoaded) {
            allLoaded = false;
            break;
          }
        }
        if (allLoaded) {
          this.completeProgress();
        }
      }, 150);

      // Console timing log
      if (state) {
        const elapsed = (performance.now() - state.startTime).toFixed(0);
        const name = sectionId.replace('section-', '').replace(/-/g, ' ');
        console.log(`%c[Shimmer] Loaded "${name}" in ${elapsed}ms`, 'color: #9333EA; font-weight: 700;');
      }
    },

    /**
     * Resets a specific section back to loading state instantly.
     */
    resetSection: function (sectionId) {
      const parent = document.getElementById(sectionId);
      if (!parent) return;

      const state = sectionStates.get(sectionId);
      if (state) {
        state.isLoaded = false;
        state.startTime = performance.now();
      }

      const skeleton = parent.querySelector('.shimmer-stage-skeleton');
      const content = parent.querySelector('.shimmer-stage-content');

      if (skeleton) {
        skeleton.style.display = '';
        skeleton.classList.remove('loaded');
        skeleton.setAttribute('aria-busy', 'true');
      }

      if (content) {
        content.classList.remove('loaded');
        const children = content.querySelectorAll('.reveal-child');
        children.forEach(c => {
          c.classList.remove('reveal-child', 'reveal-active');
        });
      }
    },

    /**
     * Resets all loading areas and restarts top progress loader.
     */
    resetAll: function () {
      this.startProgress();
      for (const sectionId of sectionStates.keys()) {
        this.resetSection(sectionId);
      }
      // Re-trigger entries
      this.initStaggeredEntries();
    }
  };

  // Keyboard listener: "R" resets everything
  window.addEventListener('keydown', function (e) {
    if (e.key === 'r' || e.key === 'R') {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        return;
      }
      ShimmerEffectsSystem.resetAll();
    }
  });

  // Automatically start loading system on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    ShimmerEffectsSystem.startProgress();
    ShimmerEffectsSystem.initStaggeredEntries();
  });

  // Expose system controller to window
  window.ShimmerEffectsSystem = ShimmerEffectsSystem;

})();
