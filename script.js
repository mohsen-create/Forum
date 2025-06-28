function signup() {
  const user = document.getElementById('signup-user').value;
  const pass = document.getElementById('signup-pass').value;
  if (!user || !pass) return alert("Fill all fields");
  localStorage.setItem("user_" + user, pass);
  alert("Account created!");
  location.href = "index.html";
}

function login() {
  const user = document.getElementById('login-user').value;
  const pass = document.getElementById('login-pass').value;
  if (localStorage.getItem("user_" + user) === pass) {
    localStorage.setItem("loggedInUser", user);
    location.href = "dashboard.html";
  } else {
    alert("Invalid credentials");
  }
}

function getUser() {
  return localStorage.getItem("loggedInUser");
}

function createForum() {
  const name = document.getElementById('forum-name').value;
  const desc = document.getElementById('forum-description').value;
  const creator = getUser();
  if (!name || !desc || !creator) return alert("Missing fields");
  const forum = { name, desc, creator, time: new Date().toLocaleString() };
  const allForums = JSON.parse(localStorage.getItem("allForums") || "[]");
  allForums.unshift(forum);
  localStorage.setItem("allForums", JSON.stringify(allForums));
  displayForums();
}

function displayForums() {
  const forumList = document.getElementById('forums');
  if (!forumList) return;
  const allForums = JSON.parse(localStorage.getItem("allForums") || "[]");
  forumList.innerHTML = '';
  allForums.forEach(f => {
    const div = document.createElement('div');
    div.className = 'forum-box';
    div.innerHTML = `<h3>${f.name}</h3><p>${f.desc}</p><small>By ${f.creator} on ${f.time}</small>`;
    forumList.appendChild(div);
  });
}

window.onload = () => {
  if (document.getElementById('username')) {
    const user = getUser();
    document.getElementById('username').innerText = user || "Guest";
    displayForums();
  }
}
