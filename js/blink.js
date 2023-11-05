let utils = new Utils('errorMessage'); //use utils class

utils.loadOpenCv(() => {

    let video = document.getElementById("videoInput");

    // take param from the video input
    let height = video.height;
    let width = video.width;
    let window = {
        Width: 100,
        Height: 100,
        Origin: new cv.Point(width / 2 - 100 / 2, height / 2 - 100 / 2),
        Point2: new cv.Point(width / 2 + 100 / 2, height / 2 + 100 / 2),

    }
    let streaming = false;

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
            streaming = true;
        })
        .catch(function(err) {
            console.log("An error occurred! " + err);
            streaming = false;
        });

    let src = new cv.Mat(height, width, cv.CV_8UC4);
    let dst = new cv.Mat(height, width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let cap = new cv.VideoCapture(video);
    let faces = new cv.RectVector();
    let eyes = new cv.RectVector();

    let eyeClassifier = new cv.CascadeClassifier();  // initialize classifiers
    let faceClassifier = new cv.CascadeClassifier();

    let eyeCascadeFile = 'haarcascade_eye.xml'; // path to xml
    let faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml


    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {

        faceClassifier.load(faceCascadeFile);
        console.log("cascade loaded face")
        utils.createFileFromUrl(eyeCascadeFile, eyeCascadeFile, () => {

            eyeClassifier.load(eyeCascadeFile);
            console.log("cascade loaded eye")

            // schedule the first one.
            setTimeout(processVideo, 1000);
        });
    });

    const FPS = 60;
    function processVideo() {
        let filter_length = 5;
        let last_eye_size = [0];
        last_eye_size.length = filter_length;

        try {
            if (!streaming) {
                // clean and stop.
                src.delete();
                dst.delete();
                gray.delete();
                faces.delete();
                eyes.delete();
                classifier.delete();
                return;
            }
            let begin = Date.now();
            // start processing.
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            // detect faces.
            let windowImage = gray.roi(new cv.Rect(width / 2 - window.Width / 2, height / 2 - window.Height / 2, window.Width, window.Height))

            faceClassifier.detectMultiScale(windowImage, faces, 1.1, 3, 0);

            // draw faces.
            for (let i = 0; i < faces.size(); ++i) {
                let face = faces.get(i);
                let point1 = new cv.Point(window.Origin.x + face.x, window.Origin.y + face.y);
                let point2 = new cv.Point(window.Origin.x + face.x + face.width, window.Origin.y + face.y + face.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);

                //detect the eye inside the face box
                let faceBox = gray.roi(new cv.Rect(window.Origin.x + face.x, window.Origin.y + face.y, face.width, face.height));
                eyeClassifier.detectMultiScale(faceBox, eyes, 1.1, 1, 0);

                for (let i = 0; i < eyes.size(); ++i) {
                    let eye = eyes.get(i);
                    let point1 = new cv.Point(window.Origin.x + face.x + eye.x, window.Origin.y + face.y + eye.y);
                    let point2 = new cv.Point(window.Origin.x + face.x + eye.x + eye.width, window.Origin.y + face.y + eye.y + eye.height);
                    cv.rectangle(dst, point1, point2, [0, 255, 0, 255]);
                }
            }

            faces.size() ?
                (eyes.size() + last_eye_size.reduce((a, b) => a + b)) ?
                    console.log("Eyes are open")
                    :
                    //console.log("Eyes are closed") 
                    socket.send(JSON.stringify({ blink: 1 }))
                :
                console.log("No face detected")

            last_eye_size = [last_eye_size[0], eyes.size()];
            for (let i = 0; i < filter_length; i++) {

                last_eye_size[i] = ((i + 1) == filter_length) ? last_eye_size[i + 1] : eyes.size();
            }

            cv.rectangle(dst, window.Origin, window.Point2, [0, 0, 255, 255]);
            let _windowImage = new cv.Mat();
            let W_size = new cv.Size(80, 80);
            cv.resize(windowImage, _windowImage, W_size)

            cv.imshow('p_window', _windowImage)
            cv.imshow('canvasOutput', dst);
            // schedule the next one.
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        } catch (err) {
            console.log(err);
        }
    };


}
)
