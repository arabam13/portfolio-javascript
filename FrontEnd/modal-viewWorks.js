const focusableSelector = 'figure, button';
let modal = null;
let focusables = [];
let previouslyFocusedElement = null;

function addElementToModal(modalGallery, id, imageUrl, title) {
  const figure = document.createElement('figure');
  figure.style.position = 'relative';
  const img = document.createElement('img');
  const buttonGarbage = document.createElement('span');
  buttonGarbage.classList.add('material-symbols-outlined');
  buttonGarbage.classList.add('garbage');
  buttonGarbage.textContent = 'delete';
  buttonGarbage.style.cursor = 'pointer';
  // Rajout d'un EventListener sur le bouton supprimer
  buttonGarbage.addEventListener('click', async (e) => {
    e.preventDefault();
    if (globalThis.confirm('Voulez vous supprimer ce projet ?')) {
      try {
        e.preventDefault();
        const res = await fetch(`http://localhost:5678/api/works/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
          },
        });
      } catch (e) {
        console.error(e);
      }
    }
  });

  img.src = imageUrl;
  img.alt = title;

  figure?.appendChild(img);
  figure?.appendChild(buttonGarbage);
  modalGallery?.appendChild(figure);
}

const openModal = async function (e) {
  e.preventDefault();
  //chargement de la modale
  const target = this.getAttribute('href');
  modal = await loadModal(target);
  // récup des projets via api
  const res = await fetch('http://localhost:5678/api/works');
  const works = await res.json();
  // Suppression puis chargement des projets au demarage de la modale
  const figures = document.querySelectorAll('.modal-gallery figure');
  figures.forEach((figure) => {
    figure.remove();
  });
  const modalGallery = document.querySelector('.modal-gallery');
  works.map((work) =>
    addElementToModal(modalGallery, work.id, work.imageUrl, work.title)
  );

  //gestion de l'element selectionné via le curseur
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  previouslyFocusedElement = document.querySelector(':focus');
  modal.style.display = 'flex';
  focusables[0].focus();
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', 'true');
  modal.addEventListener('click', closeModal);
  const crossbutton = document.querySelector('.crossButton');
  crossbutton.addEventListener('click', closeModal);
  modal
    .querySelector('.js-modal-stop')
    .addEventListener('click', stopPropagation);
};

const closeModal = function (e) {
  if (modal === null) return;
  if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
  e.preventDefault();
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('aria-modal');
  modal.removeEventListener('click', closeModal);
  const crossbutton = document.querySelector('.crossButton');
  crossbutton.removeEventListener('click', closeModal);
  modal
    .querySelector('.js-modal-stop')
    .removeEventListener('click', stopPropagation);
  const hideModal = function () {
    modal.style.display = 'none';
    modal.removeEventListener('animationend', hideModal);
    modal = null;
  };
  modal.addEventListener('animationend', hideModal);
};

const stopPropagation = function (e) {
  e.stopPropagation();
};

const focusInModal = function (e) {
  e.preventDefault();
  let index = focusables.findIndex((f) => f === modal.querySelector(':focus'));
  if (e.shiftKey === true) {
    index--;
  } else {
    index++;
  }
  if (index >= focusables.length) {
    index = 0;
  }
  if (index < 0) {
    index = focusables.length - 1;
  }
  focusables[index].focus();
};

const loadModal = async function (url) {
  const target = '#' + url.split('#')[1];
  const exitingModal = document.querySelector(target);
  if (exitingModal !== null) return exitingModal;
  const html = await fetch(url).then((response) => response.text());
  const element = document
    .createRange()
    .createContextualFragment(html)
    .querySelector(target);
  // console.log(element);
  if (element === null)
    throw `L'élément ${target} n'a pas été trouvé dans la page ${url}`;
  document.body.append(element);
  return element;
};

document.querySelectorAll('.js-modal').forEach((a) => {
  a.addEventListener('click', openModal);
});

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeModal(e);
  }
  if (e.key === 'Tab' && modal !== null) {
    focusInModal(e);
  }
});
