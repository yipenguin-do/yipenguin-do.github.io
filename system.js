let currentDate = new Date();
let scheduleData = {};

// 今日の年月を基準に制限範囲を設定
const today = new Date();
const minDate = new Date(today.getFullYear() - 1, today.getMonth(), 1); // 1年前の1日
const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), 1); // 1年後の1日

function canNavigateTo(date) {
    const target = new Date(date.getFullYear(), date.getMonth(), 1);
    return target >= minDate && target <= maxDate;
}


document.addEventListener("DOMContentLoaded", () => {
    loadSchedule().then(() => {
        renderCalendar(currentDate);
        // 「前の月」ボタンの処理
        document.getElementById("prevMonth").addEventListener("click", () => {
            const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
            if (canNavigateTo(prev)) {
                currentDate = prev;
                renderCalendar(currentDate);
            } else {
                alert("1年前より前には移動できません");
            }
        });

        // 「次の月」ボタンの処理
        document.getElementById("nextMonth").addEventListener("click", () => {
            const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
            if (canNavigateTo(next)) {
                currentDate = next;
                renderCalendar(currentDate);
            } else {
                alert("1年後より先には移動できません");
            }
        });

    });
});

async function loadSchedule() {
    const res = await fetch("./dataBase.json");
    scheduleData = await res.json();
}

function renderCalendar(date) {
    const calenderMonth = document.querySelector('.calenderMonth');
    calenderMonth.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalCells = Math.ceil((firstDayOfWeek + lastDate) / 7) * 7;

    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const events = scheduleData[key] || {};

    document.getElementById("currentMonth").textContent = `${year}年${month + 1}月`;

    let week = document.createElement('nav');
    week.className = 'week';

    for (let i = 0; i < totalCells; i++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'calenderDay';

        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';

        const scheduleDiv = document.createElement('div');
        scheduleDiv.className = 'schedule';

        const dayNum = i - firstDayOfWeek + 1;
        let hasDate = false;

        if (i >= firstDayOfWeek && dayNum <= lastDate) {
            dayDiv.textContent = dayNum;
            hasDate = true;

            if (events[dayNum]) {
                events[dayNum].forEach(eventObj => {
                    const evDiv = document.createElement('div');
                    evDiv.className = 'scheduleExplain';

                    if (eventObj.url) {
                        const link = document.createElement('a');
                        link.href = eventObj.url;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        link.textContent = eventObj.title;
                        link.style.color = "inherit";
                        link.style.textDecoration = "none";
                        evDiv.appendChild(link);
                    } else {
                        evDiv.textContent = eventObj.title;
                    }

                    if (eventObj.color) {
                        evDiv.style.backgroundColor = eventObj.color;
                    }

                    scheduleDiv.appendChild(evDiv);
                });

            }
        }

        dayBox.appendChild(dayDiv);
        dayBox.appendChild(scheduleDiv);
        week.appendChild(dayBox);

        // 週の終わりで追加・リセット
        if ((i + 1) % 7 === 0) {
            const hasAnyDate = Array.from(week.children).some(day => {
                const text = day.querySelector('.day')?.textContent.trim();
                return text !== '';
            });

            if (hasAnyDate) {
                calenderMonth.appendChild(week);
            }
            week = document.createElement('nav');
            week.className = 'week';
        }
    }
}