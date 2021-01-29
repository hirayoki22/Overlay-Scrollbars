const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      width: auto;
      height: 100%;
      -webkit-transition: opacity .3s ease;     
      z-index: 20;
    }
    
    :host .track {
      width: auto;
      height: 100%;
      padding: 0 0.3rem;
      transition: opacity .3s ease;
      opacity: 0;
    }
    
    :host .thumb {
      display: block;
      position: relative;
      width: 10px;
      min-height: 1rem;
      margin: 0;
      padding: 0;
      height: auto;
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 15px;
      -webkit-transition: background-color .3s ease;
      transition: background-color .3s ease;
      outline: none;
    }
    
    :host .thumb:hover,
    :host .thumb:active, 
    :host .thumb[active] {
      background-color: rgba(140, 140, 140, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    
    :host .track[active] {
      opacity: 1;
    }
    
    :host .track:hover {
      opacity: 1;
    }
  </style>

  <div class="track">
    <button class="thumb" type="input" aria-label="Overlay scrollbar"></button>
  </div>`;

customElements.define('overlay-scrollbar', class extends HTMLElement {
  fadeOutInterval = null;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(template.content.cloneNode(true));

    this.track = this.shadowRoot.querySelector('.track');
    this.thumb = this.shadowRoot.querySelector('.thumb');
  }
  
  connectedCallback() {
    this.renderScrollbar();
    this.eventHandlers();
  }

  renderScrollbar() {
    this.thumb.style.height = `${this.scrollbarHeight}px`;
    this.track.hidden = this.contentHeight == this.contentScrollHeight;
  }

  visibilityState() {
    this.track.setAttribute('active', '');

    this.fadeOutInterval = setTimeout(() => {
      this.track.removeAttribute('active');
      this.thumb.removeAttribute('active');
    }, 100);
  }

  eventHandlers() {
    this.renderScrollbar = this.renderScrollbar.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.thumbMousedown = this.thumbMousedown.bind(this);
    this.trackMousedown = this.trackMousedown.bind(this);

    window.addEventListener('resize', this.renderScrollbar);
    this.content.addEventListener('scroll', this.onScroll);
    this.track.addEventListener('mousedown', this.trackMousedown);
    this.thumb.addEventListener('mousedown', this.thumbMousedown);
  }

  onScroll(e) {
    let scrollPosition = e.target.scrollTop;
    let posY = scrollPosition / this.scrollOffset * 100;

    this.thumb.style.transform = `translateY(${posY}px)`;
    
    clearInterval(this.fadeOutInterval);
    this.visibilityState();
  }

  thumbMousedown(e) {
    if (e.button == 2) return;

    let shiftY = e.clientY - (this.rect.top - this.parentTop);

    this.content.removeEventListener('scroll', this.onScroll);
    this.content.style.userSelect = 'none';
   
    const dragStart = e => {
      let posY = (e.clientY - shiftY < 0) 
        ? 0 
        : (e.clientY - shiftY) > this.contentHeight - this.rect.height
        ? this.contentHeight - this.rect.height
        : e.clientY - shiftY;
      
      this.thumb.style.transform = `translateY(${posY}px)`;
      this.content.scrollTop = posY * this.speed;

      clearInterval(this.fadeOutInterval);
      this.visibilityState();
    }

    const dragEnd = () => {
      this.content.addEventListener('scroll', this.onScroll);
      this.content.style.userSelect = 'auto';

      document.removeEventListener('mousemove', dragStart);
      document.removeEventListener('mouseup', dragEnd);
    }

    document.addEventListener('mousemove', dragStart);
    document.addEventListener('mouseup', dragEnd);
  }

  trackMousedown(e) {
    if (e.target.classList.contains('thumb') || e.button == 2) return;

    let shiftY = e.clientY - this.parentTop - this.rect.height / 2; 
    let posY = (shiftY < 0) 
      ? 0 
      : shiftY > this.contentHeight - this.rect.height
      ? this.contentHeight - this.rect.height
      : shiftY;

    this.thumb.style.transform = `translateY(${posY}px)`;
    this.content.scrollTop = posY * this.speed;
  }

  get content() {
    return this.nextElementSibling;
  }
  
  get contentHeight() {
    return this.content.clientHeight;
  }

  get contentScrollHeight() {
    return this.content.scrollHeight;
  }

  get HeightDiff() {
    return this.contentScrollHeight - this.contentHeight;
  }

  get scrollbarHeight() {
    return Math.round(this.contentHeight / this.contentScrollHeight 
      * this.contentHeight);
  }

  get parentTop() {
    return this.parentNode.getBoundingClientRect().top;
  }

  get rect() {
    return this.thumb.getBoundingClientRect();
  }

  get scrollOffset() {
    return this.HeightDiff / (this.contentHeight - this.rect.height) * 100;
  }

  get speed() {
    return (this.contentScrollHeight - this.contentHeight) / 
    (this.contentHeight - this.rect.height);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', () => this.renderScrollbar());
    this.content.removeEventListener('scroll', e => this.onScroll(e));
    this.track.removeEventListener('mousedown', this.trackMousedown);
    this.thumb.removeEventListener('mousedown', this.thumbMousedown);
  }
});

const init = (() => {
  let containers = document.querySelectorAll('[data-overlay-container]');
  let opComment = document.createComment('START - Overlay Scrollbar');
  let edComment = document.createComment('END - Overlay Scrollbar');
  let style = document.createElement('style');

  style.innerHTML = `
    [data-overlay-container] {
      overflow-y: hidden;
    }

    [data-overlay-content] {
      width: auto;
      height: 100%;
      overflow-y: auto !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }

    [data-overlay-content]::-webkit-scrollbar {
      display: none !important;
    }`;
  document.head.append(opComment, style, edComment);
  containers.forEach(container => {
    let scrollbar = document.createElement('overlay-scrollbar');
    container.prepend(scrollbar);
  });
})();

/**
 * 1. Container(s) must be positioned (relative, absolute, fixed)
 * 2. Container(s) must include the attribute data-overlay-container
 * 3. Must wrap the container(s)'s content inside a block level element
 * 4. Content wrapper must include the attribute data-overlay-content
 * 5. <script> must be placed inside <body>
 */