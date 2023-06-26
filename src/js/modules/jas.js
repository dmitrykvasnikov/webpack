const DEFAULTS = {
  toShow: 1,
  toScroll: 1,
  gap: '0px',
  loop: false,
  direction: 'row',
  active: 1,
  lastActive: 1,
  next: 1,
  prev: 1,
  speed: '500ms',
  translate: 0,
  overflow: 'hidden',
  flex: 'calc((100% - var(--gap) * var(--gapToShow)) / var(--toShow))',
  align: 'index',
  navigation: {
    prev: '.jas-button-prev',
    next: '.jas-button-next',
    disableClass: 'disabled',
  }
}

export default class Jas {
  constructor(selector, params) {
    // CONFIG property
    this.c = { ...DEFAULTS, ...params }
    // VARIABLES property (will be initialized in init)
    this.v = {
      inTransition: false,
      animationID: null,
      timerID: null,
      isDragging: false,
      startTouch: 0,
      lastTranslate: 0,
      mouseDown: false,
      href: null
    }
    // DOM elements property (will be initialized in init)
    this.d = {}
    // slider positions as {id: position} values
    this.w = {}
    // navigation elements object
    this.nav = {}
    this.init(selector)
  }

  init(selector) {
    // adding / modify some config valuse
    this.c.gapToShow = Math.ceil(this.c.toShow) - 1
    if (this.c.toShow === 'auto') this.c.flex = 'auto'
    this.c.lastActive = this.c.active
    // setting up variables
    this.v.offsetProp = this.c.direction === 'row' ? 'offsetLeft' : 'offsetTop'
    this.v.translateProp = this.c.direction === 'row' ? 'translateX' : 'translateY'
    this.v.widthProp = this.c.direction === 'row' ? 'offsetWidth' : 'offsetHeight'
    this.v.wrapperProp = this.c.direction === 'row' ? 'clientWidth' : 'clientHeight'
    this.v.pointerProp = this.c.direction === 'row' ? 'clientX' : 'clientY'
    // getting DOM elements
    this.d.slider = document.querySelector(selector)
    this.d.wrapper = this.d.slider.querySelector('.jas-wrapper')
    this.d.slides = this.d.wrapper.children
    // setting up additional styles for slider 
    this.updateSliderProps(['direction', 'toShow', 'toScroll', 'gap', 'gapToShow', 'flex', 'speed'])
    this.setupSlider()
    this.setupWrapper()
    this.setupSlidesID()
    this.getSlideByID(this.c.active).classList.add('jas-active')
    this.updateSlidesPosition()
    this.setupNavigation()
    this.normalizeIndex()
  }

  updateSlidesPosition() {
    for (let ind = 1; ind <= this.d.slides.length; ind++) {
      this.w[ind] = this.getSlideByID(ind)[this.v.offsetProp]
    }
    if (!this.c.loop) {
      // keeping wrap width and last index width
      this.w['w'] = this.d.wrapper[this.v.wrapperProp]
      this.w['l'] = this.getSlideByID(this.d.slides.length)[this.v.widthProp]
    }
  }

  setupSlidesID() {
    for (let ind = 0; ind < this.d.slides.length; ind++) {
      this.d.slides.item(ind).dataset.id = ind + 1
    }
  }

  getSlideByID(id) {
    return this.d.wrapper.querySelector(`[data-id="${id}"]`)
  }

  updateSliderProps(arr) {
    arr.forEach(prop => this.d.slider.style.setProperty(`--${prop}`, this.c[prop]))
  }

  setupNavigation() {
    // setting up prev / next buttons
    if (this.c.navigation.prev) {
      if (this.c.navigation.prev === '.jas-button-prev') {
        this.nav.prevEl = this.d.slider.querySelector(this.c.navigation.prev)
        this.nav.prevEl.classList.add(this.c.direction)
      } else this.nav.prevEl = document.querySelector(this.c.navigation.prev)
    }
    if (this.c.navigation.next) {
      if (this.c.navigation.next === '.jas-button-next') {
        this.nav.nextEl = this.d.slider.querySelector(this.c.navigation.next)
        this.nav.nextEl.classList.add(this.c.direction)
      } else this.nav.nextEl = document.querySelector(this.c.navigation.next)
    }
    if (this.nav.prevEl) this.nav.prevEl.addEventListener('click', this.prevElHandler.bind(this))
    if (this.nav.nextEl) this.nav.nextEl.addEventListener('click', this.nextElHandler.bind(this))
  }

  nextElHandler() {
    this.c.align = 'index'
    if (this.v.inTransition) return
    if (this.c.loop) {
      this.setupNextSlide()
      setTimeout(() => {
        this.getSlideByID(this.c.next).classList.remove('jas-next')
        this.getSlideByID(this.c.prev).classList.remove('jas-prev')
        this.getSlideByID(this.c.active).classList.add('jas-prev')
        this.c.active += this.c.toScroll
        this.normalizeIndex()
        this.setupPosition()
      }, 5);
    } else {
      this.c.active += this.c.toScroll
      this.normalizeIndex()
      this.setupPosition()
    }

  }

  prevElHandler() {
    this.c.align = 'index'
    if (this.v.inTransition) return
    if (this.c.loop) {
      this.setupPrevSlide()
      setTimeout(() => {
        this.getSlideByID(this.c.prev).classList.remove('jas-prev')
        this.getSlideByID(this.c.next).classList.remove('jas-next')
        this.getSlideByID(this.c.active).classList.add('jas-next')
        this.c.active -= this.c.toScroll
        this.normalizeIndex()
        this.setupPosition()
      }, 5);
    } else {
      this.c.active -= this.c.toScroll
      this.normalizeIndex()
      this.setupPosition()
    }
  }

  setupWrapper() {
    let ro = new ResizeObserver(entries => {
      this.updateSlidesPosition()
      this.setupPosition(false)
    })
    ro.observe(this.d.wrapper)
    setTimeout(() => {
      this.d.wrapper.style.transition = `all ${this.c.speed} ease`
    }, 20);
    // removing draggable effect from images
    this.d.wrapper.querySelectorAll('img').forEach(image => image.addEventListener('dragstart', (e) => e.preventDefault()))
    this.d.wrapper.querySelectorAll('a').forEach(image => image.addEventListener('dragstart', (e) => e.preventDefault()))
  }

  setupSlider() {
    this.d.slider.style.overflow = this.c.overflow
    this.d.slider.style.position = 'relative'
    this.d.slider.style.touchAction = this.c.direction === 'row' ? 'pan-y' : 'pan-x'
    this.d.slider.addEventListener('pointerdown', this.pointerDown.bind(this))
    this.d.slider.addEventListener('pointerup', this.pointerUp.bind(this))
    this.d.slider.addEventListener('pointercancel', this.pointerUp.bind(this))
    this.d.slider.addEventListener('pointermove', this.pointerMove.bind(this))
    this.d.slider.addEventListener('mousedown', this.mouseDown.bind(this))
  }

  setupPosition(animation = true) {

    switch (this.c.align) {
      case 'index':
        this.d.wrapper.style.transform = `${this.v.translateProp}(-${this.w[this.c.active]}px)`
        this.c.translate = this.w[this.c.active]
        break
      case 'position':
        this.d.wrapper.style.transform = `${this.v.translateProp}(${-1 * this.c.translate}px)`
        break
      case 'end':
        this.c.translate = this.w[this.d.slides.length] + this.w['l'] - this.w['w']
        this.d.wrapper.style.transform = `${this.v.translateProp}(-${this.c.translate}px)`
        break
    }
    if (this.c.active != this.c.lastActive) {
      this.getSlideByID(this.c.lastActive).classList.remove('jas-active')
      this.getSlideByID(this.c.active).classList.add('jas-active')
      this.c.lastActive = this.c.active
    }
  }

  normalizeIndex() {
    if (this.toShow <= this.d.slides.length) {
      this.c.active = 1
    } else
      if (!this.c.loop) {
        if (this.c.active < 1) {
          this.c.active = 1
        } else if (this.c.active >= this.d.slides.length - Math.floor(this.c.toShow) + 1) {
          this.c.active = this.d.slides.length - Math.floor(this.c.toShow) + 1
          if (this.c.toShow != Math.floor(this.c.toShow)) this.c.align = 'end'
        }
      } else {
        if (this.c.active < 1) { this.c.active = this.d.slides.length + this.c.active } else
          if (this.c.active > this.d.slides.length) { this.c.active = this.c.active - this.d.slides.length }
        this.c.prev = this.c.active - Math.floor(this.c.toScroll)
        if (this.c.prev < 1) this.c.prev = this.d.slides.length + this.c.prev
        this.c.next = this.c.active + Math.floor(this.c.toScroll)
        if (this.c.next > this.d.slides.length) this.c.next = this.c.next - this.d.slides.length
      }
    this.updateHandlers()
  }

  updateHandlers() {
    if (this.nav.prevEl || this.nav.nextEl) {
      if (!this.c.loop) {
        if (this.nav.prevEl) {
          if (this.c.active === 1) {
            this.nav.prevEl.classList.add(this.c.navigation.disableClass)
          } else this.nav.prevEl.classList.remove(this.c.navigation.disableClass)
        }
        if (this.nav.nextEl) {
          if (this.c.active >= this.d.slides.length - this.c.toShow + 1) {
            this.nav.nextEl.classList.add(this.c.navigation.disableClass)
          } else this.nav.nextEl.classList.remove(this.c.navigation.disableClass)
        }
      }
    }
  }

  pointerDown(e) {
    if (e.target === this.nav.prevEl || e.target === this.nav.nextEl) return
    this.v.href = e.target.href
    this.c.align = 'position'
    this.d.slider.setPointerCapture(e.pointerId)
    this.v.startTouch = e[this.v.pointerProp]
    this.v.lastTranslate = this.c.translate
    this.v.isDragging = true
    this.v.animationID = requestAnimationFrame(this.animation.bind(this))
  }

  pointerUp(e) {
    if (!this.v.isDragging) return
    this.v.isDragging = false
    cancelAnimationFrame(this.v.animationID)
    this.d.slider.releasePointerCapture(e.pointerId)
    let delta = (this.c.translate - this.v.lastTranslate)
    if (Math.abs(delta) < 2 && this.v.mouseDown && this.v.href) {
      window.open(this.v.href, '_blank')
    }
    if (Math.abs(delta) < 150) {
      // this.c.translate = this.v.lastTranslate
      this.c.align = 'index'
      this.setupPosition()
    } else if (delta > 0) {
      this.nextElHandler()
    } else {
      this.prevElHandler()
    }
    this.v.href = null
    this.v.mouseDown = false
  }

  pointerMove(e) {
    if (this.v.isDragging) {
      if (this.v.startTouch < e[this.v.pointerProp] && !this.d.wrapper.querySelector('.jas-prev')) {
        this.c.align = 'index'
        this.setupPrevSlide()
        this.v.lastTranslate = this.c.translate
        this.c.align = 'position'

      } else if (this.v.startTouch > e[this.v.pointerProp] && !this.d.wrapper.querySelector('jas-next')) {
        this.c.align = 'index'
        this.setupNextSlide()
        this.v.lastTranslate = this.c.translate
        this.c.align = 'position'
      }
      if (Math.abs(this.c.translate - this.v.lastTranslate) > 160) this.pointerUp(e)
      this.c.translate = this.v.lastTranslate - e[this.v.pointerProp] + this.v.startTouch
    }
  }

  mouseDown() {
    this.v.mouseDown = true
  }

  animation() {
    this.setupPosition(false)
    if (this.v.isDragging) this.v.animationID = requestAnimationFrame(this.animation.bind(this))
  }

  setupNextSlide() {
    if (this.d.wrapper.querySelector('.jas-next')) return
    let ind = this.getRelativeIndex()
    if (ind + Math.ceil(this.c.toShow) - 1 + Math.floor(this.c.toScroll) > this.d.slides.length) this.moveSlides(this.d.slides.length - ind - Math.ceil(this.c.toShow) + 1 - Math.floor(this.c.toScroll))
    this.getSlideByID(this.c.next).classList.add('jas-next')

  }

  setupPrevSlide() {
    if (this.d.wrapper.querySelector('.jas-prev')) return
    let ind = this.getRelativeIndex()
    if (ind <= this.c.toScroll) this.moveSlides(this.c.toScroll - ind + 1)
    this.getSlideByID(this.c.prev).classList.add('jas-prev')
  }

  getRelativeIndex() {
    let ind = 0
    while (ind < this.d.slides.length) {
      if (this.d.slides.item(ind).classList.contains('jas-active')) return (ind + 1)
      ind++
    }
    return (-1)
  }

  moveSlides(ind) {
    this.d.wrapper.style.transition = ''
    if (ind === 0) return
    if (ind > 0) {
      while (ind > 0) {
        this.d.wrapper.lastElementChild.classList.remove('jas-next')
        this.d.wrapper.prepend(this.d.wrapper.lastElementChild)
        ind--
      }
    } else {
      while (ind < 0) {
        this.d.wrapper.firstElementChild.classList.remove('jas-prev')
        this.d.wrapper.append(this.d.wrapper.firstElementChild)
        ind++
      }
    }
    this.updateSlidesPosition()
    this.setupPosition(false)
    setTimeout(() => {
      this.d.wrapper.style.transition = `all ${this.c.speed} ease`
    }, 5);
  }
}
