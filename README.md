# Overlay-Scrollbars
Fully interactive and dynamic overlay-scrollbars to beautify and replace default OS's scrollbars

## Integration steps
1. Download or clone js/overlay-scrollbar.js and add it as an external `<script>` to `<body>`
2. Container(s) must be positioned (relative, absolute, fixed) and have a max-height defined
3. Container(s) must include the attribute **data-overlay-container**
4. Must wrap the container(s)'s content inside a block level element and include the attribute data-overlay-content. Eg: `<div data-overlay-content>` 