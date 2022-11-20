from app import app, db
from flask import jsonify, request
from hashlib import sha256
import datetime
import jwt
import app.queries as queries


@app.route('/')
@app.route('/index')
def index():
    return 'Welcome to Flask!'

@app.route('/<name>')
def hello(name):
    return 'Welcome, {}'.format(name)

@app.route('/test')
def test():
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM course WHERE courseID LIKE %s LIMIT 3, 5;", params=('INT%',));
        records = cursor.fetchall()
        return jsonify(records)

@app.route('/current_semester')
def get_current_semester():
    return jsonify({
        'semesterCode': 211,
        'academicYear': '2021-2022',
        'semesterName': 'học kì 1 năm học 2021-2022'
    })

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if data['username'] and data['password'] is not None:
        username = data['username']
        hashed_pwd = sha256(data['password'].encode('utf8')).hexdigest()
        query = queries.ACCOUNT_INFO
        with db.cursor() as cursor:
            cursor.execute(query, (username, username, hashed_pwd))
            record = cursor.fetchone()

            if record is not None:
                token = encode_auth_token(record[0])
                info = {}
                cursor.reset()
                # Not admin
                if not record[1]:
                    info = get_student_info(cursor, record[0])
                else:
                    info = get_admin_info(cursor, record[0])

                if isinstance(token, TypeError):
                    return jsonify({'message': 'An error occured. Please try again.'}), 500
                return jsonify({
                    'token': token,
                    'email': record[0],
                    'info': info
                })
            return jsonify({'message': 'Username or password is incorrect.'}), 500
    return jsonify({'message': 'An error occured. Please try again.'}), 500

@app.route('/validate_token', methods=['POST'])
def validate_token():
    token = request.data
    return decode_auth_token(token)

@app.route('/sections')
def get_sections():
    params = ()
    query = queries.ALL_SECTIONS
    if 'major' in request.args:
        query = queries.ALL_SECTIONS_IN_MAJOR
        params = (request.args['major'],)
    with db.cursor() as cursor:
        cursor.execute(query, params)
        records = cursor.fetchall()
        result = [{
            cursor.column_names[i]:record[i]
            for i in range(len(record))
        } for record in records]
        return jsonify(result)

@app.route('/sections/enrolled')
def enrolled_sections():
    if 'studentID' not in request.args:
        return jsonify({'message': 'Please provide student ID as studentID param'}), 500
    return get_registered_sections(request.args['studentID'])

@app.route('/sections/enroll', methods=['POST'])
def enroll_in_sections():
    semester_code = 211
    academic_year = '2021-2022'
    data = request.json
    query = queries.ENROLL_SECTIONS
    # (stu_id, semester_code, sectionID, aca_year, group_no, course_id)
    stu_id = data['studentID']
    values = []
    for section in data['courses']:
        sectionID = int(section['classCode'].split(' ')[1])
        courseID = section['classCode'].split(' ')[0]
        group_no = 0
        if section['group'] != 'CL':
            group_no = int(section['group'])
        values.append((stu_id, semester_code, sectionID, academic_year, group_no, courseID))

    with db.cursor() as cursor:
        cursor.executemany(query, values)
        db.commit()
        return get_registered_sections(stu_id)

@app.route('/sections/unenroll', methods=['POST'])
def unenroll_sections():
    semester_code = 211
    academic_year = '2021-2022'
    data = request.json
    query = queries.UNENROLL_SECTIONS
    # (stu_id, semester_code, sectionID, aca_year, group_no, course_id)
    stu_id = data['studentID']
    values = []
    for section in data['courses']:
        sectionID = int(section['classCode'].split(' ')[1])
        courseID = section['classCode'].split(' ')[0]
        group_no = 0
        if section['group'] != 'CL':
            group_no = int(section['group'])
        values.append((stu_id, semester_code, sectionID, academic_year, group_no, courseID))

    with db.cursor() as cursor:
        cursor.executemany(query, values)
        db.commit()
        return get_registered_sections(stu_id)

def encode_auth_token(user_id):
    """
    Generates the Auth Token
    :return: string
    """
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1, seconds=5),
            'iat': datetime.datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            app.config.get('SECRET_KEY'),
            algorithm='HS256'
        )
    except Exception as e:
        print(e)
        return e

def decode_auth_token(auth_token):
    """
    Decodes the auth token
    :param auth_token:
    :return: integer|string
    """
    try:
        payload = jwt.decode(jwt=auth_token, key=app.config.get('SECRET_KEY'), algorithms=['HS256', ])
        return payload['sub']
    except jwt.ExpiredSignatureError:
        return 'Signature expired. Please log in again.'
    except jwt.InvalidTokenError:
        return 'Invalid token. Please log in again.'

def get_student_info(cursor, email):
    query = queries.STUDENT_INFO

    cursor.execute(query, (email,))
    record = cursor.fetchone()
    return {
        'id': record[0],
        'name': record[1],
        'majorID': record[2],
        'majorName': record[3]
    }

def get_admin_info(cursor, email):
    query = queries.ADMIN_INFO

    cursor.execute(query, (email,))
    record = cursor.fetchone()
    return {
        'id': record[0],
        'name': record[1],
    }

def get_registered_sections(studentID):
    query = queries.ENROLLED_SECTIONS
    with db.cursor() as cursor:
        cursor.execute(query, (studentID, ))
        records = cursor.fetchall()
        result = [{
            cursor.column_names[i]:record[i]
            for i in range(len(record))
        } for record in records]

        return jsonify({
            'totalCredits': sum(r['credits'] for r in result),
            'courses': result
        })