from flask import Flask, render_template, request
from pid import pid_response_graph

######### CONSTANTS ###########

HOME_NB = 1
QUAT_NB = 2
CONTROL_NB = 5
ABOUT_NB = 3
CONTACT_NB = 4

###############################


app = Flask(__name__)


@app.context_processor
def active_page_processor():
    def get_active_page(active_page, page_number):
        if active_page == page_number:
            return "class=active"
        else:
            return ""
    return dict(get_active_page=get_active_page)

@app.route('/')
def home():
    return render_template('home.html', active_page=HOME_NB)


@app.route('/quaternion')
def quaternion():
    return render_template('quaternion.html', active_page=QUAT_NB, latex_notation=True)


@app.route('/pid', methods=['GET', 'POST'])
def pid():
    anchor = ""
    if request.method == "POST":
        P, I, D = list(map(float, [request.form["P"], request.form["I"], request.form["D"]]))
        mass, drag, gravity = list(map(float, [request.form["mass"], request.form["drag"], request.form["gravity"]]))
        anchor = "graph_anchor"
    else:
        P, I, D = [4, 0, 1]
        mass, drag, gravity = [4, 0.1, 0.0]

    return render_template('pid.html', active_page=CONTROL_NB, 
                           latex_notation=True, scroll=anchor,
                           graph_data = pid_response_graph(P, I, D, mass, drag, gravity),
                           P_input=P, I_input=I, D_input=D, 
                           mass_input=mass, drag_input=drag, gravity_input=gravity, )


@app.route('/lqr')
def lqr():
    return render_template('lqr.html', active_page=CONTROL_NB)


@app.route('/computedtorque')
def computedtorque():
    return render_template('computedtorque.html', active_page=CONTROL_NB)


@app.route('/kalman')
def kalman():
    return render_template('kalman.html', active_page=CONTROL_NB, latex_notation=True, plotly=True)


@app.route('/filters')
def filters():
    return render_template('filters.html', active_page=CONTROL_NB)


@app.route('/tustin')
def tustin():
    return render_template('tustin.html', active_page=CONTROL_NB)


@app.route('/about')
def about():
    return render_template('about.html', active_page=ABOUT_NB)


@app.route('/contact')
def contact():
    return render_template('contact.html', active_page=CONTACT_NB)


if __name__ == '__main__':
    app.run(debug=True)
