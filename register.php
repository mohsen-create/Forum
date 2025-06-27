<?php
$conn = new mysqli("localhost", "root", "", "secure_login");

$username = $_POST['username'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$sql = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
$sql->bind_param("sss", $username, $email, $password);
if ($sql->execute()) {
  echo "<div class='container'><p class='success'>✅ Registration successful. <a href='index.html'>Log in now</a></p></div>";
} else {
  echo "<div class='container'><p class='error'>⚠️ Username or email already taken.</p><a href='register.html'>Try again</a></div>";
}
?>
