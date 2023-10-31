const focusableSelector = 'button, input, select';
let modal = null;
let focusables = [];
let previouslyFocusedElement = null;

const deleteFigureFromApi = async (e) => {
  e.preventDefault();
  // debugger;
  const id = e.target.closest('figure').dataset.id;
  const confirmation = confirm('Voulez vous supprimer ce projet ?');
  if (confirmation) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5678/api/works/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new error('La supression du travai à echoué.');
        }
        e.target.closest('figure').remove();
        document.querySelector(`.gallery figure[data-id="${id}"]`).remove();
        document.querySelector('.modal-gallery figure[data-id="2"]').focus();
      })
      .catch((error) => console.error(error));
  }
};

function addFigureToModal(id, imageUrl, title) {
  const figure = document.createElement('figure');
  figure.style.position = 'relative';
  figure.setAttribute('data-id', id);
  const img = document.createElement('img');
  const buttonTrash = document.createElement('button');
  buttonTrash.classList.add('trash');
  buttonTrash.setAttribute('type', 'button');
  buttonTrash.style.cursor = 'pointer';
  const iFontAwesome = document.createElement('i');
  iFontAwesome.className = 'fa-solid fa-trash-can fa-lg';
  buttonTrash.appendChild(iFontAwesome);

  img.src = imageUrl;
  img.alt = title;

  figure?.appendChild(img);
  figure?.appendChild(buttonTrash);
  // Rajout d'un EventListener sur chaque bouton poubelle
  buttonTrash.addEventListener('click', deleteFigureFromApi);

  return figure;
}

const openModal = async function (e) {
  e.preventDefault();
  //chargement de la modale
  const target = this.getAttribute('href');
  modal = document.getElementById(target.split('#')[1]);

  // récup des projets via api
  const res = await fetch('http://localhost:5678/api/works');
  const works = await res.json();
  // Suppression puis chargement des projets au demarage de la modale
  const figures = modal.querySelectorAll('.modal-gallery figure');
  figures.forEach((figure) => {
    figure.remove();
  });
  const modalGallery = modal.querySelector('.modal-gallery');
  works.map((work) => {
    const figure = addFigureToModal(work.id, work.imageUrl, work.title);
    modalGallery?.appendChild(figure);
  });

  //gestion de l'element selectionné via le curseur
  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  previouslyFocusedElement = document.querySelector(':focus');
  modal.style.display = 'flex';
  focusables[0].focus();
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', 'true');
  modal.addEventListener('click', closeModal);
  modal
    .querySelectorAll('.crossButton')
    .forEach((crossButton) =>
      crossButton.addEventListener('click', closeModal)
    );
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
  modal
    .querySelectorAll('.crossButton')
    .forEach((crossButton) =>
      crossButton.removeEventListener('click', closeModal)
    );
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

document
  .querySelector('.modal-viewWorks .buttonAddWork')
  .addEventListener('click', async (e) => {
    e.preventDefault();
    document.querySelector('.modal-viewWorks').style.display = 'none';
    document.querySelector('.modal-addWork').style.display = 'flex';

    const selectCategory = document.getElementById('modal-category');
    if (Array.from(selectCategory).length === 1) {
      await fetch('http://localhost:5678/api/categories')
        .then((response) => response.json())
        .then((data) => {
          data.forEach((category) => {
            const categoryOption = document.createElement('option');
            categoryOption.setAttribute('value', category.id);
            categoryOption.textContent = category.name;

            selectCategory.appendChild(categoryOption);
          });
        });
    }
  });

document
  .querySelector('.modal-addWork .arrowButton')
  .addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.modal-addWork').style.display = 'none';
    document.querySelector('.modal-viewWorks').style.display = 'flex';
  });
