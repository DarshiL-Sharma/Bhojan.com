from flask import Flask, render_template, request, url_for, redirect, flash, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String
from flask_login import UserMixin, login_user, LoginManager, login_required, current_user, logout_user
from flask_login import LoginManager
login_manager = LoginManager()

app = Flask(__name__, template_folder='templates')
app.config['SECRET_KEY'] = 'Secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///users.db'
db = SQLAlchemy()
db.init_app(app)


login_manager.init_app(app)
login_manager.login_view = 'about'


class User(UserMixin, db.Model):
    id: Mapped[int] = mapped_column(Integer(),primary_key = True)
    email: Mapped[str] = mapped_column(String(100),unique= True)
    password:Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(200))
login_manager.login_view = 'about'


class Order(db.Model):
    id = db.Column(db.Integer ,primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    customer_name = db.Column(db.String(100))
    spicy_level = db.Column(db.String(20))
    sweetness = db.Column(db.String(20))
    allergies = db.Column(db.String(200))
    special_note = db.Column(db.Text)




with app.app_context():
    db.create_all()


@app.route('/')
def about():
    try:
        return render_template('About.html')
    except Exception as e:
        return str(e)

@app.route('/register',methods = ["GET","POST"])
def register():
    if request.method == "POST":
        new_user = User(
            email=request.form.get('email'),
            name=request.form.get('name'),
            password=generate_password_hash(request.form.get('password'))
        )
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return redirect(url_for('preferences'))
    return render_template('About.html')

@app.route('/login',methods = ["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get('email')
        password = password = request.form.get('password')


        user  = db.session.execute(
            db.select(User).where(User.email==email)
        ).scalar()

        if not user:
            flash("Email does not Exist")
            return redirect(url_for('about'))

        elif not check_password_hash(user.password,password):
            flash("Incorrect Password")
            return redirect(url_for('about'))

        else:
            login_user(user)
            return redirect(url_for('preferences'))

    return render_template("About.html")

@app.route("/logout")
def logout():
    logout_user()
    return render_template('About.html')

@app.route('/Preferences',methods=["GET","POST"])
@login_required
def preferences():
    if request.method == "POST":
        new_order = Order(
            user_id=current_user.id,
            customer_name = request.form.get('Customer_name'),
            spicy_level = request.form.get('Spicy_Level'),
            sweetness =  request.form.get('Sweetness'),
            allergies = request.form.get('Allergies'),
            special_note = request.form.get('Customer_message')
        )
        db.session.add(new_order)
        db.session.commit()
        return redirect(url_for('home'))
    return render_template('Secrets.html')

@app.route('/Home')
@login_required
def home():
    return render_template('Home.html')


@login_manager.user_loader
def load_user(user_id):
    return db.get_or_404(User, user_id)

if __name__ == "__main__":
    app.run(debug=True)