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
        fetch(`${Config.API_URL}/sections`)
            .then(response => response.json())
            .then(json => this.loadTableData(json));
    }

    loadTableData(json) {
        let items = json;
        const table = document.getElementById("courses-list");
        const registeredTable = document.getElementById("registered-list");

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
          registerCell.addEventListener('click', e => {
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
                registeredTable.removeChild(row);
            });
          });
        });
    }
}