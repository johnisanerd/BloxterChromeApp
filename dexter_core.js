//
//
// This file contains all the javascript and global variables needed in almost every page
// Created : early May 2017
// Author: Ashley Terwilliger
//
//

var $PROJECT_NAME = "Bloxter";
var battery = 100;
var detected_robot = "";
var connected_robot = "";
var quick_check;
var workspace = null;
var $SCRIPT_ROOT = 'http://bloxter.com';

'use strict';

window.addEventListener("load", auto_detect, false);

function hide(){
  console.log("Connected to robot, show all options.")
  $("#container1").show();
  $("#container2").show();
  $("#container3").show();
  $("#container4").show();
  $("#container5").show();
  $("#container6").show();

  $("#container7").hide(); // Hides the You are Not Connected message.
  $("#container8").hide(); // Hides the You are Not Connected message.

};

function show(){
  console.log("Not connected to robot, show online options.")
  $("#container1").hide();
  $("#container2").hide();
  $("#container3").hide();
  $("#container4").hide();
  $("#container5").hide();
  $("#container6").hide();

  $("#container7").show(); // Hides the You are Not Connected message.
  $("#container8").show(); // Hides the You are Not Connected message.
};

function auto_detect() {
  console.log("robot detection")
  $.getJSON($SCRIPT_ROOT + '/_auto_detect', function( detected_robot_answer ) {
      detected_robot = detected_robot_answer.name;
      console.log("auto_detect/detected_robot: "+detected_robot_answer.name);
      connected_robot = detected_robot_answer.connected;
      console.log("auto_detect/connected_robot:"+detected_robot_answer.connected);
      console.log("Connected: "+connected_robot);
      if (typeof Blockly != 'undefined') {
        Blockly.GoPiGoVersion = detected_robot;
      };

      if (detected_robot != "GoPiGo") {
        $("#trimming").css("display","none");
      }

      if (connected_robot){
        check_batteries();
        // select_support('sdcard');
        // check battery status every 3 minutes
        // setInterval ( "check_batteries()", 3*60*1000 );
        setInterval ( "check_batteries()", 10*1000 );    // Check every 10 seconds because of averaging
        // auto_save();   // This makes sure that we always save the latest when we start
        hide();
      } else {
        console.log("No battery checking getting done")
        show();
      }
    });
}


function check_run_button() {
  // check status of running blockly program
  // if blockly program is done then return button to "Run Your Program"
  // this function is called at a rapid interval whenever a Blockly program
  // is run, but is not called outside of that

  $.getJSON( $SCRIPT_ROOT + '/_check_zombie',
  function( data ) {
    if (data.done) {
      // get rid of quick checks till next run
      console.log("clearing zombie checking")
      clearInterval(quick_check);
      // reactivate the Run your Program button
      if ($('#run-button').length) {
        // check if the run button exists
        // this check is probably no longer needed but let's leave it here for robustness
        var width= $('#run-button').width();
        $('#run-button').css('background-color', "#9ECD5C");
        $('#run-button')[0].innerHTML="Run Your Program";
        $('#run-button').width(width);
      };
    };
  });
};

// Function checks the battery level.  Changes the battery icon,
// and if Blockly is running and power is low throws a modal over it.
var battery_alert = false;
function check_batteries() {
  // console.log("check batteries");
  $.getJSON($SCRIPT_ROOT + '/_check_batteries',
    function( data ) {
      // console.log(data.battery_level)
      console.log("voltage: "+data.voltage)
      // battery_level = -2 when a Blockly program is being run
      // battery_level = -1 when we've issued the warning once and now keep quiet
      if (data.battery_level == null){
        return;
      }

      // choose which battery icon is appropriate
      if (data.battery_level <= 25) {
        battery_class = "fa-battery-quarter red";
      }
      else if (data.battery_level <= 50) {
        battery_class = "fa-battery-half";
        battery_alert = false
      }
      else if (data.battery_level <= 75) {
        battery_class = "fa-battery-three-quarters";
        battery_alert = false
      }
      else {
        battery_class = "fa-battery-full";
        battery_alert = false;
      }

      // display the battery icon
      // $("#battery-i").style.visibility="visible";
      $("#battery-i").removeClass();
      $("#battery-i").addClass(battery_class);
      $("#battery-i").addClass("fa");


     // Power Check Modal
     // We check here for the power level, if it's low, we throw the warning modal up.
      if (data.battery_level == 25 && battery_alert == false) {
        battery_alert = true;
        // load_power_modal();   // Code for this is in "blockly_full.html"
      }
    }
  )
};

// These two events listen for changes in connection
// This first even listens for changes going offline.
window.addEventListener("offline", function(e) {
    load_connection_modal();
  },
    false
  );

// This second event listens for changes going online.
window.addEventListener("online", function(e) {
    connectionmodalclose();
    },
      false
    );

// Pure JS:
// https://stackoverflow.com/questions/13591983/onclick-within-chrome-extension-not-working
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById("stop-i").addEventListener("click", stop_gopigo);
});

function stop_gopigo() {
  // attempting to use fast_pass_to_server first doesn't work
  fast_pass_to_server("gpg.stop()\n");
  document.getElementById("battery-i").style.visibility="visible";
  $.getJSON($SCRIPT_ROOT + '/emergencystop');
  var width= $('#run-button').width();
  console.log("clearInterval quick_check")
  clearInterval(quick_check);
  $('#run-button').css('background-color', "#9ECD5C");
  $('#run-button')[0].innerHTML="Run Your Program";
  $('#run-button').width(width);
}

function pass_to_server(code) {
  console.log(code)
  $.getJSON($SCRIPT_ROOT + '/execute', {to_run_code: code});
};

function fast_pass_to_server(code) {
  console.log(code)
  $.getJSON($SCRIPT_ROOT + '/execute/fast', {to_run_code: code});
  // Set focus to spacebar in case user goes from mouse to keyboard
  $('#spacebarstop').focus();
};


$( document ).ready(function() {
    auto_detect();
    $( "#versionid" ).load( $SCRIPT_ROOT + "/version" );					// Load the version number
    $( "#ssid_name" ).load( $SCRIPT_ROOT + "/ssid" );
    console.log( "ready!" );
});
