if (localStorage.getItem('token') && localStorage.getItem('token') !== '') {
  window.location.assign('./index.html');
} else {
  const button = document.querySelector('form button');
  const error = document.querySelector('.error');

  //Fonction d'ajout d'event listener sur les entrées pour controler le bouton
  setControlButton = (target, email, password) => {
    const customizeButton = (e) => {
      if (email.value !== '' && password.value !== '') {
        button.removeAttribute('disabled');
        button.style.backgroundColor = '#1d6154';
        button.style.cursor = 'pointer';
      } else {
        button.setAttribute('disabled', 'true');
        button.style.backgroundColor = '#b2b2b2';
        button.style.cursor = 'not-allowed';
      }
    };
    target.addEventListener('input', customizeButton);
  };

  const email = document.getElementById('email');
  const password = document.getElementById('password');
  setControlButton(email, email, password);
  setControlButton(password, email, password);

  button.addEventListener('click', (e) => {
    e.preventDefault();
    const login = async () => {
      const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      if (!response.ok || response.status === 401 || response.status === 404) {
        error.textContent = 'Utilisateur ou mot de passe incorrect';
        return;
      }

      const responseJson = await response.json();
      error.textContent = '';
      localStorage.setItem('token', responseJson.token);
      return window.location.assign('./index.html');
    };

    login().then();
  });
}
