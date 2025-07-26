// SIGN UP
document.getElementById("signupForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("signupUser").value;
  const password = document.getElementById("signupPass").value;
  if (localStorage.getItem(username)) {
    alert("Username already exists.");
    return;
  }
  localStorage.setItem(username, password);
  alert("Account created! Please login.");
  window.location.href = "index.html";
});

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;
  const storedPass = localStorage.getItem(username);
  if (storedPass && storedPass === password) {
    localStorage.setItem('loggedIn', 'true');
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials.");
  }
});

// FORGOT PASSWORD
document.getElementById("forgotForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("forgotUser").value;
  const newPass = document.getElementById("newPass").value;
  if (localStorage.getItem(username)) {
    localStorage.setItem(username, newPass);
    alert("Password reset successful.");
    window.location.href = "index.html";
  } else {
    alert("Username does not exist.");
  }
});
