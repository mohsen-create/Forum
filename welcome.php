<?php
session_start();
if (!isset($_SESSION['user'])) {
  header("Location: index.html");
  exit();
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>Welcome</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h2>Welcome, <?php echo $_SESSION['user']; ?> 👋</h2>
    <a href="logout.php">Log out</a>
  </div>
</body>
</html>
