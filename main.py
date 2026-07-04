from flask_socketio import SocketIO, emit, join_room   # add join_room
from flask import Flask, render_template, request, url_for, redirect, flash, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String
from flask_login import UserMixin, login_user, LoginManager, login_required, current_user, logout_user
from flask_login import LoginManager
from flask_socketio import SocketIO, emit
from datetime import datetime


# delivery Path (Static).
DELIVERY_PATH = [
    {"lat": 22.7196, "lng": 75.8577, "label": "Restaurant - MG Road"},
    {"lat": 22.7208, "lng": 75.8636, "label": "Rajwada Circle"},
    {"lat": 22.7245, "lng": 75.8709, "label": "Vijay Nagar"},
    {"lat": 22.7284, "lng": 75.8792, "label": "Near IPS Academy"},
    {"lat": 22.7320, "lng": 75.8850, "label": "Your Hostel"},
]
#----------------------------------------------------------------

login_manager = LoginManager()
app = Flask(__name__, template_folder='templates')
app.config['SECRET_KEY'] = 'Secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] ='sqlite:///users.db'
db = SQLAlchemy()
db.init_app(app)
socketio = SocketIO(app)
login_manager.init_app(app)
login_manager.login_view = 'about'

#----------------------------------------------------------------

# All DataBase is Created here and managed by the DB Browser on the Local System.

# Specific for the USER Information(Email,Password,Name).
class User(UserMixin, db.Model):
    id: Mapped[int] = mapped_column(Integer(),primary_key = True)
    email: Mapped[str] = mapped_column(String(100),unique= True)
    password:Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(200))
login_manager.login_view = 'about'

# Specific for the Order Information.
class Order(db.Model):
    id = db.Column(db.Integer ,primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    customer_name = db.Column(db.String(50))
    spicy_level = db.Column(db.String(20))
    sweetness = db.Column(db.String(20))
    allergies = db.Column(db.String(50))
    special_note = db.Column(db.String(50))
    address_type = db.Column(db.String(100))
    status = db.Column(db.String(20), default='Placed')
    delivery_stage = db.Column(db.Integer, default=0)

# Specific for the CHAT Messages.
class ChatMessage(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    username = db.Column(db.String(200))
    email = db.Column(db.String(100))
    message = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default = datetime.utcnow)

#----------------------------------------------------------------
with app.app_context():
    db.create_all()

# About section.
@app.route('/')
def about():
    try:
        return render_template('About.html')
    except Exception as e:
        return str(e)

#-----------------------------------------------------------

# Register section.
@app.route('/register',methods = ["GET","POST"])
def register():
    if request.method == "POST":
        new_user = User(
            # Warnings due to unexpected Arguments
            email=request.form.get('email'),
            name=request.form.get('name'),
            password=generate_password_hash(request.form.get('password'))
        )
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return redirect(url_for('preferences'))
    return render_template('About.html')
#------------------------------------------------------------

# Login section (Entry by the User is Managed here).
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
#---------------------------------------------------------------

# Logout (redirect to About page).
@app.route("/logout")
def logout():
    logout_user()
    return render_template('About.html')
#----------------------------------------------------------------

# Used to make the Taste Preference (All the Taste preferences by The USER is taken here).
@app.route('/Preferences',methods=["GET","POST"])
@login_required
def preferences():
    # check weather user is already registered.
    existing = Order.query.filter_by(user_id = current_user.id).first()
    if existing:
        return  redirect(url_for('home'))
    # if the user is not registered in taste Preferences.
    elif request.method == "POST":
        new_order = Order(
            user_id=current_user.id,
            customer_name = request.form.get('Customer_name'),
            spicy_level = request.form.get('Spicy_Level'),
            sweetness =  request.form.get('Sweetness'),
            allergies = request.form.get('Allergies'),
            special_note = request.form.get('Customer_message'),
            address_type = request.form.get('Address'),
        )
        db.session.add(new_order)
        db.session.commit()
        return redirect(url_for('home'))
    return render_template('Secrets.html')
#-------------------------------------------------------------------------

# Asking the mandate Information from User.
@app.route('/order', methods=['GET', 'POST'])
@login_required
def place_order():
    if request.method == "POST":
        new_order = Order(
            user_id=current_user.id,
            customer_name=request.form.get('Customer_name'),
            spicy_level=request.form.get('Spicy_Level'),
            sweetness=request.form.get('Sweetness'),
            allergies=request.form.get('Allergies'),
            special_note=request.form.get('Customer_message'),
            address_type=request.form.get('Address'),
            status='Placed',
            delivery_stage=0 # new user is on the delivery stage 0.
        )
        db.session.add(new_order)
        db.session.commit()
        return redirect(url_for('track_order', order_id=new_order.id))
    return render_template('order.html')
#--------------------------------------------------------------------------

# Home is the main page where the order's can be seen(With their status).
@app.route('/Home')
@login_required
def home():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.id.desc()).all()
    return render_template('Home.html', orders=orders)
#----------------------------------------------------------------------------

# It is the DashBoard for the  messages(LIVE) by the User.
@app.route('/dashboard')
@login_required
def dashboard():
    history = ChatMessage.query.order_by(ChatMessage.timestamp.asc()).all()
    return render_template('dashboard.html', history=history)
#----------------------------------------------------------------------------

# socketio uses to convey and save the message into local database.
@socketio.on('send_message')
def handle_send_message(data):
    msg = ChatMessage(
        username=current_user.name,
        email=current_user.email,
        message=data.get('message','')
    )
    db.session.add(msg)
    db.session.commit()
    # All the information will be saved in the database.
    emit('receive_message',{
        'username':msg.username,
        'email':msg.email,
        'message':msg.message,
        'timestamp':msg.timestamp.strftime('%H:%M:%S') # With the time stamp.
    },broadcast = True) # broadcast control the message to being share on the database(Means to The User Interface).
#----------------------------------------------------------------------------

# It is used to store ID in the Cookie so that load the user Whole Information at less time.
@login_manager.user_loader
def load_user(user_id):
    # If the user ID not found in the DataBase.
    return db.get_or_404(User, user_id) # return error 404.
#---------------------------------------------------------------------------

# Used to Manage the Order(Globally) and Manage the Status and redirect to Track the Order.
@app.route('/pay/<int:order_id>', methods=['POST'])
@login_required
def pay_order(order_id):
    order = Order.query.get_or_404(order_id)
    order.status = 'Paid'
    db.session.commit()
    # Used to redirect the Track.html where user can Track their order LIVE.
    return redirect(url_for('track_order', order_id=order.id))
#--------------------------------------------------------------------------

# Used as the Core logic of Static Order Tracking.
@app.route('/track/<int:order_id>')
@login_required
def track_order(order_id):
    order = Order.query.get_or_404(order_id)
    # render the track.html with the map and the advance control button(Used to update the delivery message).
    return render_template('track.html', order=order, path=DELIVERY_PATH)
#--------------------------------------------------------------------------

# Live tracking.
@socketio.on('join_tracking')
def handle_join_tracking(data):
    room = f"order_{data['order_id']}"
    join_room(room)
#--------------------------------------------------------------------------

# Used to Manage the delivery Notification on the User Interface.
@socketio.on('advance_delivery')
def handle_advance_delivery(data):
    order = Order.query.get(data['order_id'])
    if order and order.delivery_stage < len(DELIVERY_PATH) - 1:
        order.delivery_stage += 1
        if order.delivery_stage == len(DELIVERY_PATH) - 1:
            order.status = 'Delivered'
        else:
            order.status = 'Out for Delivery'
        db.session.commit()

        # can be seen live on the delivery Interface
        emit('delivery_update', {
            'stage': order.delivery_stage,
            'point': DELIVERY_PATH[order.delivery_stage],
            'status': order.status
        }, room=f"order_{order.id}")
#-------------------------------------------------------------------------------
# Used to run the WEB Application on the same Network(On different devices connected to same Internet).
if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)