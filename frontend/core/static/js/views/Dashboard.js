import AbstractView from "./AbstractView.js";
import Config from "../config.js"

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Đăng ký môn học");
    }

    async getHtml() {
        return `
        <div class="title">Đăng kí học ngành 1 - kì 1 năm học 2022 - 2023</div>
        <div class="select">
            <select id="courseType">
                <option value="1">Môn học theo ngành</option>
                <option value="2">Môn học toàn trường</option>
            </select>
        </div>

        <div class="wrapper">
            <table class="courses-list">
                <thead>
                    <th>Tên môn học</th>
                    <th>TC</th>
                    <th>Lớp môn học</th>
                    <th>Nhóm</th>
                    <th>Đã ĐK</th>
                    <th>Tối đa</th>
                    <th>Giảng viên</th>
                    <th>Lịch học</th>
                    <th>Thao tác</th>
                </thead>
                <tbody id="courses-list">
                    <!-- <tr><td></td></tr> -->
                </tbody>
            </table>
        </div>

        <div class="title">Các môn học đã đăng kí</div>
        <div class="wrapper">
            <table class="registered-courses-list">
                <thead>
                    <th>Tên môn học</th>
                    <th>TC</th>
                    <th>Lớp môn học</th>
                    <th>Nhóm</th>
                    <th>Giảng viên</th>
                    <th>Lịch học</th>
                    <th>Thao tác</th>
                </thead>
                <tbody id="registered-list">
                    <!-- <tr><td></td></tr> -->
                </tbody>
            </table>
        </div>
        <button class="registerBtn">Ghi nhận</button>
        `;
    }

    initialize() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login';
            return;
        }
        const profile = JSON.parse(localStorage.getItem('info'));
        let selectCourse = document.getElementById("courseType");
        selectCourse.addEventListener("change", e => {
            const value = selectCourse.value;
            if (value == 1) {
                fetch(`${Config.API_URL}/sections?major=${profile['majorID']}`)
                    .then(response => response.json())
                    .then(json => this.loadAllCoursesData(json));
            } else {
                fetch(`${Config.API_URL}/sections`)
                    .then(response => response.json())
                    .then(json => this.loadAllCoursesData(json));
            }
        });

        // fetch(`${Config.API_URL}/sections/enrolled?studentID=${profile['id']}`)
        //     .then(response => response.json())
        //     .then(json => this.loadRegisteredCoursesData(json));

        // fetch(`${Config.API_URL}/sections?major=${profile['majorID']}`)
        //     .then(response => response.json())
        //     .then(json => this.loadAllCoursesData(json));

        this.loadData().then(() => console.log('Loaded data'));
        
    }

    async loadData() {
        const profile = JSON.parse(localStorage.getItem('info'));
        const res1 = await fetch(`${Config.API_URL}/sections/enrolled?studentID=${profile['id']}`);
        const res2 = await fetch(`${Config.API_URL}/sections?major=${profile['majorID']}`);

        const json1 = await res1.json();
        const json2 = await res2.json();

        this.loadRegisteredCoursesData(json1);
        this.loadAllCoursesData(json2);
    }

    loadAllCoursesData(json) {
        let items = json;
        const table = document.getElementById("courses-list");
        const registeredTable = document.getElementById("registered-list");

        // Clear rows
        while (table.rows.length > 0) {
            table.deleteRow(0);
        }

        items.forEach((item, index) => {
            let row = table.insertRow();
            let i = 0;
            const props = [
                'courseName', 'credits', 'classCode', 'group', 'currentCapacity', 'maxCapacity',
                'instructor', 'time'
            ];

            for (const x of props) {
                let cell = row.insertCell(i);
                cell.innerHTML = item[x];
                if (x == 'currentCapacity' && item[x] >= item['maxCapacity']) {
                    cell.classList.add('full');
                }
                i = i + 1;
            }

            let registerCell = row.insertCell(i);
            registerCell.innerHTML = `<button class="registerBtn">Đăng kí</button>`;
            if (item['hasGroup'] > 0 && item['group'] == 'CL') {
                registerCell.innerHTML = `<button class="registerBtn" disabled>Đăng kí</button>`;
            } else {
                registerCell.addEventListener('click', e => {
                    const res = this.addRegisteredCourses(item);
                    if (res) {
                        let row = registeredTable.insertRow();
                        const props = ['courseName', 'credits', 'classCode', 'group', 'instructor', 'time'];
                        let j = 0;
                        for (const x of props) {
                            let cell = row.insertCell(j);
                            cell.innerHTML = item[x];
                            j += 1;
                        }
                        row.classList.add("newRow");
                        let deleteCell = row.insertCell(j);
                        deleteCell.innerHTML = `<button class="registerBtn">Hủy</button>`;
                        deleteCell.addEventListener('click', e => {
                            if (row.classList.contains("newRow"))
                                registeredTable.removeChild(row);
                            else
                                row.classList.add('deletedRow');
                            console.log(item);
                            this.removeRegisteredCourses(item);
                        });
                    }
                });
            }
        });
    }

    loadRegisteredCoursesData(json) {
        const registeredTable = document.getElementById("registered-list");
        localStorage.setItem('registered', JSON.stringify(json));
        json['courses'].forEach(item => {
            let row = registeredTable.insertRow();
            const props = ['courseName', 'credits', 'classCode', 'group', 'instructor', 'time'];
            let j = 0;
            for (const x of props) {
                let cell = row.insertCell(j);
                cell.innerHTML = item[x];
                j += 1;
            }
            
            let deleteCell = row.insertCell(j);
            deleteCell.innerHTML = `<button class="registerBtn">Hủy</button>`;
            deleteCell.addEventListener('click', e => {
                if (row.classList.contains("newRow"))
                    registeredTable.removeChild(row);
                else
                    row.classList.add('deletedRow');
                console.log(item);
                this.removeRegisteredCourses(item);
            });
        });
    }

    addRegisteredCourses(item) {
        const registered = JSON.parse(window.localStorage.getItem('registered'));
        const courses = registered['courses'];

        if (registered['totalCredits'] + item['credits'] > 30) {
            alert("Quá số tín chỉ được phép đăng kí!");
            return false;
        }

        if (courses.filter(x => x['classCode'].split(' ')[0] === item['classCode'].split(' ')[0]).length > 0) {
            alert("Môn học đã được đăng kí!");
            return false;
        }

        if (courses.filter(x => this.overlapTime(x, item)).length > 0) {
            alert("Môn học bị trùng lịch học!");
            return false;
        }

        courses.push(item);
        registered['totalCredits'] = registered['courses'].map(x => x['credits']).reduce((a, b) => a + b, 0);
        window.localStorage.setItem('registered', JSON.stringify(registered));
        return true;
    }

    removeRegisteredCourses(item) {
        const registered = JSON.parse(window.localStorage.getItem('registered'));
        registered['courses'] = registered['courses'].filter(x => !(x['classCode'] == item['classCode']));
        registered['totalCredits'] = registered['courses'].map(x => x['credits']).reduce((a, b) => a + b, 0);
        window.localStorage.setItem('registered', JSON.stringify(registered));
    }

    overlapTime(section1, section2) {
        const time1 = section1['time'].split('-');
        const time2 = section2['time'].split('-');

        const dayOfWeek1 = time1[0];
        const dayOfWeek2 = time2[0];

        if (dayOfWeek1 != dayOfWeek2)
            return false;
        
        const startTime1 = parseInt(time1[1].substring(1));
        const endTime1 = parseInt(time1[2].slice(0, -1));

        const startTime2 = parseInt(time2[1].substring(1));
        const endTime2 = parseInt(time2[2].slice(0, -1));

        return Math.max(startTime1, startTime2) <= Math.min(endTime1, endTime2);
    }
}