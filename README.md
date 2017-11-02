# This app is just a test for a potential website

For the moment, the app is using flask as microframework.  
The css is comprised of:  
- sass folder containing the manual setup   
- css folder containing the resulst of the preprocessed sass file(s)  
- bootstrap (3.3.7)for the nav-bar   
- tether for bootstrap (1.3.3)  

## Prerequisites
* Python 3.5 or above   

Optional   
* Sass : Used to generate css files ([Installation](http://sass-lang.com/install))
* pdflatex and convert : Used to generate png from tex files  
  * pdflatex :`$ brew cask install mactex` Warning: the space needed is >2GB)
  * convert : TODO

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

## Update Equations
After changing the tex files, run the following commands in your app folder:
```
python python_utils/prepare_images.py
```
