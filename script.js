// Create forum
function createForum() {
  const name = document.getElementById('forum-name').value.trim();
  const desc = document.getElementById('forum-description').value.trim();
  const user = localStorage.getItem("loggedInUser");
  if (!name || !desc) return alert("Fill in all fields.");
  const id = Date.now().toString();
  const forums = JSON.parse(localStorage.getItem("allForums") || "[]");
  forums.unshift({ id, name, desc, creator: user, created: new Date().toLocaleString(), comments: [] });
  localStorage.setItem("allForums", JSON.stringify(forums));
  displayForums(forums);
}

// Display forum list
function displayForums(forums = null) {
  const forumList = document.getElementById('forums');
  if (!forumList) return;
  if (!forums) forums = JSON.parse(localStorage.getItem("allForums") || "[]");
  forumList.innerHTML = '';
  forums.forEach(f => {
    const div = document.createElement('div');
    div.className = 'forum-box';
    div.innerHTML = `
      <h3>${f.name}</h3>
      <p>${f.desc}</p>
      <small>By ${f.creator} on ${f.created}</small><br>
      <button onclick="window.location.href='forum.html?id=${f.id}'">View</button>
    `;
    forumList.appendChild(div);
  });
}

// View specific forum
function loadForumPage() {
  const url = new URLSearchParams(window.location.search);
  const id = url.get('id');
  const forums = JSON.parse(localStorage.getItem("allForums") || "[]");
  const forum = forums.find(f => f.id === id);
  if (!forum) return document.body.innerHTML = "<h2>Forum not found.</h2>";
  document.getElementById('forum-title').innerText = forum.name;
  document.getElementById('forum-desc').innerText = forum.desc;
  renderComments(forum);
}

// Add comment to forum
function addComment() {
  const content = document.getElementById('comment-input').value.trim();
  const user = localStorage.getItem("loggedInUser");
  if (!content || !user) return alert("Empty comment or not logged in.");
  const id = new URLSearchParams(window.location.search).get('id');
  let forums = JSON.parse(localStorage.getItem("allForums") || "[]");
  const forumIndex = forums.findIndex(f => f.id === id);
  if (forumIndex === -1) return;
  const comment = { user, content, time: new Date().toLocaleString() };
  forums[forumIndex].comments.push(comment);
  localStorage.setItem("allForums", JSON.stringify(forums));
  document.getElementById('comment-input').value = "";
  renderComments(forums[forumIndex]);
}

// Render comments
function renderComments(forum) {
  const commentBox = document.getElementById('comment-section');
  commentBox.innerHTML = "";
  forum.comments.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<strong>${c.user}</strong> <em>${c.time}</em><br>${c.content}`;
    commentBox.appendChild(div);
  });
}

// Search forums
function searchForums() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const forums = JSON.parse(localStorage.getItem("allForums") || "[]");
  const filtered = forums.filter(f => f.name.toLowerCase().includes(query));
  displayForums(filtered);
}

// Init
window.onload = () => {
  if (document.getElementById("username")) {
    document.getElementById("username").innerText = localStorage.getItem("loggedInUser") || "Guest";
  }
  if (document.getElementById("forums")) displayForums();
  if (window.location.pathname.includes("forum.html")) loadForumPage();
};
