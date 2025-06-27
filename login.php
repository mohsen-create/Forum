<?php
session_start();
$conn = new mysqli("localhost", "root", "", "secure_login");

$username = $_POST['username'];
$password = $_POST['password'];

$sql = $conn->prepare("SELECT * FROM users WHERE username=?");
$sql->bind_param("s", $username);
$sql->execute();
$result = $sql->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
  $_SESSION['user'] = $user['username'];
  header("Location: welcome.php");
} else {
  echo "<div class='container'><p class='error'>❌ Invalid username or password</p><a href='index.html'>Back to login</a></div>";
}
?>
