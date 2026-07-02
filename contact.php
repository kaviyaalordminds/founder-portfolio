<?php
phpinfo();die;
var_dump(function_exists('pg_connect'));
// if(!function_exists('pg_connect')) die('PostgreSQL extension is not available.');
header('Content-Type: application/json');

// ---------- DB CONFIG ----------
$host     = "localhost";
$dbname   = "founder-portfolio";
$username = "postgres";
$password = "postgres";

// ---------- CONNECT (native pg_connect) ----------
$conn_string = "host=$host dbname=$dbname user=$username password=$password";
$conn = pg_connect($conn_string);

if (!$conn) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed."]);
    exit;
}

// ---------- ONLY POST ALLOWED ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    exit;
}

// ---------- COLLECT & SANITIZE ----------
function clean($str) {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

$name        = clean($_POST['name'] ?? '');
$email       = clean($_POST['email'] ?? '');
$phone       = clean($_POST['phone'] ?? '');
$inquiryType = clean($_POST['inquiryType'] ?? '');
$subject     = clean($_POST['subject'] ?? '');
$message     = clean($_POST['message'] ?? '');

// ---------- VALIDATION ----------
$errors = [];

if (empty($name)) {
    $errors[] = "Name is required.";
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Valid email is required.";
}

if (empty($inquiryType)) {
    $errors[] = "Inquiry type is required.";
}

if (empty($subject)) {
    $errors[] = "Subject is required.";
}

if (empty($message)) {
    $errors[] = "Message is required.";
}

// Optional phone validation (only if provided)
if (!empty($phone) && !preg_match('/^[0-9+\-\s()]{7,20}$/', $phone)) {
    $errors[] = "Invalid phone number.";
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => implode(" ", $errors)]);
    exit;
}

// ---------- INSERT INTO DB (parameterized, avoids SQL injection) ----------
$query = "INSERT INTO public.contact_submissions
            (name, email, phone, inquiry_type, subject, message, created_at)
          VALUES
            ($1, $2, $3, $4, $5, $6, NOW())";

$result = pg_query_params($conn, $query, [
    $name,
    $email,
    $phone,
    $inquiryType,
    $subject,
    $message
]);

if (!$result) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to save your message. Please try again."]);
    pg_close($conn);
    exit;
}

// ---------- OPTIONAL: SEND EMAIL NOTIFICATION ----------
$to = "kaviyaakavi27@gmail.com"; // change to actual recipient
$emailSubject = "New Contact Form Submission: $subject";
$emailBody = "You have received a new inquiry.\n\n"
           . "Name: $name\n"
           . "Email: $email\n"
           . "Phone: $phone\n"
           . "Inquiry Type: $inquiryType\n"
           . "Subject: $subject\n"
           . "Message:\n$message\n";

$headers = "From: kaviyaalordminds@gmail.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

@mail($to, $emailSubject, $emailBody, $headers);

// ---------- SUCCESS RESPONSE ----------
echo json_encode(["status" => "success", "message" => "Thank you! Your message has been sent successfully."]);

pg_close($conn);
exit;