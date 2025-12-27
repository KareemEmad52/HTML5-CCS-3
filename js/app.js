
var API_BASE = 'https://dummyjson.com/products';
document.addEventListener('DOMContentLoaded', () => {

  var menuBtn = document.querySelector('.menu-btn');
  var navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
  }

  var currentPath = window.location.pathname;
  var links = document.querySelectorAll('.nav-link');

  links.forEach((link) => {
    var linkPath = link.getAttribute('href');
    if (currentPath.includes(linkPath) && linkPath !== 'index.html') {
      link.classList.add('active');
    } else if (currentPath.endsWith('/') && linkPath === 'index.html') {
      link.classList.add('active');
    }
  });


  if (window.location.pathname.includes('products.html')) {
    initProductsPage();
  }
});



async function initProductsPage() {
  var productGrid = document.getElementById('product-grid');
  var categoryList = document.getElementById('category-list');
  var productCount = document.getElementById('product-count');
  var filterToggleBtn = document.getElementById('filter-toggle-btn');
  var filtersSidebar = document.getElementById('filters-sidebar');

  if (filterToggleBtn) {
    filterToggleBtn.addEventListener('click', () => {
      filtersSidebar.classList.toggle('show');

      if (filtersSidebar.classList.contains('show')) {
        filterToggleBtn.innerHTML = '<i class="ri-close-line"></i> Hide Filters';
      } else {
        filterToggleBtn.innerHTML = '<i class="ri-filter-3-line"></i> Show Filters';
      }
    });
  }

  try {
    await Promise.all([
      fetchCategories(categoryList),
      fetchProducts(API_BASE, productGrid, productCount)
    ]);
  } catch (error) {
    console.error('Error initializing page:', error);
    productGrid.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
  }
}

async function fetchCategories(listElement) {
  try {
    var response = await fetch('https://dummyjson.com/products/categories');
    var categories = await response.json();

    var relevantCategories = categories.filter((c) => {
      if (c.slug) {
        return ['smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration'].includes(c.slug);
      } else {
        return ['smartphones', 'laptops', 'fragrances', 'skincare', 'groceries', 'home-decoration'].includes(c);
      }
    });

    relevantCategories.forEach((cat) => {
      var catName;
      var catSlug;

      if (typeof cat === 'string') {
        catName = cat;
        catSlug = cat;
      } else {
        catName = cat.name;
        catSlug = cat.slug;
      }

      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.textContent = capitalize(catName);
      btn.id = 'cat-' + catSlug;

      btn.addEventListener('click', (e) => {
        var allBtns = document.querySelectorAll('.category-btn');
        allBtns.forEach(function (b) {
          b.classList.remove('active');
        });
        e.target.classList.add('active');

        var grid = document.getElementById('product-grid');
        var count = document.getElementById('product-count');
        var url;

        if (catSlug === 'all') {
          url = API_BASE;
        } else {
          url = API_BASE + '/category/' + catSlug;
        }

        fetchProducts(url, grid, count);

        if (window.innerWidth < 768) {
          document.getElementById('filters-sidebar').classList.remove('show');
        }
      });

      li.appendChild(btn);
      listElement.appendChild(li);
    });

    var allBtn = document.getElementById('all-products-btn');
    if (allBtn) {
      allBtn.addEventListener('click', (e) => {
        var allBtns = document.querySelectorAll('.category-btn');
        allBtns.forEach(function (b) {
          b.classList.remove('active');
        });

        e.target.classList.add('active');
        fetchProducts(API_BASE, document.getElementById('product-grid'), document.getElementById('product-count'));
      });
    }

  } catch (err) {
    console.warn('Failed to fetch categories', err);
  }
}

async function fetchProducts(url, gridElement, countElement) {
  gridElement.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    var response = await fetch(url);
    var data = await response.json();
    var products = data.products;

    countElement.textContent = products.length + ' Products Found';


    gridElement.innerHTML = '';

    products.forEach(function (product) {
      var card = createProductCard(product);
      gridElement.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    gridElement.innerHTML = '<p>Error loading products.</p>';
  }
}

function createProductCard(product) {
  var div = document.createElement('div');
  div.className = 'product-card';

  var html = '';
  html += '<div class="product-image">';
  html += '<img src="' + product.thumbnail + '" alt="' + product.title + '" loading="lazy">';
  html += '</div>';
  html += '<div class="product-info">';
  html += '<div class="product-cat">' + product.category + '</div>';
  html += '<h3 class="product-title" title="' + product.title + '">' + product.title + '</h3>';
  html += '<div class="product-price">$' + product.price + '</div>';
  html += '<button class="add-cart-btn" onclick="addToCart(\'' + product.id + '\')">';
  html += '<i class="ri-shopping-cart-2-line"></i> Add to Cart';
  html += '</button>';
  html += '</div>';

  div.innerHTML = html;
  return div;
}

function addToCart(id) {
  alert('Product added to cart!');
}

function capitalize(str) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, (l) => { return l.toUpperCase(); });
}
