<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$first_name = $_POST['first-name'];
$last_name = $_POST['last-name'];
$company = $_POST['company'];
$email = $_POST['email'];
$country_code = $_POST['country'];
$phone_number = $_POST['phone-number'];
$message_text = $_POST['message'];

$conn = new mysqli('localhost', 'kc', '2DV327u!', 'forms');
if ($conn->connect_error) {
    die("Connection failed: " . htmlspecialchars($conn->connect_error));
}

$stmt = $conn->prepare("
    INSERT INTO submissions 
    (name, last_name, company, email, country_code, phone_number, message_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
    die("Prepare failed: (" . $conn->errno . ") " . htmlspecialchars($conn->error));
}

$stmt->bind_param(
    "sssssss",
    $first_name,
    $last_name,
    $company,
    $email,
    $country_code,
    $phone_number,
    $message_text
);

$stmt->execute();
$stmt->close();
$conn->close();

?>

<!---HTML--->


<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Form Results</title>
  <style>
        body {
            font-family: Arial, sans-serif;
            padding: 2rem;
            background-color: #f4f4f4;
        }

        form {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            margin: auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        label {
            display: block;
            margin-top: 15px;
            font-weight: bold;
        }

        input, textarea {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }

        button {
            margin-top: 20px;
            padding: 10px 20px;
            background: #007BFF;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
  <header>
    <h1>Form Results:</h1>
  </header>

  <section>
    <h2>You submitted the following information:</h2>
    <p>Name: <?php echo htmlspecialchars($first_name); ?></p>
    <p>Last Name: <?php echo htmlspecialchars($last_name); ?></p>
    <p>Company: <?php echo htmlspecialchars($company); ?></p>
    <p>Email: <?php echo htmlspecialchars($email); ?></p>
    <p>Phone: <?php echo htmlspecialchars($phone_number); ?></p>
    <p>Message: <?php echo nl2br(htmlspecialchars($message_text)); ?></p>
  </section>
</body>
</html>
