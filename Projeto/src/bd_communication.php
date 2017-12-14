<?php
/*
$servername = "localhost";
$username = "cimsp958_kama";
$password = "cebola15";
$dbname = "cimsp958_bd";

$servername = "localhost";
$username = "cimsp958_w";
$password = "Monkey@555";
$dbname = "cimsp958_bd";
*/

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

//$query = "CREATE TABLE tb_playlist (id VARCHAR(300), name VARCHAR(300), uri VARCHAR(500), song_limit INT, collaborations INT, max_collaborations INT, finished INT, id_owner VARCHAR(300), primary key (id))";


extract($_POST);

/*
    $id
    $name
    $id_owner
    $uri
    $song_limit
    $collaborations
    $max_collaborations
    $finished
*/

$query = "INSERT INTO tb_playlist(id, name, uri, song_limit, collaborations, max_collaborations, finished, id_owner) VALUES ('".$id."', '".$name."', '".$uri."', $song_limit, $collaborations, $max_collaborations, 0, '".$id_owner."')";

//echo $query;

if ($conn->query($query) === TRUE) {
    echo "Playlist cadastrada no banco";
}
else{
    echo "Erro ao cadastrar no banco: ".$conn->error;
}

echo $conn->host_info;

$conn->close();