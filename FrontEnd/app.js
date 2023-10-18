const filterBar = document.querySelector('.filterBar');
const allItemsOfFilterBar = document.querySelectorAll('.filterBar li');
const gallery = document.querySelector('.gallery');

// Fonction d'ajout d'elements dans le DOM
function addElement(imageUrl, title) {
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const figcaption = document.createElement('figcaption');

  img.src = imageUrl;
  img.alt = title;
  figcaption.textContent = title;

  figure.appendChild(img);
  figure.appendChild(figcaption);
  gallery.appendChild(figure);
}

//Fonction d'ajout de la classe active sur l'element cliqué
function deleteClassActiveAndAddClassActive(filterItem) {
  // suppression de la classe active sur tous les items de la filterBar
  allItemsOfFilterBar.forEach((item) => {
    item.classList.remove('active');
  });
  //ajout de la classe active sur l'element cliqué
  const element = document.querySelector(`.${filterItem}`);
  element.classList.add('active');
}

//récup des projets par categ
const getWorksByCategory = (works, categoryId) => {
  const figures = document.querySelectorAll('figure');
  figures.forEach((figure) => {
    figure.remove();
  });
  if (categoryId === null) {
    return works.forEach((work) => {
      addElement(work.imageUrl, work.title);
    });
  }
  const worksFiltered = works.filter((work) => work.category.id === categoryId);
  return worksFiltered.forEach((work) => {
    addElement(work.imageUrl, work.title);
  });
};

// récupération des données de l'API et affichage des projets selon la catégorie
const getWorks = async () => {
  const works = await fetch('http://localhost:5678/api/works').then((res) =>
    res.json()
  );
  works.forEach((work) => {
    addElement(work.imageUrl, work.title);
  });
  deleteClassActiveAndAddClassActive('tous');

  //filterItem: tous
  const tous = document.querySelector('.tous');
  tous.addEventListener('click', () => {
    deleteClassActiveAndAddClassActive('tous');
    return getWorksByCategory(works, null);
  });

  //filterItem: categorie objets
  const objets = document.querySelector('.objets');
  objets.addEventListener('click', () => {
    deleteClassActiveAndAddClassActive('objets');
    return getWorksByCategory(works, 1);
  });

  //filterItem: categorie appartements
  const appartements = document.querySelector('.appartements');
  appartements.addEventListener('click', () => {
    deleteClassActiveAndAddClassActive('appartements');
    return getWorksByCategory(works, 2);
  });
  //filterItem: categorie hotels & restaurants
  const hotels = document.querySelector('.hotels');
  hotels.addEventListener('click', () => {
    deleteClassActiveAndAddClassActive('hotels');
    return getWorksByCategory(works, 3);
  });
};

// Fonction Principale
function main() {
  getWorks();
}

main();
