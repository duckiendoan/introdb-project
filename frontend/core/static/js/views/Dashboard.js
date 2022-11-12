import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard");
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
            <table class="">
                <thead>
                    <th>Tên môn học</th>
                    <th>TC</th>
                    <th>Lớp môn học</th>
                    <th>Giảng viên</th>
                    <th>Lịch học</th>
                    <th>Thao tác</th>
                </thead>
                <tbody id="registered-list">
                    <!-- <tr><td></td></tr> -->
                </tbody>
            </table>
        </div>
        `;
    }

    initialize() {
        fetch("/static/data.json")
            .then(response => response.json())
            .then(json => this.loadTableData(json));
    }

    loadTableData(json) {
        let items = json;
        const table = document.getElementById("courses-list");
        items.forEach(item => {
          let row = table.insertRow();
          let i = 0;
          for (const x in item) {
            let cell = row.insertCell(i);
            cell.innerHTML = item[x];
            if (x == 'currentCapacity' && item[x] >= item['maxCapacity']) {
              cell.classList.add('full');
            }
            i = i + 1;
          }
          let registerCell = row.insertCell(i);
          registerCell.innerHTML = `<a href="#1" class="register">Đăng kí</a>`
        });
    }
}