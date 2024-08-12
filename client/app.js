const socket = io();

document.getElementById('username-button').addEventListener('click', () => {
  const username = document.getElementById('username-input').value.trim();
  if (username) {
    localStorage.setItem('username', username);
    window.location.href = '/chat.html'; 
  } else {
    alert('Please enter a username');
  }
});
