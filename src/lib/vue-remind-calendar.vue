<template>
  <div class="bz-calendar" id="bzCalendar">
    <div class="bz-calendar-hd">
      <div class="previous-month" @click="previous">上月</div>
      <div class="current-month">{{currentYear}}年{{currentMonth}}月</div>
      <div class="next-month" @click="next">下月</div>
    </div>
    <div class="bz-calendar-bd">
      <div class="bz-calendar-weekday">
        <div class="bz-calendar-weekday-item">周日</div>
        <div class="bz-calendar-weekday-item">周一</div>
        <div class="bz-calendar-weekday-item">周二</div>
        <div class="bz-calendar-weekday-item">周三</div>
        <div class="bz-calendar-weekday-item">周四</div>
        <div class="bz-calendar-weekday-item">周五</div>
        <div class="bz-calendar-weekday-item">周六</div>
      </div>
      <div class="bz-calendar-month">
        <div class="bz-calendar-day" v-for="item,index in dateList"
             :class="{'invalid':item.invalid, 'today':item.today, 'active': item.date === remindInfo.date}"
             @click="changeDay(item,index)" :data-date="item.date">
          <p class="day" v-if="!item.invalid">{{item.date | calendar}}</p>
          <p class="remind-title" v-if="item.has_remind">{{item.remind_title}}</p>
        </div>
      </div>
    </div>
    <div class="bz-calendar-ft" v-if="remindIndex!==-1">
      <div class="remark-btn">
        <div class="btn btn-add" v-if="!remindInfo.has_remind" @click="openSetting(false)">新增备忘录</div>
        <div class="btn btn-edit" v-if="remindInfo.has_remind&&!remindInfo.expired" @click="openSetting(true)">编辑</div>
      </div>
      <div class="remark-content" v-if="remindInfo.has_remind">{{remindInfo.remind_content}}</div>
    </div>
    <div class="bz-calendar-modal" v-if="isSetting">
      <div class="bz-calendar-modal-box">
        <div class="bz-modal-hd">备忘录<span class="close" @click="closeSetting">&times;</span></div>
        <div class="bz-modal-bd">
          <div class="item">
            <div class="item-name">标题</div>
            <div class="item-content"><input type="text" placeholder="备忘标题" v-model="tempData.remind_title"/></div>
          </div>
          <div class="item">
            <div class="item-name">内容</div>
            <div class="item-content"><textarea name="" id="" cols="30" rows="5" placeholder="备忘内容"
                                                v-model="tempData.remind_content"></textarea></div>
          </div>
        </div>
        <div class="bz-modal-ft">
          <div class="btn btn-save" @click="saveSetting" v-if="isEdit">保存</div>
          <div class="btn btn-add" @click="addRemind" v-else>新增</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import dayjs from "dayjs";

  export default {
    name: 'vue-remind-calendar',
    data: () => {
      return {
        dateList: [],
        currentMonth: dayjs().month() + 1,
        currentYear: dayjs().year(),
        begin: dayjs().startOf('month').format('YYYY-MM-DD'),
        end: dayjs().endOf('month').format('YYYY-MM-DD'),
        isSetting: false,
        remindInfo: {},
        remindIndex: 0,
        tempData: {},
        isEdit: false
      }
    },
    created() {
      this.showMonth();
      this.remindInfo = this.dateList.find(item => item.today === true);
      this.remindIndex = this.dateList.findIndex(item => item.today === true);
    },
    filters: {
      'calendar'(value) {
        return (new Date(value).getDate())
      }
    },
    watch: {},
    computed: {
      "RoomMonth"() {
        return [this.currentYear, this.currentMonth].join('');
      }
    },
    methods: {
      // 渲染月份信息
      showMonth(year = this.currentYear, month = this.currentMonth - 1) {
        let currentMonth = dayjs().set('year', year).set('month', month);
        let days = currentMonth.daysInMonth();
        let beginWeekday = currentMonth.startOf('month').day();
        let endWeekday = currentMonth.endOf('month').day();
        let arr = [];

        for (let i = 1; i <= days; i++) {
          let date = currentMonth.set('date', i).startOf('day');
          let today = dayjs().startOf('day');
          if (date.isBefore(today)) {
            arr.push({
              date: date.format('YYYY-MM-DD'),
              expired: true
            });
          } else if (date.isSame(today)) {
            arr.push({
              date: date.format('YYYY-MM-DD'),
              today: true
            });
          } else {
            arr.push({
              date: date.format('YYYY-MM-DD')
            });
          }
        }
        if (beginWeekday) {
          this.addInvalid(arr, (beginWeekday - 1), 'before');
        }
        if (endWeekday < 6) {
          this.addInvalid(arr, (5 - endWeekday), 'after');
        }
        this.dateList = arr;
        this.getList();
      },
      // 请求日历数据
      getList() {
        let arr = [
          {
            date: dayjs().format('YYYY-MM-DD'),
            remind_title: "今天标题",
            remind_content: "今天备忘内容今天备忘内容今天备忘内容",
            has_remind: true
          },
          {date: dayjs().add(1, "day").format('YYYY-MM-DD')},
          {date: dayjs().add(2, "day").format('YYYY-MM-DD')},
          {date: dayjs().add(3, "day").format('YYYY-MM-DD')},
        ];
        this.dateList = this.concatList(this.dateList, arr);
      },
      // 将获取到的数据填充到日历相应日期中
      concatList(arr, data) {
        let result = arr.map(item => {
          let dt = data.find(({date}) => date === item.date);
          if (dt) {
            item = Object.assign({}, item, dt);
          }
          return item;
        });
        return result;
      },
      // 添加月初月末空白日期
      addInvalid(arr, num, pos) {
        switch (pos) {
          case 'before':
            for (let i = 0; i <= num; i++) {
              arr.unshift({
                invalid: true
              });
            }
            break;
          case 'after':
            for (let i = 0; i <= num; i++) {
              arr.push({
                invalid: true
              });
            }
        }
      },
      // 上个月
      previous() {
        let previous = dayjs(dayjs().set('month', this.currentMonth - 1)).subtract(1, 'month');
        this.begin = previous.startOf('month').format('YYYY-MM-DD');
        this.end = previous.endOf('month').format('YYYY-MM-DD');
        this.currentYear = previous.year();
        this.currentMonth = previous.month() + 1;
        this.remindIndex = -1;
        this.remindInfo.date = "";
        this.showMonth();
      },
      // 下个月
      next() {
        let next = dayjs(dayjs().set('month', this.currentMonth - 1)).add(1, 'month');
        this.begin = next.startOf('month').format('YYYY-MM-DD');
        this.end = next.endOf('month').format('YYYY-MM-DD');
        this.currentYear = next.year();
        this.currentMonth = next.month() + 1;
        this.remindIndex = -1;
        this.remindInfo.date = "";
        this.showMonth();
      },
      changeDay(item, index) {
        if (item.invalid) return;
        this.tempData = JSON.parse(JSON.stringify(item));
        this.remindInfo = JSON.parse(JSON.stringify(item));
        this.remindIndex = index;
      },
      // 设置房间价格
      openSetting(isEdit) {
        if (this.remindInfo.invalid) return;
        this.isEdit = isEdit;
        this.tempData = JSON.parse(JSON.stringify(this.remindInfo));
        this.isSetting = true;
      },
      // 取消并关闭设置窗口
      closeSetting() {
        this.isSetting = false;
      },
      // 保存设置
      saveSetting() {
        this.updateRequest();
      },
      // 新增备忘录
      addRemind() {
        this.addRequest();
      },
      // 发送编辑请求
      updateRequest() {
        this.remindInfo = JSON.parse(JSON.stringify(this.tempData));
        this.$set(this.dateList, this.remindIndex, this.tempData);
        this.isSetting = false;
      },
      // 发送新增请求
      addRequest() {
        this.tempData.has_remind = true;
        this.remindInfo = JSON.parse(JSON.stringify(this.tempData));
        this.$set(this.dateList, this.remindIndex, this.tempData);
        this.isSetting = false;
      }
    }
  }
</script>

<style>
  .bz-calendar {
    cursor: default;
    background: #fff;
    padding: .5em;
    font-size: 1rem;
  }

  .bz-calendar-hd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: .5em;
  }

  .previous-month,
  .next-month {
    cursor: pointer;
    background: #6af;
    color: #fff;
    padding: .3em .6em;
    border-radius: 5px;
    user-select: none;
  }

  .previous-month:hover,
  .next-month:hover {
    opacity: .9;
  }

  .bz-calendar-weekday {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .bz-calendar-weekday-item {
    width: calc(100% / 7);
    box-sizing: border-box;
    border: 1px solid #ddd;
    padding: .5em 0;
    text-align: center;
  }

  .bz-calendar-weekday-item:not(:first-child) {
    border-left: 0;
  }

  .bz-calendar-month {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .bz-calendar-day {
    width: calc(100% / 7);
    height: 4em;
    padding: .5em 0;
    box-sizing: border-box;
    border: 1px solid #ddd;
    border-top: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fff;
    text-align: center;
  }

  .bz-calendar-day.today {
    background: #fff8f0;
  }

  .bz-calendar-day:not(:nth-child(7n+1)) {
    border-left: 0;
  }

  .bz-calendar-day:not(.invalid):hover, .bz-calendar-day:not(.invalid).active {
    background: #eaf4ff;
    cursor: pointer;
  }

  .bz-calendar-day p {
    margin: 0;
    font-size: 1em;
  }

  .bz-calendar-day .remind-title {
    width: 100%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 5px;
    box-sizing: border-box;
    font-size: .6em;
  }

  .bz-calendar-ft .remark-btn {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: .5em;
  }

  .bz-calendar-ft .remark-btn .btn {
    padding: .3em .6em;
    color: #6af;
    cursor: pointer;
  }

  .bz-calendar-ft .remark-content {
    padding: .5em;
    height: 6em;
    text-align: left;
    overflow: hidden;
    overflow-y: auto;
    background: #fff8f0;
  }

  .bz-calendar-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    z-index: 999;
    background: rgba(0, 0, 0, .3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .bz-calendar-modal-box {
    background: #fff;
    box-shadow: 0 0 3px #00000066;
    width: 400px;
    max-width: 95%;
  }

  .bz-modal-hd {
    text-align: center;
    padding: 10px;
    background: #6af;
    color: #fff;
    position: relative;
  }

  .bz-modal-hd .close {
    padding: 10px;
    line-height: 21px;
    font-size: 26px;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }

  .bz-modal-hd .close:hover {
    background: #00000011;
  }

  .bz-modal-bd {
    padding: 1.2em;
  }

  .bz-modal-bd .item {
    text-align: left;
  }

  .bz-modal-bd .item .item-name {
    margin: .5em 0;
  }

  .bz-modal-bd .item .item-content {
    flex: 1;
  }

  .bz-modal-bd .item .item-content input, .bz-modal-bd .item .item-content textarea {
    width: 100%;
    padding: 10px;
    background: #f8f8f8;
    box-sizing: border-box;
    -webkit-appearance: none;
    border-radius: 5px;
    border: 0;
    outline: none;
    resize: none;
  }

  .bz-modal-bd .item .item-content input[type='radio'] {
    display: none;
  }

  .bz-modal-bd .item .item-content label {
    margin-right: 10px;
    transition: .3s linear;
    position: relative;
  }

  .bz-modal-bd .item .item-content label:before {
    content: '';
    display: inline-block;
    width: 21px;
    height: 21px;
    border-radius: 3px;
    margin-right: .5em;
    vertical-align: middle;
    background: #ccc;
  }

  .bz-modal-bd .item .item-content label:after {
    content: '';
    position: absolute;
    top: 4px;
    left: 7px;
    width: 5px;
    height: 10px;
    border: 3px solid #fff;
    border-left: 0;
    border-top: 0;
    transform: rotate(35deg);
  }

  .bz-modal-bd .item .item-content input:checked + label {
    color: #6af;
  }

  .bz-modal-bd .item .item-content input:checked + label:before {
    background: #6af;
  }

  .bz-modal-ft {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
  }

  .bz-modal-ft .btn {
    color: #fff;
    background: #66aaff;
    border-radius: 5px;
    padding: 10px 1.2em;
    cursor: pointer;
    min-width: 80px;
    text-align: center;
    opacity: .8;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }

  .bz-modal-ft .btn:hover {
    opacity: 1;
  }

  .bz-modal-ft .btn-add {
    background: #f63;
  }
</style>
