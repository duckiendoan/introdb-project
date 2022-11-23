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
        <div id="totalCredits" class="dashboardText">Tổng số tín chỉ: </div>
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
        <button id="submitBtn" class="registerBtn">Ghi nhận</button>
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
                    .then(json => this.loadAvailableCourses(json));
            } else {
                fetch(`${Config.API_URL}/sections`)
                    .then(response => response.json())
                    .then(json => this.loadAvailableCourses(json));
            }
        });

        this.loadCoursesData().then(() => console.log('Loaded data'));

        document.getElementById("submitBtn").addEventListener('click', async e => {
            await this.submitCourses();
            console.log("update courses");
        });

    }

    async loadCoursesData() {
        const profile = JSON.parse(localStorage.getItem('info'));
        const res1 = await fetch(`${Config.API_URL}/sections/enrolled?studentID=${profile['id']}`);
        const res2 = await fetch(`${Config.API_URL}/sections?major=${profile['majorID']}`);

        const json1 = await res1.json();
        const json2 = await res2.json();

        this.loadRegisteredCourses(json1);
        this.loadAvailableCourses(json2);
    }

    loadAvailableCourses(json) {
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
                    let mainItem = items.find(m => m['classCode'] === item['classCode'] && m['hasGroup'] > 0 && m['group'] == 'CL');
                    const res = this.tryEnrollCourse(item, mainItem);
                
                    if (res == 0) {
                        this.addRegisteredCourseRow(registeredTable, item);
                        if (mainItem)
                            this.addRegisteredCourseRow(registeredTable, mainItem);
                    } else {
                        this.showCourseEnrollmentResult(res);
                    }
                });
            }
        });
    }

    loadRegisteredCourses(json) {
        document.getElementById("totalCredits").innerHTML = `Tổng số tín chỉ: ${json['totalCredits']}`;
        const registeredTable = document.getElementById("registered-list");

        while (registeredTable.rows.length > 0) {
            registeredTable.deleteRow(0);
        }

        localStorage.setItem('registered', JSON.stringify(json));
        json['courses'].forEach(item => {
            this.addRegisteredCourseRow(registeredTable, item, false);
        });
    }

    tryEnrollCourse(item, mainSection) {
        let res = 0;
        const registered = JSON.parse(window.localStorage.getItem('registered'));
        const courses = registered['courses'].filter(x => x['status'] != 'removed');

        if (registered['totalCredits'] + item['credits'] > 30) {
            res = 1;
        }
        
        else if (courses.some(x => x['classCode'].split(' ')[0] === item['classCode'].split(' ')[0] && x['group'] === item['group'])) {
            res = 2;
        }

        else if (courses.some(x => this.overlappingTimeSlot(x, item))) {
            res = 3;
        }

        if (res == 0) {
            item['status'] = 'new';
            // const index = registered['courses'].findIndex(x => x['classCode'] == item['classCode'] && x['group'] == item['group']);
            // if (index != -1) {
            //     delete registered['courses'][index]['status'];
            // } else {
                
            // }
            registered['courses'].push(item);
            registered['totalCredits'] = registered['courses']
                                            .filter(y => y['status'] != 'removed' && y['group'] == 'CL')
                                            .map(x => x['credits'])
                                            .reduce((a, b) => a + b, 0);
            window.localStorage.setItem('registered', JSON.stringify(registered));

            if (item['hasGroup'] > 0 && item['group'] != 'CL' && mainSection) {
                res = this.tryEnrollCourse(mainSection);
            }

            if (res != 0) {
                this.unenrollCourse(item);
            }
        }

        // Success
        return res;
    }

    showCourseEnrollmentResult(code) {
        if (code == 1)
            alert("Quá số tín chỉ được phép đăng kí!");
        else if (code == 2)
            alert("Môn học đã được đăng kí!");
        else if (code == 3)
            alert("Môn học bị trùng lịch học!");
    }

    unenrollCourse(item) {
        const registered = JSON.parse(window.localStorage.getItem('registered'));
        if (item['status'] != 'new') {
            // Preserve the order of items
            const itemIndex = registered['courses'].findIndex(x => x['classCode'] === item['classCode'] && x['group'] === item['group']);
            console.log(registered['courses'][itemIndex]);
            registered['courses'][itemIndex]['status'] = 'removed';
        }
        else {
            registered['courses'] = registered['courses'].filter(x => !(x['classCode'] == item['classCode'] && x['status'] != 'removed' && x['group'] === item['group']));
        }
        
        registered['totalCredits'] = registered['courses']
                                        .filter(y => y['status'] != 'removed' && y['group'] == 'CL')
                                        .map(x => x['credits'])
                                        .reduce((a, b) => a + b, 0);
        
        window.localStorage.setItem('registered', JSON.stringify(registered));
    }

    addRegisteredCourseRow(registeredTable, item, newCourse = true) {
        let row = registeredTable.insertRow();
        
        const props = ['courseName', 'credits', 'classCode', 'group', 'instructor', 'time'];
        let j = 0;
        for (const x of props) {
            let cell = row.insertCell(j);
            cell.innerHTML = item[x];
            j += 1;
        }
        if (newCourse)
            row.classList.add("newRow");
        let deleteCell = row.insertCell(j);
        deleteCell.innerHTML = `<button class="registerBtn">Hủy</button>`;

        if (item['hasGroup'] > 0 && item['group'] == 'CL') {
            deleteCell.innerHTML = `<button class="registerBtn" disabled>Hủy</button>`;
            return;
        }

        // console.log(itemIndex);
        deleteCell.addEventListener('click', e => {
            let registeredCourses = JSON.parse(window.localStorage.getItem('registered'))['courses'];
            const itemIndex = registeredCourses.findIndex(x => x['classCode'] === item['classCode'] && x['group'] === item['group'] && x['status'] === item['status']);
            let mainItemRow = registeredTable.rows[itemIndex + 1];

            if (row.classList.contains("newRow"))
                registeredTable.removeChild(row);
            else
                row.classList.add('deletedRow');
            console.log(item);
            this.unenrollCourse(item);

            if (item['hasGroup'] > 0 && item['group'] != 'CL') {
                let mainItem = registeredCourses.find(m => m['classCode'] === item['classCode'] && m['hasGroup'] > 0 && m['group'] == 'CL' && m['status'] != 'removed');
                if (mainItem)
                    this.unenrollCourse(mainItem);
                if (mainItemRow.classList.contains("newRow")) {
                    registeredTable.removeChild(mainItemRow);
                }
                else {
                    mainItemRow.classList.add('deletedRow');
                }
                    
            }
        });
    }

    overlappingTimeSlot(section1, section2) {
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

    async submitCourses() {
        const registered = JSON.parse(window.localStorage.getItem('registered'));
        const removedCourses = registered['courses'].filter(x => x['status'] === 'removed');
        const newCourses = registered['courses'].filter(x => x['status'] === 'new');

        let result;

        // Remove courses
        if (removedCourses.length > 0) {
            const rawResponse = await fetch(`${Config.API_URL}/sections/unenroll`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentID: JSON.parse(localStorage.getItem('info'))['id'],
                    courses: removedCourses
                })
            });
            result = await rawResponse.json();
        }

        // Add courses
        if (newCourses.length > 0) {
            const rawResponse = await fetch(`${Config.API_URL}/sections/enroll`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentID: JSON.parse(localStorage.getItem('info'))['id'],
                    courses: newCourses
                })
            });
            result = await rawResponse.json();
        }


        if (result) {
            this.loadRegisteredCourses(result);
            alert(`Đăng kí thành công ${result['totalCredits']} tín chỉ!`);
        }
    }
}