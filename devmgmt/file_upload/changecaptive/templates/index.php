<?php

include 'write_stat.php';

$server_name = "app";
$domain_name = "pinut.in";
$site_name = "Pinut WiFi Network";

// Path to the arp command on the local server
$arp = "/usr/sbin/arp";

// The following file is used to keep track of users
$users = "/var/lib/users";

// Check if we've been redirected by firewall to here.
// If so redirect to registration address

global $captive;
$captive = 0;

if ($_SERVER['SERVER_NAME']!="$server_name.$domain_name") {
    $ser = " ".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
    //print "$ser\n";
    if( (strpos($ser, "generate_204") == false) && (strpos($ser, "captive") == false)){
       // print "Not a Captive portal\n";
        header("location:https://$server_name.$domain_name/index.php?add=".urlencode($_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI']));
        //header("location:https://play.google.com/store/apps/details?id=com.nutlabs.pinut");
        exit;
    }
    else {
       // $captive = 1;
        header("location:http://$server_name.$domain_name/index.php");
    }
}


if (isset($_GET['download'])) {
            enable_address();
}


function enable_address() {

    global $mac;
    //print "called download 2";
    $mac = shell_exec("arp -a ".$_SERVER['REMOTE_ADDR']);
    preg_match('/..:..:..:..:..:../',$mac , $matches);
    @$mac = $matches[0];
   // print $mac;
    if (!isset($mac)) { exit; }
    $users = "/var/lib/users";

    if( strpos(file_get_contents($users),$mac) == false) {
      //  print "Mac $mac not Found";
        file_put_contents($users," $mac\t".date("d.m.Y")."\n",FILE_APPEND + LOCK_EX);
        // Add PC to the firewall
        exec("sudo iptables -I internet 1 -t nat -m mac --mac-source $mac -j RETURN");
        // The following line removes connection tracking for the PC
        // This clears any previous (incorrect) route info for the redirection
        exec("sudo rmtrack ".$_SERVER['REMOTE_ADDR']);
        write_stats(2);

        sleep(3);
        header("location:https://192.168.0.1/public/pinut_ed.apk");
        //header("location:https://play.google.com/store/apps/details?id=com.nutlabs.pinut");

        exit;
    }
    else {
        print "User Found, You are already registered with us";
        write_stats(2);
        header("location:https://192.168.0.1/public/pinut_ed.apk");
        //header("location:https://play.google.com/store/apps/details?id=com.nutlabs.pinut");
    }
}

?>

<!doctype html>
<html>
<script type="text/javascript">

function whichAndroidV() {
   // document.write("Inside whichAndroidV\n");
    var userAgent = navigator.userAgent.toLowerCase(); 
    var check = userAgent.match(/android\s([0-9\.]*)/);
    var captive_js;
    if ((!check) || (check[1] < "5.0")) {
        
        captive_js = 0;
       // document.write("captive_js false ="+captive_js);
    }
    else {
        captive_js = <?php echo $captive ?>;
     //   document.write("captive_js true ="+captive_js);
    }
    return captive_js;
}
</script>

<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pinut: Download App</title>
<link href='http://192.168.0.1/public/google-font' rel='stylesheet' type='text/css'>
<style type="text/css">
*{ margin:0; padding:0; outline: none;}
html{ font-size:14px;}
body{font-family: 'Lato', sans-serif; letter-spacing:1px; color:#333333;}
a{ text-decoration:none;}
li{ list-style: none;}
img{ border:0;}
.layout{margin:0 10%;}
.dpBlk{ display:block;}
.dptb{ display:table;}
.dptc{display: table-cell;}
.dpInblk{ display:inline-block; vertical-align: top;}
.text-center{ text-align:center;}
.clear{ clear:both; float:none;}
/*top section*/
.content-wrpr{ width:100%; background: #fff;}
.top-section{ background:url(http://192.168.0.1/public/images/header-bg1.jpg) no-repeat scroll center 25%;padding:50px 0 0 0; box-sizing:border-box;}
.top-section > .layout{ display: table;}
.left-side, .right-side{ min-width: 50%; display:table-cell; width: 50%;}
.left-side{ text-align:left; <color = #fff>color:#fff;}
.right-side{ text-align:right; position: relative;}
.logo{ padding-bottom: 5.714rem;}
.logo + h2{font-size: 3rem;}
.left-side p{padding: 1.429rem 0;font-size: 2.143rem;}
.left-side aside{ padding: 2.143rem 0; display:block;}
.left-side aside span{ display:inline-block; margin:0 0.357rem;}
.right-side div.dpInblk{ margin-bottom:-3px; position: absolute; right: 0; bottom: 0;}
.right-side div.dpInblk > img{ width:100%;}
/*bottom section*/
.btm-section{ width:100%; background: #f3f3f3; padding:5.714rem 0; box-sizing:border-box;}
.btm-section h2{ padding:0 0 1.429rem 0; font-size:1.786rem; }
.btm-section h2 + p{ font-size:1.286rem;}
.features{ padding:3.571rem 0 0 0;}
.features li{ display:block; float:left; vertical-align:top; margin-bottom: 10px; width: 24%; margin-right: 14px; background:#fff; padding:20px 15px; box-sizing:border-box; text-align:center; min-height: 263px; max-height: 285px; overflow: hidden; border-bottom: 2px solid #e52f3c;}
.features li h5{ font-size:1.143rem; font-weight: bold; padding-bottom: 2rem;}
.features figcaption{ font-size:14px; padding-top: 2rem;}
.features li:nth-child(4){ margin-right: 0px;}
footer{ width: 100%; text-align: center; background: #272727; padding:2.500rem 0;}
footer p{ display:inline-block; color:#fff;  border-top: 1px solid #1c1c1c; padding-top:10px;}
@media screen and (min-width: 320px) and (max-width: 490px) {   
html{ font-size:10px;}
.layout{ margin:0 3%;}
.top-section > .layout{ display: block;}        
.left-side, .right-side{ display:block; width: 100%; text-align:center;}
.right-side{ position: static;}
.right-side div.dpInblk{ position:static; width:70%;margin-bottom: -1px;}
.logo { padding-bottom: 3.714rem;}
.left-side aside { padding: 1rem 0 2rem; }
.features li { display:block; margin:0 0 1.429rem 0; width:100%;}
.btm-section h2{ font-size: 2.5rem;}
.btm-section h2 + p {font-size: 1.5rem;}
.features figcaption{ font-size:1.5rem;}
.features li h5{ font-size:2rem;}
footer p{ font-size:1.5rem;}
        }
@media screen and (min-width: 491px) and (max-width: 800px){    
html{ font-size: 12px;}
.layout{ margin:0 5%;}
.top-section > .layout{ display: block;}        
.left-side, .right-side{ display:block; width: 100%; text-align:center;}
.right-side{ position: static;}
.right-side div.dpInblk{ position:static; width:70%;}
.logo { padding-bottom: 3.714rem;}
.btm-section h2{ font-size: 2.5rem;}
.btm-section h2 + p {font-size: 1.5rem;}
.features li {margin:0 .9rem 1rem 0; width:48.6%; height:275px;}
.features li:nth-child(2n){ margin-right: 0px;} 
footer p{ font-size:1.2rem;}
        }
@media screen and (min-width: 601px) and (max-width: 800px){    
.features li h5{ font-size:2rem;}
.features li {width:49%;}
.features figcaption{ font-size:1.2rem;}
}
@media screen and (min-width: 801px) and (max-width: 1251px){   
html{ font-size: 13px;}
.features li {width:23.4%; height: 325px; max-height: 330px;}
.features figcaption{ font-size:1.2rem;}
.layout{ margin:0 7%;}
}       
@media screen and (min-width: 1252px) and (max-width: 1366px){
.features li {width:23.8%;}     
        }
</style>
</head>

<body>


<div class="content-wrpr">
<section class="top-section"> 
       <div class="layout">            
            <article class="left-side">
                <h1 class="dpBlk logo"><a href="http://www.pinut.in"><img src="public/images/Pinut_logo.png" alt="Pinut Logo"></a></h1>
                <!--EDIT BELOW HEADING-->
                <h2>Begin your Learning <br> Journey</h2>
<script type="text/javascript">
var cj = whichAndroidV();
if (cj) {
   // document.write("Hello All captive");
    document.write("<p>Welcome to the world of Free and Interactive Education.<br> Turn OFF your data connection (3G/4G) and open <b><u>app.pinut.in</u></b> on your browser, to activate.</p>");
}
else {
    //EDIT_BELOW_THIS_LINE document.write("Hi All NON-Captive");
    var text = "Ubaldo Jimenez";
    document.write(text);

                }
                </script>


            </article>
        </div>
    </section>

    <footer>
        <p>Copyright ©2016 NutLab Creations Pvt. Ltd. All Rights Reserved.</p>
    </footer>  
</div>    
</body>
</html>
