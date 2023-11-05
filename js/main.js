function setupOverlay(canvas) {
    const ctx = canvas.getContext('2d');
    const recWidth = 300
    const recHeight = 200
    const xPos = (canvas.width / 2) - (recWidth / 2);
    const yPos = (canvas.height / 2) - (recHeight / 2);
    ctx.fillStyle = "rgba(0, 0, 200, 0.25)";
    ctx.fillRect(xPos, yPos, recWidth, recHeight);
    ctx.fillStyle = "rgba(200, 0, 0, 0.25)";
    ctx.fillRect(0, 0, xPos, canvas.height);
    ctx.fillStyle = "rgba(0, 200, 0, 0.25)";
    ctx.fillRect(xPos + recWidth, 0, canvas.width/2, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, yPos+recHeight, canvas.width, canvas.height/2);
    ctx.fillRect(0, 0, canvas.width, yPos);

    ctx.font = "15px monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = "rgba(50, 50, 50, 1)";
    ctx.fillText("LOOK UP", canvas.width/2, yPos/2);
    ctx.fillText("LOOK DOWN", canvas.width/2, yPos/2 + recHeight*2);
    ctx.fillText("LOOK LEFT", canvas.width/2-recWidth*2, canvas.height/2);
    ctx.fillText("LOOK RIGHT", canvas.width/2+recWidth*2, canvas.height/2);
    ctx.fillText("WALK", xPos + recWidth/2, yPos + recHeight/2);
}

window.onload = async function() {

    //start the webgazer tracker
    await webgazer.setRegression('ridge') /* currently must set regression and tracker */
        //.setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {
          //   console.log(data); /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
          //   console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
        })
        .saveDataAcrossSessions(true)
        .begin();
        webgazer.showVideoPreview(true) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

    //Set up the webgazer video feedback.
    var setup = function() {

        //Set up the main canvas. The main canvas is used to calibrate the webgazer.
        var canvas = document.getElementById("plotting_canvas");
        var overlay = document.getElementById("overlay");
        overlay.style.position = 'fixed';
        overlay.style.left = 0;
        overlay.style.top = 0;
        overlay.width = window.innerWidth;
        overlay.height = window.innerHeight;
        overlay.style.zIndex = 9000;
        setupOverlay(overlay);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
    };
    setup();

};

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function() {
    webgazer.end();
}

/**
 * Restart the calibration process by clearing the local storage and reseting the calibration point
 */
function Restart(){
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}
