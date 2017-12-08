# This app is a test for a potential website

This app is using flask microframework.  

## Prerequisites
* Python 3.5 or above   

Optional   
* Sass : Used to generate css files ([Installation](http://sass-lang.com/install)): not used yet
* pdflatex and convert : Used to generate png from tex files: deprecated
  * pdflatex :`$ brew cask install mactex` Warning: the space needed is >2GB)

## Set Up The Environment:  
1. get python (app developped with python 3.5)  
2. In the folder where you want to install the app run:  
```
python3 -m pip instal virtualenv
virtualenv -p python3 flasktest
cd flaskapp && . bin/activate
pip install Flask pygal
git clone https://github.com/sylvaus/flasktest app
```

3. start the app:
```
cd app
python routes.py
```   

## Update Equations (deprecated)
After changing the tex files, run the following commands in your app folder:
```
python python_utils/prepare_images.py
```

## TODO
* Add quaternion interpolation (lerp, nlerp, slerp, log_interpolation)
* Switch from canvasJs to chartJS
* Finish the Kalman filter section
* Fill all the other sections
