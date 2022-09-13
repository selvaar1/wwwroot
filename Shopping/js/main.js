const menuToggle = document.querySelector('.hamburger');
const mainMenu = document.querySelector('.main-menu');
const scrollState = document.querySelector('.scrollable');
const hamburgerOpen = document.querySelector('.hamburger-open');
const hamburgerClose = document.querySelector('.hamburger-close');
const contentBox = document.querySelector('#content-box');

function toggleMenu() {
    scrollState.classList.toggle('disable-scroll');
    mainMenu.classList.toggle('main-menu--active');
    hamburgerOpen.classList.toggle('hamburger-open--active');
    hamburgerClose.classList.toggle('hamburger-close--active');
    contentBox.classList.toggle('content-cover--active');
}

menuToggle.addEventListener('click', toggleMenu);

const filterHeaderCategories = document.querySelector('#filter-header-categories');
const filterHeaderProducts  = document.querySelector('#filter-header-products');

function toggleCategoriesFilter() {
    document.querySelector('.product-categories').classList.toggle('product-categories--active');
}

if (filterHeaderCategories) {
    filterHeaderCategories.addEventListener('click', toggleCategoriesFilter);
}

function toggleProductsFilter() {
    document.querySelector('.filter-products-box').classList.toggle('filter-products-box--active');
}

if (filterHeaderProducts) {
    filterHeaderProducts.addEventListener('click', toggleProductsFilter);
}

