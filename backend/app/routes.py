from app import app, db
from flask import jsonify


@app.route('/')
@app.route('/index')
def index():
    return app.config['MYSQL_HOST']

@app.route('/test')
def test():
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM course WHERE courseID LIKE %s LIMIT 3, 5;", params=('INT%',));
        records = cursor.fetchall()
        return jsonify(records)
