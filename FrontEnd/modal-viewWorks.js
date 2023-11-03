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
          throw new error('La supression du travail à echoué.');
        }
        e.target.closest('figure').remove();
        document.querySelector(`.gallery figure[data-id="${id}"]`).remove();
        alert('Le travail a été supprimé avec succès.');
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
  resetFormAddWork();
  modal.querySelector('.modal-viewWorks').style.display = 'flex';
  modal.querySelector('.modal-addWork').style.display = 'none';
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

//Ajout d'un EventListner sur le bouton d'ajout d'une photo
document
  .querySelector('.modal-viewWorks .buttonAddWork')
  ?.addEventListener('click', async (e) => {
    e.preventDefault();
    document.querySelector('.modal-viewWorks').style.display = 'none';
    document.querySelector('.modal-addWork').style.display = 'flex';

    //reinitialisation du formulaire
    resetFormAddWork();
    //Alimentation de la liste déroulante des catégories
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
    //Verifier les entrées du formulaire
    const imageInput = document.getElementById('image');
    const titleInput = document.getElementById('modal-photo-title');

    function checkForm() {
      if (
        titleInput.value !== '' &&
        selectCategory.value !== '' &&
        imageInput.value !== ''
      ) {
        submitButton.removeAttribute('disabled');
        submitButton.style.backgroundColor = '#1D6154';
        submitButton.style.cursor = 'pointer';
      } else {
        submitButton.style.backgroundColor = 'gray';
        submitButton.style.cursor = 'not-allowed';
        submitButton.setAttribute('disabled', 'true');
      }
    }

    titleInput.addEventListener('input', checkForm);
    selectCategory.addEventListener('change', checkForm);
    imageInput.addEventListener('change', checkForm);

    //Prévisualisation de l'image
    const iconeImage = document.querySelector('.form-addWork .image-form');
    const labelImage = document.querySelector('.form-addWork .image-label');
    const pImage = document.querySelector('.form-addWork .image-text');

    //Ajout d'un EventListner sur l'entrée (input) de type file
    imageInput.addEventListener('change', function (e) {
      e.preventDefault();
      const selectedImage = e.target.files[0];
      const previewImage = document.querySelector('.form-photo-div img');
      if (previewImage) {
        previewImage.remove();
      }

      const imgPreview = document.createElement('img');
      imgPreview.src = URL.createObjectURL(selectedImage);
      imgPreview.style.height = '192px';
      imgPreview.style.width = '176px';
      imgPreview.style.objectFit = 'cover';

      iconeImage.style.display = 'none';
      labelImage.style.display = 'none';
      pImage.style.display = 'none';
      document.querySelector('.form-photo-div').appendChild(imgPreview);
      document.querySelector('.form-photo-div').style.padding = '0 150px';
    });
  });

//Ajout d'un nouveau projet
const submitButton = document.querySelector('.form-addWork .buttonAddWork');
submitButton?.addEventListener('click', async (e) => {
  e.preventDefault();
  //Verifier si la taille d'image ne dépasse pas 4mo
  if (document.getElementById('image').files[0].size > 4 * 1024 * 1024) {
    alert("La taille de l'image ne doit pas dépasser 4 Mo.");
    return;
  }

  const formData = new FormData();
  formData.append('title', document.getElementById('modal-photo-title').value);
  formData.append('category', document.getElementById('modal-category').value);
  formData.append('image', document.getElementById('image').files[0]);

  await fetch('http://localhost:5678/api/works', {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then((response) => response.json())
    .then((work) => {
      addElementToGallery(work.id, work.imageUrl, work.title);
      //reiitialisation du formulaire
      resetFormAddWork();
      //message d'alerte
      alert('Le nouveau travail a été ajouté avec succès.');
      //fermeture de la modale
      modal.style.display = 'none';
    });

  //Ajout d'un EventListner pour revenir en arrière lors de l'ajout d'une photo
  document
    .querySelector('.modal-addWork .arrowButton')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      //reiitialisation du formulaire
      resetFormAddWork();
      //masquer la modale ajout d'image
      document.querySelector('.modal-addWork').style.display = 'none';
      document.querySelector('.modal-viewWorks').style.display = 'flex';
    });
});

const resetFormAddWork = () => {
  document.getElementById('modal-photo-title').value = '';
  document.getElementById('modal-category').value = '';
  document.getElementById('image').value = '';
  document.querySelector('.image-form').style.display = 'block';
  document.querySelector('.image-label').style.display = 'block';
  document.querySelector('.image-text').style.display = 'block';
  document.querySelector('.form-photo-div').style.padding = '30px 150px';
  const submitButton = document.querySelector('.form-addWork .buttonAddWork');
  submitButton.setAttribute('disabled', 'true');
  submitButton.style.backgroundColor = 'gray';
  submitButton.style.cursor = 'not-allowed';
  const previewImage = document.querySelector('.form-photo-div img');
  if (previewImage !== null) {
    previewImage.remove();
  }
};
