const focusableSelector = 'button';
let modal = null;
let focusables = [];
let previouslyFocusedElement = null;

const deleteFigureFromApi = async function (id) {
  debugger;
  await fetch(`http://localhost:5678/api/works/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  });
  // const responseJson = await response.json();
  // console.log(responseJson);
};
const addEventListnerToButtonTrash = async (e) => {
  e.preventDefault();
  const id = e.target.parentNode.getAttribute('data-id');
  const confirmation = confirm('Voulez vous supprimer ce projet ?');
  if (confirmation) {
    await deleteFigureFromApi(id);
    console.log('figure modal', e.target.closest('figure'));
    e.target.parentNode.remove();
    console.log(
      'figure gallery',
      document.querySelector(`.gallery figure[data-id="${id}"]`)
    );
    document.querySelector(`.gallery figure[data-id="${id}"]`).remove();
  }
};
function addElementToModal(modalGallery, id, imageUrl, title) {
  const figure = document.createElement('figure');
  figure.style.position = 'relative';
  figure.setAttribute('data-id', id);
  const img = document.createElement('img');
  const buttonTrash = document.createElement('button');
  buttonTrash.classList.add('material-symbols-outlined');
  buttonTrash.classList.add('trash');
  // buttonTrash.classList.add('data-id');
  // buttonTrash.setAttribute('data-id', id);
  buttonTrash.setAttribute('type', 'button');
  buttonTrash.textContent = 'delete';
  buttonTrash.style.cursor = 'pointer';

  img.src = imageUrl;
  img.alt = title;

  figure?.appendChild(img);
  figure?.appendChild(buttonTrash);
  modalGallery?.appendChild(figure);
}

const openModal = async function (e) {
  e.preventDefault();
  //chargement de la modale
  const target = this.getAttribute('href');
  modal = document.getElementById(target.split('#')[1]);

  // récup des projets via api
  const res = await fetch('http://localhost:5678/api/works');
  const works = await res.json();
  // Suppression si besoins puis chargement des projets au demarage de la modale
  const figures = modal.querySelectorAll('.modal-gallery figure');
  figures.forEach((figure) => {
    figure.remove();
  });
  const modalGallery = modal.querySelector('.modal-gallery');
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
  modal.querySelector('.crossButton').addEventListener('click', closeModal);
  modal
    .querySelector('.js-modal-stop')
    .addEventListener('click', stopPropagation);
  // Rajout d'un EventListener sur chaque bouton poubelle
  modal
    .querySelectorAll('.trash')
    .forEach((button) =>
      button.addEventListener('click', addEventListnerToButtonTrash)
    );

  // modal
  //   .querySelector('form .buttonAddWork')
  //   .addEventListener('click', callApiDeleteWork);
};

// const callApiDeleteWork = async (e) => {
//   e.preventDefault();
//   debugger;
//   if (confirm('Voulez vous supprimer ce projet ?')) {
//     const res = await fetch('http://localhost:5678/api/works/11', {
//       method: 'DELETE',
//       headers: {
//         ContentType: 'application/json',
//         Authorization: 'Bearer ' + localStorage.getItem('token'),
//       },
//     });
//     if (res.ok) {
//       alert('Projet 11 supprimé');
//     }
//   }
// };
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
  modal
    .querySelectorAll('.trash')
    .forEach((button) =>
      button.removeEventListener('click', addEventListnerToButtonTrash)
    );
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
