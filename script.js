function login() {
  const user = document.getElementById("login-user").value;
  const pass = document.getElementById("login-pass").value;
  if (localStorage.getItem("user_" + user) === pass) {
    localStorage.setItem("loggedInUser", user);
    location.href = "dashboard.html";
  } else {
    alert("Invalid credentials.");
  }
}

function signup() {
  const user = document.getElementById("signup-user").value;
  const pass = document.getElementById("signup-pass").value;
  localStorage.setItem("user_" + user, pass);
  localStorage.setItem("loggedInUser", user);
  location.href = "dashboard.html";
}

function createGroup() {
  const name = document.getElementById("group-name").value.trim();
  if (!name) return;
  const groups = JSON.parse(localStorage.getItem("forumGroups") || "[]");
  const id = Date.now().toString();
  groups.push({ id, name });
  localStorage.setItem("forumGroups", JSON.stringify(groups));
  showGroups(groups);
}

function showGroups(groups = null) {
  const container = document.getElementById("group-list");
  if (!container) return;
  if (!groups) groups = JSON.parse(localStorage.getItem("forumGroups") || "[]");
  container.innerHTML = "";
  groups.forEach(g => {
    const div = document.createElement("div");
    div.className = "forum-box";
    div.innerHTML = `<h3>${g.name}</h3>
      <button onclick="location.href='group.html?id=${g.id}'">Enter</button>`;
    container.appendChild(div);
  });
}

function searchGroups() {
  const q = document.getElementById("search-groups").value.toLowerCase();
  const all = JSON.parse(localStorage.getItem("forumGroups") || "[]");
  const filtered = all.filter(g => g.name.toLowerCase().includes(q));
  showGroups(filtered);
}

function createThread() {
  const title = document.getElementById("thread-title").value;
  const content = document.getElementById("thread-content").value;
  const user = localStorage.getItem("loggedInUser");
  const groupId = new URLSearchParams(window.location.search).get("id");
  const threads = JSON.parse(localStorage.getItem("threads_" + groupId) || "[]");
  threads.push({ id: Date.now().toString(), title, content, user, replies: [] });
  localStorage.setItem("threads_" + groupId, JSON.stringify(threads));
  showThreads(threads);
}

function showThreads(threads = null) {
  const groupId = new URLSearchParams(window.location.search).get("id");
  const container = document.getElementById("thread-list");
  if (!container) return;
  if (!threads) threads = JSON.parse(localStorage.getItem("threads_" + groupId) || "[]");
  const group = JSON.parse(localStorage.getItem("forumGroups") || "[]").find(g => g.id === groupId);
  document.getElementById("group-title").innerText = group?.name || "Group";
  container.innerHTML = "";
  threads.forEach(t => {
    const div = document.createElement("div");
    div.className = "thread-box";
    div.innerHTML = `<h3>${t.title}</h3><p>${t.content}</p>
      <small>by ${t.user}</small><br>
      <button onclick="location.href='thread.html?group=${groupId}&thread=${t.id}'">View</button>`;
    container.appendChild(div);
  });
}

function loadThread() {
  const groupId = new URLSearchParams(window.location.search).get("group");
  const threadId = new URLSearchParams(window.location.search).get("thread");
  const threads = JSON.parse(localStorage.getItem("threads_" + groupId) || "[]");
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return;
  document.getElementById("thread-title").innerText = thread.title;
  document.getElementById("thread-content").innerText = thread.content;
  renderReplies(thread.replies);
}

function addReply() {
  const replyText = document.getElementById("reply-input").value;
  const user = localStorage.getItem("loggedInUser");
  const groupId = new URLSearchParams(window.location.search).get("group");
  const threadId = new URLSearchParams(window.location.search).get("thread");
  let threads = JSON.parse(localStorage.getItem("threads_" + groupId) || "[]");
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return;
  thread.replies.push({ user, text: replyText });
  localStorage.setItem("threads_" + groupId, JSON.stringify(threads));
  renderReplies(thread.replies);
  document.getElementById("reply-input").value = "";
}

function renderReplies(replies) {
  const container = document.getElementById("replies");
  container.innerHTML = "";
  replies.forEach(r => {
    const div = document.createElement("div");
    div.className = "reply-box";
    div.innerHTML = `<strong>${r.user}:</strong><br>${r.text}`;
    container.appendChild(div);
  });
}

window.onload = () => {
  if (location.pathname.includes("dashboard.html")) showGroups();
  if (location.pathname.includes("group.html")) showThreads();
  if (location.pathname.includes("thread.html")) loadThread();
};
