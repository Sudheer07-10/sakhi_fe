/**
 * JANMASETHU SHIMMER LOADING SYSTEM - LOGIC & UTILITIES
 * Handles loading transitions, accessibility attributes, timing logs, and dev helpers.
 */

(function () {
  'use strict';

  // Track state of each section
  const sectionStates = new Map(); // sectionId -> { isLoaded: boolean, startTime: number }
  let isDevModeActive = true; // Floating toggler is active by default in dev

  // CSS custom variables from index.css style definitions for dev panel
  const UI_STYLES = {
    glassBackground: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(139, 92, 246, 0.2)', // purple border line
    shadowColor: 'rgba(20, 20, 43, 0.12)',
  };

  /**
   * Core Shimmer System controller
   */
  const ShimmerSystem = {
    /**
     * Initializes a section on the page.
     * Sets proper loading accessibility attributes and starts the timer.
     */
    initSection: function (sectionId, displayName = '') {
      const parent = document.getElementById(sectionId);
      if (!parent) return;

      const skeleton = parent.querySelector('.shimmer-stage-skeleton');
      if (skeleton) {
        skeleton.setAttribute('aria-busy', 'true');
        const labelName = displayName || sectionId.replace('section-', '').replace(/-/g, ' ');
        skeleton.setAttribute('aria-label', `Loading ${labelName}`);
      }

      sectionStates.set(sectionId, {
        isLoaded: false,
        startTime: performance.now(),
        displayName: displayName || sectionId
      });

      // Reset to loading classes
      const content = parent.querySelector('.shimmer-stage-content');
      if (skeleton) skeleton.classList.remove('loaded');
      if (content) content.classList.remove('loaded');

      this.updateDevWidget();
    },

    /**
     * Completes loading for a section with 350ms fade-out/fade-in transitions.
     */
    completeSection: function (sectionId) {
      const state = sectionStates.get(sectionId);
      if (!state || state.isLoaded) return;

      const parent = document.getElementById(sectionId);
      if (!parent) return;

      const skeleton = parent.querySelector('.shimmer-stage-skeleton');
      const content = parent.querySelector('.shimmer-stage-content');

      if (skeleton) {
        skeleton.classList.add('loaded');
        // Clean up accessibility attributes once transition completes
        setTimeout(() => {
          skeleton.removeAttribute('aria-busy');
          skeleton.removeAttribute('aria-label');
        }, 350);
      }

      if (content) {
        content.classList.add('loaded');
      }

      // Log timing for developers
      const endTime = performance.now();
      const elapsed = (endTime - state.startTime).toFixed(0);
      console.log(`%c[Shimmer] "${state.displayName}" transitioned to loaded in ${elapsed}ms`, 'color: #8B5CF6; font-weight: bold;');

      state.isLoaded = true;
      this.updateDevWidget();
    },

    /**
     * Resets a section back to shimmer state immediately (no transitions).
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
        skeleton.classList.remove('loaded');
        const labelName = (state && state.displayName) || sectionId.replace('section-', '').replace(/-/g, ' ');
        skeleton.setAttribute('aria-busy', 'true');
        skeleton.setAttribute('aria-label', `Loading ${labelName}`);
      }

      if (content) {
        content.classList.remove('loaded');
      }

      this.updateDevWidget();
    },

    /**
     * Staggers the loading completion of an array of sections by 200ms.
     */
    completeSectionsStaggered: function (sectionIds) {
      sectionIds.forEach((sectionId, index) => {
        setTimeout(() => {
          this.completeSection(sectionId);
        }, index * 200);
      });
    },

    /**
     * Resets all registered sections instantly.
     */
    resetAll: function () {
      console.log('%c[Shimmer] Resetting all loading states...', 'color: #EC4899; font-weight: bold;');
      for (const sectionId of sectionStates.keys()) {
        this.resetSection(sectionId);
      }
    },

    /**
     * Completes loading for all registered sections at once.
     */
    loadAll: function () {
      for (const sectionId of sectionStates.keys()) {
        this.completeSection(sectionId);
      }
    },

    /**
     * Creates and injects the developer QA utility widget
     */
    createDevWidget: function () {
      if (document.getElementById('shimmer-dev-widget')) return;

      const widget = document.createElement('div');
      widget.id = 'shimmer-dev-widget';
      
      // Inline styles targeting rich glassmorphism (color-agnostic except HSL fallbacks)
      Object.assign(widget.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '99999',
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        background: UI_STYLES.glassBackground,
        backdropFilter: 'blur(16px)',
        webkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${UI_STYLES.glassBorder}`,
        borderRadius: 'var(--shimmer-radius, 1rem)',
        padding: '16px',
        boxShadow: `0 12px 40px ${UI_STYLES.shadowColor}`,
        width: '280px',
        color: 'var(--foreground, hsl(220 14% 11%))',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden'
      });

      const header = document.createElement('div');
      Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid var(--shimmer-base)`,
        paddingBottom: '8px',
        marginBottom: '12px',
        cursor: 'pointer',
        userSelect: 'none'
      });

      const title = document.createElement('span');
      title.innerText = '✨ Shimmer Controls';
      title.style.fontWeight = 'bold';
      title.style.fontSize = '14px';

      const toggleCollapse = document.createElement('span');
      toggleCollapse.innerText = '▼';
      toggleCollapse.style.fontSize = '10px';
      toggleCollapse.style.transition = 'transform 0.3s ease';

      header.appendChild(title);
      header.appendChild(toggleCollapse);
      widget.appendChild(header);

      const content = document.createElement('div');
      content.id = 'shimmer-dev-content';
      Object.assign(content.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      });

      // Help text
      const help = document.createElement('div');
      help.innerText = 'Press "R" on keyboard to reset all skeletons.';
      Object.assign(help.style, {
        fontSize: '11px',
        opacity: '0.7',
        lineHeight: '1.4',
        marginBottom: '4px'
      });
      content.appendChild(help);

      // Section list wrapper
      const list = document.createElement('div');
      list.id = 'shimmer-dev-list';
      Object.assign(list.style, {
        maxHeight: '200px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        paddingRight: '4px'
      });
      content.appendChild(list);

      // Global buttons
      const btnRow = document.createElement('div');
      Object.assign(btnRow.style, {
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        borderTop: `1px solid var(--shimmer-base)`,
        paddingTop: '10px'
      });

      const btnReset = document.createElement('button');
      btnReset.innerText = 'Reset All';
      Object.assign(btnReset.style, {
        flex: '1',
        padding: '6px 8px',
        borderRadius: '9999px',
        border: '1px solid var(--shimmer-base)',
        background: 'transparent',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      });
      btnReset.onclick = () => this.resetAll();

      const btnLoad = document.createElement('button');
      btnLoad.innerText = 'Load All';
      Object.assign(btnLoad.style, {
        flex: '1',
        padding: '6px 8px',
        borderRadius: '9999px',
        border: 'none',
        background: 'var(--shimmer-base)',
        color: 'var(--foreground, hsl(220 14% 11%))',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      });
      btnLoad.onclick = () => this.loadAll();

      btnRow.appendChild(btnReset);
      btnRow.appendChild(btnLoad);
      content.appendChild(btnRow);
      widget.appendChild(content);
      document.body.appendChild(widget);

      // Toggle functionality
      let collapsed = false;
      header.onclick = () => {
        collapsed = !collapsed;
        content.style.display = collapsed ? 'none' : 'flex';
        toggleCollapse.style.transform = collapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
        widget.style.paddingBottom = collapsed ? '8px' : '16px';
      };

      this.updateDevWidget();
    },

    /**
     * Refreshes the controls inside the floating dev widget
     */
    updateDevWidget: function () {
      const list = document.getElementById('shimmer-dev-list');
      if (!list) return;

      list.innerHTML = '';

      if (sectionStates.size === 0) {
        const empty = document.createElement('div');
        empty.innerText = 'No skeletons on this page.';
        empty.style.fontSize = '12px';
        empty.style.fontStyle = 'italic';
        empty.style.opacity = '0.5';
        list.appendChild(empty);
        return;
      }

      for (const [sectionId, state] of sectionStates.entries()) {
        const item = document.createElement('div');
        Object.assign(item.style, {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          background: 'var(--shimmer-base)',
          padding: '6px 10px',
          borderRadius: 'calc(var(--shimmer-radius) * 0.4)',
          opacity: state.isLoaded ? '0.7' : '1',
          transition: 'all 0.2s ease'
        });

        const name = document.createElement('span');
        name.innerText = state.displayName;
        name.style.fontWeight = '500';

        const toggleBtn = document.createElement('button');
        toggleBtn.innerText = state.isLoaded ? 'Reload' : 'Load';
        Object.assign(toggleBtn.style, {
          padding: '3px 8px',
          borderRadius: '9999px',
          border: 'none',
          background: state.isLoaded ? 'transparent' : 'var(--shimmer-highlight)',
          color: 'var(--foreground, hsl(220 14% 11%))',
          fontSize: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: state.isLoaded ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
        });

        toggleBtn.onclick = () => {
          if (state.isLoaded) {
            this.resetSection(sectionId);
          } else {
            this.completeSection(sectionId);
          }
        };

        item.appendChild(name);
        item.appendChild(toggleBtn);
        list.appendChild(item);
      }
    }
  };

  // Keyboard controls
  window.addEventListener('keydown', function (e) {
    if (e.key === 'r' || e.key === 'R') {
      // Avoid firing when user is typing in forms
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }
      ShimmerSystem.resetAll();
    }
  });

  // Automatically find elements on page load
  window.addEventListener('DOMContentLoaded', () => {
    const parentNodes = document.querySelectorAll('.shimmer-grid-parent');
    parentNodes.forEach(node => {
      const sectionId = node.id;
      if (sectionId) {
        const label = node.getAttribute('data-shimmer-label') || '';
        ShimmerSystem.initSection(sectionId, label);
      }
    });

    if (isDevModeActive) {
      ShimmerSystem.createDevWidget();
    }
  });

  // Expose system globally
  window.ShimmerSystem = ShimmerSystem;

})();
