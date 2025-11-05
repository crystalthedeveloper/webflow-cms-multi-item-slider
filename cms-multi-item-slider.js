document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll('[data-cltd-slider="cms"]');

  sliders.forEach(slider => {
    const listWrapper = slider.querySelector('[data-cltd-items-per-slide]');
    const sliderMask = slider.querySelector('[data-cltd-slider-mask]');
    if (!listWrapper || !sliderMask) return;

    const parsePositiveInt = value => {
      const parsed = parseInt(value, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };

    // ✅ Single dataset
    const defaultItemsPerSlide = parsePositiveInt(listWrapper.dataset.cltdItemsPerSlide) || 1;

    // ✅ Get all CMS items
    const itemEls = Array.from(listWrapper.querySelectorAll('.w-dyn-item'));
    if (itemEls.length === 0) return;

    // 🔍 Find slide group
    const findGroupElement = element => {
      if (!element) return null;
      return (
        element.querySelector('[data-cltd-slide-group]') ||
        element.querySelector('.cltd-slide-group') ||
        element.querySelector('.w-dyn-items') ||
        element.firstElementChild ||
        element
      );
    };

    // ✅ Responsive rule: use 1 item on mobile
    const getEffectiveItemsPerSlide = () => {
      const width = window.innerWidth || document.documentElement.clientWidth || 1024;
      if (width <= 767) return 1;
      return defaultItemsPerSlide;
    };

    const existingSlides = Array.from(sliderMask.querySelectorAll('.w-slide'));
    const templateSlideEl = existingSlides[0] || null;
    const templateGroupEl = templateSlideEl ? findGroupElement(templateSlideEl) : null;
    const originalItemsWrapper = listWrapper.querySelector('.w-dyn-items');

    const collectClassNames = element => {
      if (!element) return [];
      return Array.from(element.classList).filter(cls => {
        if (cls === 'w-slide') return false;
        if (/^cltd-slide-group-\d+$/i.test(cls)) return false;
        if (/^w-dyn(\b|$)/.test(cls)) return false;
        return true;
      });
    };

    const baseGroupClassSet = new Set(['cltd-slide-group']);
    collectClassNames(templateGroupEl).forEach(cls => baseGroupClassSet.add(cls));
    collectClassNames(originalItemsWrapper).forEach(cls => baseGroupClassSet.add(cls));
    collectClassNames(listWrapper).forEach(cls => baseGroupClassSet.add(cls));
    const baseGroupClasses = Array.from(baseGroupClassSet);

    const {
      cltdSlideGap,
      cltdSlideColumnGap,
      cltdSlideRowGap,
      cltdSlideSingleLayout,
      cltdLayout: layoutMode,
      cltdAlign: layoutAlign
    } = listWrapper.dataset;

    const applyGroupLayout = (group, targetCount, actualCount) => {
      const resolvedTarget = Math.max(targetCount, 1);
      const resolvedActual = Math.max(actualCount || 0, 0);
      const columns = Math.max(Math.min(resolvedActual || resolvedTarget, resolvedTarget), 1);
      const prefersFlex = layoutMode === 'flex';
      const isGrid = !prefersFlex && resolvedTarget > 1 && columns > 1;

      if (prefersFlex) {
        group.style.display = 'flex';
        group.style.flexWrap = 'wrap';
        group.style.gap = cltdSlideGap || '1.5rem';
        group.style.columnGap = cltdSlideColumnGap || '';
        group.style.rowGap = cltdSlideRowGap || '';

        const justifyLookup = {
          left: 'flex-start',
          start: 'flex-start',
          center: 'center',
          middle: 'center',
          right: 'flex-end',
          end: 'flex-end'
        };
        const alignItemsLookup = {
          left: 'stretch',
          start: 'stretch',
          center: 'center',
          middle: 'center',
          right: 'stretch',
          end: 'stretch'
        };

        const justify = justifyLookup[(layoutAlign || '').toLowerCase()] || justifyLookup.center;
        const alignItems = alignItemsLookup[(layoutAlign || '').toLowerCase()] || 'stretch';

        group.style.justifyContent = justify;
        group.style.alignItems = alignItems;
        group.style.gridTemplateColumns = '';
      } else if (isGrid) {
        group.style.display = 'grid';
        group.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
        const gapValue = cltdSlideGap || '1.5rem';
        group.style.gap = gapValue;
        group.style.columnGap = cltdSlideColumnGap || '';
        group.style.rowGap = cltdSlideRowGap || '';
      } else {
        group.style.display = cltdSlideSingleLayout || 'block';
        group.style.gridTemplateColumns = '';
        group.style.gap = '';
        group.style.justifyContent =
          (layoutAlign || '').toLowerCase() === 'center'
            ? 'center'
            : (layoutAlign || '').toLowerCase() === 'right'
            ? 'flex-end'
            : '';
      }
    };

    const slidePrototype = templateSlideEl ? templateSlideEl.cloneNode(false) : null;
    const navElements = Array.from(
      slider.querySelectorAll('.w-slider-arrow-left, .w-slider-arrow-right, .w-slider-nav')
    ).map(el => ({ el, originalDisplay: el.style.display }));

    let lastRenderedCount = null;

    const rebuildSlider = force => {
      const itemsPerSlide = getEffectiveItemsPerSlide();
      if (!force && lastRenderedCount === itemsPerSlide && sliderMask.querySelector('.w-slide')) return;
      lastRenderedCount = itemsPerSlide;

      listWrapper.remove();
      sliderMask.innerHTML = '';

      const fragment = document.createDocumentFragment();

      for (let i = 0; i < itemEls.length; i += itemsPerSlide) {
        const groupIndex = Math.floor(i / itemsPerSlide) + 1;
        const slide = slidePrototype ? slidePrototype.cloneNode(true) : document.createElement('div');
        if (!slidePrototype) slide.classList.add('w-slide');
        if (slide.hasAttribute('id')) slide.removeAttribute('id');

        const group = document.createElement('div');
        baseGroupClasses.forEach(cls => group.classList.add(cls));

        // ✅ ADD ARIA ROLES for accessibility
        group.setAttribute('role', 'list');
        group.setAttribute('aria-label', `Slide group ${groupIndex}`);

        const itemsForGroup = itemEls.slice(i, i + itemsPerSlide);
        applyGroupLayout(group, itemsPerSlide, itemsForGroup.length);
        group.classList.add(`cltd-slide-group-${groupIndex}`);

        itemsForGroup.forEach(el => {
          el.setAttribute('role', 'listitem'); // ✅ re-apply role
          group.appendChild(el);
        });

        slide.appendChild(group);
        fragment.appendChild(slide);
      }

      sliderMask.appendChild(fragment);

      const slideCount = sliderMask.querySelectorAll('.w-slide').length;
      navElements.forEach(({ el, originalDisplay }) => {
        if (!el) return;
        if (slideCount <= 1) {
          el.style.display = 'none';
          el.setAttribute('data-cltd-slider-hidden', 'true');
        } else {
          el.style.display = originalDisplay || '';
          el.removeAttribute('data-cltd-slider-hidden');
        }
      });

      // ✅ Restore ARIA on the slider itself
      slider.setAttribute('role', 'region');
      slider.setAttribute('aria-label', 'CMS Slider');
      sliderMask.querySelectorAll('.w-slide').forEach((slide, i) => {
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-label', `Slide ${i + 1}`);
      });

      if (window.Webflow?.require) {
        const wfSlider = Webflow.require('slider');
        wfSlider?.redraw?.();
      }
    };

    rebuildSlider(true);

    let resizeTimeoutId;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = window.setTimeout(() => rebuildSlider(false), 150);
    });
  });
});
