<?php

$servername = "localhost";
$username = "root";
$password = "cebola15";
$dbname = "cimsp958_bd";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

//echo $query;

$sql = "SELECT * FROM tb_playlist";
$result = $conn->query($sql);

$playlists = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $playlists[$row["id"]] = $row;
    }
} else {

}

$playlists = json_encode($playlists, JSON_NUMERIC_CHECK);

echo $playlists;