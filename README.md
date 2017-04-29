# This app is just a test for a potential website

For the moment, the app is using flask as microframework.
The css is comprised of:
    - sass folder containing the manual setup 
    - css folder containing the resulst of the preprocessed sass file(s)
    - bootstrap (3.3.7)for the nav-bar 
    - tether for bootstrap (1.3.3)
    - mathjax for the equations 
    
set up the environment:
    1. get python (app developped with python 3.5)
    2. In the folder where you want to install the app run:
'''
python3 -m pip instal virtualenv
virtualenv flasktest
cd flaskapp && . bin/activate
git clone https://github.com/sylvaus/flasktest 
'''
