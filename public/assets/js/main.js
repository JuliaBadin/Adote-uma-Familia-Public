document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  /**
   * Sticky header on scroll
   */
  const selectHeader = document.querySelector('#header');
  if (selectHeader) {
    document.addEventListener('scroll', () => {
      window.scrollY > 100 ? selectHeader.classList.add('sticked') : selectHeader.classList.remove('sticked');
    });
  }


  document.querySelectorAll('.mobile-nav-toggle').forEach(el => {
    el.addEventListener('click', function(event) {
        event.preventDefault();
        toggleMobileNav();
    });
  });


  document.querySelectorAll('.scroll-top').forEach(el => {
    el.addEventListener('click', function(event) {
        event.preventDefault();
        scrollTop();
    });
  });

  // Função de ativação/desativação do botão de rolar para o topo
  const scrollTopButton = document.querySelector('.scroll-top');
  if (scrollTopButton) {
      const toggleScrollTopVisibility = function() {
          window.scrollY > 100 ? scrollTopButton.classList.add('active') : scrollTopButton.classList.remove('active');
      };
      window.addEventListener('scroll', toggleScrollTopVisibility);
      toggleScrollTopVisibility(); 
    }


  /**
   * Init swiper slider with 1 slide at once in desktop view
   */
  if (document.querySelector('.slides-animation')) {
    new Swiper('.slides-animation', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }
    });
  }

  /**
   * Animation on scroll function and init
   */
  function aos_init() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 600,
            easing: 'slide',
            once: true,
            mirror: false
        });
    } 
  }
  window.addEventListener('load', () => {
    aos_init();
  });

});


function toggleMobileNav() {
  const body = document.querySelector('body');
  const mobileNavShow = document.querySelector('.mobile-nav-show');
  const mobileNavHide = document.querySelector('.mobile-nav-hide');

  if (body) {
    body.classList.toggle('mobile-nav-active');
    if (mobileNavShow && mobileNavHide) {
        mobileNavShow.classList.toggle('d-none');
        mobileNavHide.classList.toggle('d-none');
    } else {
        console.error('Elementos mobile-nav-show e mobile-nav-hide não encontrados');
      }
  } else {
      console.error('Elemento body não encontrado');
  }
}


function scrollTop() {
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
}


function loginModal() { 
  document
      .getElementById("fundo-modal-login") 
      .classList
      .toggle("hide")
}

function cadastroDoadorModal() {
  document
    .getElementById("fundo-modal-cadastro-doador")
    .classList
    .toggle("hide")
}

function cadastroFamiliaModal() {
  document
    .getElementById("fundo-modal-cadastro-familia")
    .classList
    .toggle("hide")
}

function selecionarCadastroModal() {
  document
    .getElementById("fundo-modal-selecionar-cadastro")
    .classList
    .toggle("hide")
}

function redefinirSenhaModal() {
  document
      .getElementById("fundo-modal-redefinir-senha")
      .classList
      .toggle("hide")
}

function novaSenhaModal() {
  window.location.href = "../../index.html"
}

function ongModal() {
  document
      .getElementById("fundo-modal-contato-ong")
      .classList
      .toggle("hide")
}

function listaFamiliasModal() {
    document
        .querySelector(".fundo-modal-familias")
        .classList
        .toggle("hide")
  }