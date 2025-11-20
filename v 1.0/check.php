<?php
session_start();
$entered = $_POST['entercode'];
if($entered == "zenszen" || $entered == "ZENSZEN") {
    $_SESSION['who']='zgraja';
    header('Location: zgraja.php');
}
else if($entered == "guest378"){
    $_SESSION['who']='guest';
    header('Location: zgraja.php');
}
else if($entered == "admin039!"){
    $_SESSION['who']='ja';
    $_SESSION['zalogowany']=true;
    $_SESSION['username'] = 'Admin';
    header('Location: zgraja.php');
}
else {$_SESSSION['error_entered_code']="It's not the code..."; header('Location: index.php');}