const filterBar = document.querySelector('.filterBar');
const allItemsOfFilterBar = document.querySelectorAll('.filterBar button');
const gallery = document.querySelector('.gallery');
// Fonction d'ajout d'elements dans le DOM
function addElement(imageUrl, title) {
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const figcaption = document.createElement('figcaption');

  img.src = imageUrl;
  img.alt = title;
  figcaption.textContent = title;

  figure?.appendChild(img);
  figure?.appendChild(figcaption);
  gallery?.appendChild(figure);
}

//Fonction d'ajout de la classe active sur l'element cliqué
function deleteClassActiveAndAddClassActive(filterItem) {
  // suppression de la classe active sur tous les items de la filterBar
  allItemsOfFilterBar.forEach((item) => {
    item?.classList.remove('active');
  });
  //ajout de la classe active sur l'element cliqué
  const element = document.querySelector(`.${filterItem}`);
  element?.classList.add('active');
}

//récup des projets par categ
const getWorksByCategory = (works, categoryId) => {
  const figures = document.querySelectorAll('.gallery figure');
  figures.forEach((figure) => {
    figure.remove();
  });
  if (categoryId === 'tous') {
    return works.forEach((work) => {
      addElement(work.imageUrl, work.title);
    });
  }
  const worksFiltered = works.filter(
    (work) => work.category.id === parseInt(categoryId)
  );
  return worksFiltered.forEach((work) => {
    addElement(work.imageUrl, work.title);
  });
};

//Ajout d'un écouteur d'événement sur les items de la filterBar
function addEventListenerToItems(works, filterItem) {
  const element = document.querySelector(`.${filterItem}`);
  element?.addEventListener('click', (e) => {
    deleteClassActiveAndAddClassActive(filterItem);
    return getWorksByCategory(works, e.target.getAttribute('data-id'));
  });
}

// récupération des données de l'API et affichage des projets selon la catégorie
const getWorks = async () => {
  const res = await fetch('http://localhost:5678/api/works');
  const works = await res.json();
  works.forEach((work) => {
    addElement(work.imageUrl, work.title);
  });
  deleteClassActiveAndAddClassActive('tous');

  //Appele de la fonction addEventListenerToItems pour chaque item de la filterBar
  addEventListenerToItems(works, 'tous');
  addEventListenerToItems(works, 'objets');
  addEventListenerToItems(works, 'appartements');
  addEventListenerToItems(works, 'hotels');
};

// Fonction Principale
function main() {
  getWorks().then();
  let token = null;
  let isTokenModified = false;

  //Ajout d'un EventListener sur l'element logout
  const logout = document.querySelector('.logout');
  logout?.addEventListener('click', (e) => {
    localStorage.removeItem('token');
    document.querySelector('.login').style.display = 'block';
    document.querySelector('.logout').style.display = 'none';
    document.querySelector('.modeEdition').style.display = 'none';
  });

  //Ajout d'un EventListener sur le DOM au chargement de la page
  window.addEventListener('DOMContentLoaded', () => {
    token = localStorage.getItem('token');
    if (token && token !== null && !isTokenModified) {
      document.querySelector('.login').style.display = 'none';
      document.querySelector('.logout').style.display = 'block';
      document.querySelector('.modeEdition').style.display = 'flex';
      document.querySelector('.modeEdition').classList.add('logged');
    }
  });

  //Ajout d'un eventListener sur le storage pour detecter les changements et supprimer le token si modification
  window.addEventListener('storage', () => {
    // console.log('storage changed');
    isTokenModified = token === localStorage.getItem('token') ? false : true;

    if (localStorage.getItem('token') === null || isTokenModified) {
      document.querySelector('.login').style.display = 'block';
      document.querySelector('.logout').style.display = 'none';
      document.querySelector('.modeEdition').style.display = 'none';
      localStorage.removeItem('token');
    }
  });
}

main();
