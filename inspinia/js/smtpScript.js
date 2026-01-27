/* var ***********************************************************************************************************************************/
// socket
var socket;
const LOG_EVENT_PATH = '/v2/logs/messages/emails/get';
const COUNT_EVENT_PATH = '/v2/metrics/messages/emails/get';
const ARCHIVES_EVENT_PATH = '/v2/archives/messages/emails/get';
const ARCHIVES_DELETE_PATH = '/v2/archives/messages/emails/delete';
const serverDomain = window.location.origin;

// datepicker
let today = new Date();
let lastWeek = new Date(new Date().setDate( today.getDate() - 6));
let lastMonth = new Date(new Date().setDate( today.getDate() - 29));
let last90 = new Date(new Date().setDate( today.getDate() - 89));
let todayStr = today.getFullYear()+"-"+(today.getMonth()+1+"").padStart(2,"0")+"-"+(today.getDate()+"").padStart(2,"0");
let lastWeekStr = lastWeek.getFullYear()+"-"+(lastWeek.getMonth()+1+"").padStart(2,"0")+"-"+(lastWeek.getDate()+"").padStart(2,"0");
let lastMonthStr = lastMonth.getFullYear()+"-"+(lastMonth.getMonth()+1+"").padStart(2,"0")+"-"+(lastMonth.getDate()+"").padStart(2,"0");
let last90Str = last90.getFullYear()+"-"+(last90.getMonth()+1+"").padStart(2,"0")+"-"+(last90.getDate()+"").padStart(2,"0");

// 페이지
let maxPageCount = 1;		// 이 수만큼 페이지 생성
let currentPage = 1;

// 기타
let pageName = "";
let totalCount = 0;				// 총 발송 수
let successCount = 0;			// 성공 수
let failCount = 0;				// 실패 수
let openCount = 0;				// 오픈 수
let nowShowCount = 10;          // 리스트-현재 보이는 갯수
let newShowCount = 10;          // 리스트-추가로 보여줄 갯수
let lastList = true;            // 리스트-더 보여 줄 목록이 있는지(true: 있음, false: 없음)
let apiLimitCount = 10;         // api 요청 시 limit의 값
let offsetValue = 0;			// api 요청 시 offset의 값
let lastPage = true;			// 리스트-조회한 조건에서 이후 더 요청할 데이터가 있는지(has_more 값)
let sentAfterData = null;		// api 요청 시 sent_after의 값
let sentBeforeData = null;		// api 요청 시 sent_before의 값
let subject_data = null;		// api 요청 시 subject의 값(리스트 검색 기능에 사용)
let from_data = null;			// api 요청 시 from의 값(리스트 검색 기능에 사용)
let to_data = null;				// api 요청 시 to의 값(리스트 검색 기능에 사용)
let dateSelectLimit = 1;        // datepicker로 선택한 기간 범위(최대 90일)
let dataArray = [];             // 요청한 데이터를 담아두는 배열
let startDate = "";			    // 선택된 시작일 날짜(00:00:00)
let endDate = "";			    // 선택된 끝 날짜(23:59:59)
let dateType = "";				// 조회 기간 선택(기간별/월간/일일)

let archivesList = [];          // 월별 메일 발송 백업 파일 목록
let recount = 0;

// 차트 설정
let maxTicksLimit = 15;     // 차트에서 한번에 보이는 열의 갯수
let data_ready = false;		// 차트 생성시에 데이터가 잘 들어갔는지 확인하려는 값
let xValues = [];			// 차트 x축의 값
let data_total = [];        // 총발송
let data_success = [];      // 성공
let data_fail = [];         // 실패
let data_open = [];         // 오픈
let GRAPH_TOTAL_MSG = "발송";
let GRAPH_SUCCESS_MSG = "성공";
let GRAPH_FAIL_MSG = "실패";
let GRAPH_OPEN_MSG = "오픈";


/* function ******************************************************************************************************************************/

// socket 연결
// jsp에서 아래 onload 코드작성하여 소켓 꼭 붙여주기
// window.onload = socketRun();
function socketRun(name) {
  pageName = name;
  const namespace = 'nsp/v2';

  socket = io(`/${namespace}`);

  socket.io.on('error', (error) => {
    $("#modal_loading > span").text("에러 발생");
    console.error('에러 발생');
    console.error(error);
  });

  socket.on('connect', () => {
    $("#modal_loading > span").text("연결됨");
    console.log('연결됨');
  });

  socket.on('disconnect', (reason) => {
    $("#modal_loading > span").text(`연결 해제됨: ${reason}`);
    console.log(`연결 해제됨: ${reason}`);
  });

  socket.on('connect_error', (error) => {
    $("#modal_loading > span").text("연결 중 에러");
    console.error('연결 중 에러');
    console.error(error);
  });

  //소켓이 연결되면 함수 실행
  let check_socket = setInterval(()=>{
    if(socket.connected) {
      $("#modal_loading > span").text("데이터 로딩 중");
      clearInterval(check_socket);
      page_setting();
    }
  },100);
};

/* page_setting ****************************************************************************************************************/
function page_setting(){
  if(pageName == "list"){
    data_ready = false;
    requestSentCount();
    let count_check_interval = setInterval(() => {
      if(data_ready){
        clearInterval(count_check_interval);
        requestDataArray();
      }
    }, 50);
  }else if(pageName == "summary"){
    set_chart();
  }
}

/* datepicker 관련 ****************************************************************************************************************/
load_datepicker();
datepicker_date_change();
// datepicker 라이브러리를 로드하고 날짜를 오늘로 지정
function load_datepicker(){
  $("#datepicker").datepicker({
    keyboardNavigation : false,
    forceParse : false,
    autoclose : true,
    language : "ko",
    startDate: "-365d",
    endDate: '+0d',
    todayHighlight: true
  });
}

// datepicker로 선택된 날짜로 조회 시작일과 완료일 변경
function datepicker_date_change(){
  startDate = new Date($("#datepicker input:first-child").val() + " 00:00:00");
  endDate = new Date($("#datepicker input:last-child").val() + " 23:59:59");
  sentAfterData = startDate.toISOString();
  sentBeforeData = endDate.toISOString();
}


/* 모달 로딩 보이기/숨기기 ****************************************************************************************************************/
function show_loading(){
  document.getElementById("modal_loading").style.display = "block";
}
function hide_loading(){
  document.getElementById("modal_loading").style.display = "none";
}

/* api 요청 관련 *************************************************************************************************************************/
// api 월별 백업 파일 목록 다운로드 요청
function archives_api_request(callback){
  let req_args = {};

  socket.emit(ARCHIVES_EVENT_PATH, req_args, (res_args) => {
    callback(res_args);
  });
}

// api 백업 파일 삭제 요청
function archives_delete_api_request(archivesFilename, callback){
  let req_args = {filename : archivesFilename};

  socket.emit(ARCHIVES_DELETE_PATH, req_args, (res_args) => {
    callback(res_args);
  });
}


// api 로그 데이터 요청
function log_api_request(){

  let req_args = {limit : apiLimitCount, sent_after : sentAfterData, sent_before : sentBeforeData, offset : offsetValue, from : from_data, to : to_data, subject : subject_data};
  socket.emit(LOG_EVENT_PATH, req_args, (res_args) => {
    if(res_args){
      res_args.has_more == true ? lastPage = true : lastPage = false;
      res_args.logs.forEach((e, i) => {
        dataArray[i] = e;
      });
    }
    if(pageName == "list"){
      requestList();
    }
    hide_loading();
  });


}

//api 로그 데이터 카운트
function log_api_request_count(){
  let req_args = {sent_after : sentAfterData, sent_before : sentBeforeData, from : from_data, to : to_data, subject : subject_data};
  socket.emit(LOG_EVENT_PATH, req_args, (res_args) => {
    if(res_args){
      recount = res_args.logs.length;
    }
  });
}

// api 카운트 데이터 요청
function count_api_request(){
  let req_args = {sent_after : sentAfterData, sent_before : sentBeforeData, group_by : "day"};
  socket.emit(COUNT_EVENT_PATH, req_args, (res_args) => {
    if(res_args){
      res_args.groups.forEach((e, i) => {
        xValues[res_args.groups.length - 1 - i] = e.date.split("T")[0];
        totalCount += e.total;
        successCount += e.success;
        failCount += e.failure;
        openCount += e.opened;
        data_total[res_args.groups.length - 1 - i] = e.total;
        data_success[res_args.groups.length - 1 - i] = e.success;
        data_fail[res_args.groups.length - 1 - i] = e.failure;
        data_open[res_args.groups.length - 1 - i] = e.opened;
      });
      count_update([totalCount, successCount, failCount, openCount]);
    }
    data_ready = true;

    if(recount >=1) {
      maxPageCount = Math.ceil(recount/apiLimitCount);
    } else {
      maxPageCount = Math.ceil(totalCount/apiLimitCount);
    }

    if(pageName == "list"){
      update_currentPage();
      document.getElementById("maxPageCount").innerText = maxPageCount;
    }
  });
}

// 카운트 표기하기
function count_update(count){
  // count = [totalCount, successCount, failCount, openCount] 입니다. 참고
  document.getElementById("total_n").innerText = convert_count(count[0]);
  document.getElementById("success_n").innerText = convert_count(count[1]);
  document.getElementById("fail_n").innerText = convert_count(count[2]);
  document.getElementById("open_n").innerText = convert_count(count[3]);
}

// 카운트를 세자리 콤마(,) 형식으로 변환
function convert_count(count){
  return count.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// 발송 내역(로그) 조회
function requestDataArray(){
  show_loading();
  resetListNArray();
  datepicker_date_change();
  log_api_request();
};

// 발송 카운트 조회
function requestSentCount(){
  datepicker_date_change();
  count_api_request();
}


/* 기능 **************************************************************************************************************************************/
// 차트 옵션 설정
function set_chart(){

  // 차트 데이터 초기화
  chart_reset();

  // 차트 생성 위치
  let ctx = document.getElementById("lineChart").getContext("2d");

  // 차트 데이터 설정
  let lineData = {
    labels: xValues,
    datasets: [
      {
        label: GRAPH_TOTAL_MSG,
        backgroundColor: '#8B97FF55',
        borderColor: "#1c84c680",
        fill: 'none',
        showLine: true,
        pointBackgroundColor: "#1c84c680",
        pointHoverBackgroundColor: "#1c84c6",
        pointBorderColor: "#1c84c680",
        pointHoverBorderColor: "#1c84c6",
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        tension: 0.3,
        borderWidth: 2,
        data: data_total,
      },
      {
        label: GRAPH_SUCCESS_MSG,
        backgroundColor: '#1AB33C55',
        borderColor: "#23c6c880",
        fill: 'none',
        showLine: true,
        pointBackgroundColor: "#23c6c880",
        pointHoverBackgroundColor: "#23c6c8",
        pointBorderColor: "#23c6c880",
        pointHoverBorderColor: "#23c6c8",
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        tension: 0.3,
        borderWidth: 2,
        data: data_success
      },
      {
        label: GRAPH_FAIL_MSG,
        backgroundColor: '#FF232355',
        borderColor: "#ed556580",
        fill: 'none',
        showLine: true,
        pointBackgroundColor: "#ed556580",
        pointHoverBackgroundColor: "#ed5565",
        pointBorderColor: "#ed556580",
        pointHoverBorderColor: "#ed5565",
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        tension: 0.3,
        borderWidth: 2,
        data: data_fail
      },
      {
        label: GRAPH_OPEN_MSG,
        backgroundColor: '#ffd60a55',
        borderColor: "#fca31180",
        fill: 'none',
        showLine: true,
        pointBackgroundColor: "#fca31180",
        pointHoverBackgroundColor: "#fca311",
        pointBorderColor: "#fca31180",
        pointHoverBorderColor: "#fca311",
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        tension: 0.3,
        borderWidth: 2,
        data: data_open
      }
    ]
  };

  // 차트 옵션
  let chartOption = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    tooltips: {
      intersect: false,
      mode: 'index',
      position: 'nearest'
    },
    hover: {
      intersect: false,
      mode: 'index',
      position: 'nearest'
    },
    elements: {
      point: {
        hitRadius: 30
      }
    },
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          min: 0,
          beginAtZero: true,
          callback: function(value, index, values) {
            if (Math.floor(value) === value) {
              return value;
            }
          }
        }
      }],
      xAxes: [{
        ticks: {
          maxTicksLimit: maxTicksLimit
        }
      }]
    }
  };

  //데이터 조회 및 집어넣기
  requestSentCount();

  // 차트 이미지가 이미 있는 경우 삭제(겹침 오류 발생 때문)
  destroy_chart();

  //차트 만들기
  make_chart([lineData, chartOption], ctx);
}

//차트 생성
function make_chart(options, ctx){
  let create_chart = setInterval(()=>{
    if(data_ready == true){
      hide_loading();
      clearInterval(create_chart);
      window.chart = new Chart(ctx, {
        type: 'line',
        data: options[0],
        options: options[1],
        elements: {
          line: {
            borderCapStyle: 'square'
          }
        }
      });
    }
  },100);
}

//차트 삭제
function destroy_chart(){
  if(window.chart != undefined){
    window.chart.destroy();
  }
}

// 리스트 뿌리기(smtp_list에서 표에 데이터 넣는 함수)
function requestList(){
  dataArray = dataArray;

  for(let i=0;i<dataArray.length;i++){
    let e = dataArray[i];
    let result = "X";
    let day = new Date(e.date);
    let year = day.getFullYear();
    let month = day.getMonth() + 1;
    let date = day.getDate();
    let hour = day.getHours();
    let minutes = day.getMinutes();
    month < 10 ? month = "0" + month : month;
    date < 10 ? date = "0" + date : date;
    minutes < 10 ? minutes = "0" + minutes : minutes;
    hour < 10 ? hour = "0" + hour : hour;

    if(e.to[0]){
      e.to[0].result == true ? result = "O" : result = "X";

      let content = "";
      content += `<tr>`;

      // 검색시 글번호와 페이지네이션 다른 정보로 표시
      content += recount ? `<td>${recount -i -offsetValue}</td>` : `<td>${totalCount -i -offsetValue}</td>`;

      content += `
            <td>${e.subject}</td>
            <td>${e.from.replace("<","&lt;").replace(">","&gt;")}</td>
			<td>TO</td>
            <td>${e.to[0].address}</td>
            <td>${year}-${month}-${date} ${hour}:${minutes}</td>
			<td>${result}</td>
            <td>${e.to[0].reply_code == "250" ? "" : "(" + e.to[0].reply_code+") " + e.to[0].reply_text}</td>
			<td>${e.to[0].opened_at == null ? "X" : "O"}</td>
            <td>${e.to[0].opened_at == null ? "" : e.to[0].opened_at.split(".")[0].split("T").join(" ").slice(0, -3)}</td>
            </tr>
            `;
      document.getElementById('smtp_list_tbody').innerHTML += content;

      if(i == dataArray.length - 1){
        lastList = false;
      } else {
        lastList = true;
      }
    } else {
      document.getElementById('smtp_list_tbody').innerHTML += `
            <tr>
            <td>${totalCount - i -offsetValue}</td>
            <td colspan="6" style="text-align: center;">수신자가 존재하지 않는 발송로그입니다.</td>
            </tr>
            `;
      if(i == dataArray.length - 1){
        lastList = false;
      } else {
        lastList = true;
      }
    }
  }
  nowShowCount = nowShowCount + newShowCount;
}

// 검색
function onSearch() {
  resetListValue();
  let search_option = $("#searchOption").val();
  let search_word = $("#search").val();

  if(search_word == ""){
    requestSentCount();
    requestDataArray();
  } else {
    if(search_option == "1") {
      subject_data = search_word;
    } else {
      if(validator.isEmail(search_word) == false){ return search_focus(); }
      if(search_option == "2") {
        from_data = search_word;
      } else if(search_option == "3") {
        to_data = search_word;
      }
    }
    req_search_data_arr();
  }
}
function req_search_data_arr(){
  log_api_request_count();
  requestSentCount();
  requestDataArray();
}
function search_focus(){
  alert(NOT_EMAIL_MSG);
  $("#search").focus();
}

// 기간변경 시 두 날짜 사이의 범위 체크
function dateChage(){

  show_loading();
  datepicker_date_change();

  //선택한 날짜 사이의 일 수 구하기
  let selectedDateGap = Math.abs((endDate.getTime() - startDate.getTime()) / (1000*60*60*24) + 1);

  //30일 이하의 데이터는  모든 열 보여주기, 30일 초과 데이터는 15열로 축약하여 보여주기
  if(selectedDateGap < 31){
    maxTicksLimit = 30;
  } else {
    maxTicksLimit = 15;
  }

  //90일 초과 범위는 90일 선택치를 보여줌
  dateSelectLimit = parseInt(selectedDateGap);
  if(dateSelectLimit > 90){
    dateSelectLimit = 90;
    alert(MAX_DATE_RANGE_MSG);
    show_loading();
    let date90 = new Date(new Date().setDate( endDate.getDate() - dateSelectLimit + 1 ));
    let date90Str = date90.getFullYear() + "-" + (date90.getMonth()+1+"").padStart(2,"0") + "-" + (date90.getDate()+"").padStart(2,"0");
    $("#datepicker input:first-child").val(date90Str);
  }
  excel_download_date_setting(endDate);
  resetListValue();
  page_setting();
}

// 조회 기간 선택
function changeDateType() {
  dateType = document.getElementById("dateType").value;
  startDate = document.querySelector('.datepicker_st');
  endDate = document.querySelector('.datepicker_ed');
}


/* 버튼 *********************************************************************************************************/
/// 고정 날짜 버튼 클릭하면 날짜 입력란 값 변경
function goDate(str){
  $("#datepicker input:last-child").val(todayStr);
  switch(str){
    case "오늘" :
      $("#datepicker input:first-child").val(todayStr);
      break;
    case "7일" :
      $("#datepicker input:first-child").val(lastWeekStr);
      break;
    case "30일" :
      $("#datepicker input:first-child").val(lastMonthStr);
      break;
    case "90일" :
      $("#datepicker input:first-child").val(last90Str);
      break;
    default :
      $("#datepicker input:first-child").val(lastWeekStr);
      break;
  }
  dateChage();
  load_datepicker();
}

// n개씩 보기 선택
function showCountChange(count){
  apiLimitCount = count/1;
  resetListValue();
  resetListNArray();
  requestSentCount();
  requestDataArray();
}

// 페이지 입력란에 페이지 입력할 때
function clickKey(){
  goPageNumber = document.getElementById("nowPageInput").value;

  if (window.event.keyCode == 13){

    //엔터키를 누른 경우
    if(goPageNumber == "" ){
      update_currentPage();
    } else {
      if(goPageNumber == maxPageCount){
        showNextPage("last");
      } else {
        showNextPage(goPageNumber);
      }
    }

  } else if(window.event.keyCode != 13 && goPageNumber == "" ){
  } else {

    // 엔터키 누른 게 아닌 경우 키 누를 때마다 숫자인지 체크
    let isItNumber = /^[0-9]+$/;
    if (isItNumber.test(goPageNumber) == false){
      alert("숫자만 입력 가능합니다.");
      update_currentPage();
    } else if(goPageNumber == 0){
      update_currentPage();
    } else if(goPageNumber > maxPageCount){
      alert("최대 페이지를 초과했습니다.");
      document.getElementById("nowPageInput").value = "";
    }

  }
}

// 페이지 버튼
function showNextPage(page){
  if(page == "first"){
    currentPage = 1;
    offsetValue = 0;
  } else if(page == "prev"){
    if(offsetValue < 1){
      alert("처음 페이지 입니다.");
      currentPage = 1;
      offsetValue = 0;
    } else if (currentPage == 2){
      currentPage = 1;
      offsetValue = 0;
    } else {
      currentPage--;
      offsetValue = offsetValue - apiLimitCount;
    }
  } else if(page == "next"){
    if(currentPage >= maxPageCount){
      alert("마지막 페이지 입니다.");
      currentPage = maxPageCount;
      offsetValue = recount ? last_offset(recount) : last_offset(totalCount);
    } else {
      currentPage++;
      offsetValue = offsetValue + apiLimitCount;
    }
  } else if(page == "last"){
    currentPage = maxPageCount;
    offsetValue = recount ? last_offset(recount) : last_offset(totalCount);
  } else {
    currentPage = page/1;
    offsetValue = apiLimitCount*(currentPage - 1);
  }
  update_currentPage();
  requestDataArray();
}
// 마지막 페이지 offset 구하는 함수
function last_offset(totalCnt){
  let val = Math.floor(totalCnt/apiLimitCount);
  return apiLimitCount*val;
}

// 페이지 표기를 현재 페이지로 변경
function update_currentPage(){
  document.getElementById("nowPageInput").value = currentPage;
}

// Top 버튼
function goToTop(){
  window.scrollTo(0,0);
}

// 도메인 변경
function changeApiUrl(apiUrl){
  show_loading();
  resetListNArray();
  resetListValue();
  api_server = apiUrl;
  socketRun();
}


/* 초기화 ***************************************************************************************************************************/
// 목록 조건 초기화
function resetListValue(){
  openCount = 0;
  offsetValue = 0;
  nowShowCount = 0;
  newShowCount = 10;
  totalCount = 0;
  recount = 0;
  successCount = 0;
  failCount = 0;
  currentPage = 1;
  xValues = [];
  data_ready = false;
  subject_data = null;
  from_data = null;
  to_data = null;
  cc_data = null;
  bcc_data = null;
}

// 목록 테이블, 배열 초기화
function resetListNArray(){
  if(pageName == "list"){
    document.getElementById('smtp_list_tbody').innerHTML = "";
  }
  dataArray = [];
}

// datepicker 초기화
function datepicker_reset() {
  if ($("#datepicker").data('datepicker')) {
    $("#datepicker").datepicker('destroy');
  }
}

// 차트 데이터 초기화
function chart_reset() {
  data_total = [];
  data_success = [];
  data_fail = [];
  data_open = [];
}

/* 엑셀 다운로드 버튼 관련 ****************************************************************************************************************/
excel_download_date_setting(today);
//다운로드 버튼 날짜 설정

function excel_download_date_setting(date){

  if(document.getElementById("excelDownBtn")){
    // clear event listeners
    document.getElementById("excelDownBtn").replaceWith(document.getElementById("excelDownBtn").cloneNode(true));
    const url = serverDomain+"/api/v2/logs/messages/emails/"+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
    const filename = "email_logs_"+date.getFullYear()+"_"+(date.getMonth()+1)+"_"+date.getDate();
    document.getElementById("excelDownBtn").addEventListener("click", function(event){
      event.preventDefault();
      fetchExcel(url, filename);
    });
  }
}


let excelFetchRetryCount = 0;

async function fetchExcel(url, filename) {
  // Fetch the CSV file from the provided URL
  fetch(url)
    .then(response => response.text())
    .then(csvData => {
      // If the CSV data is empty, display an error message
      if (!csvData && excelFetchRetryCount < 3) {
        document.getElementById("excelDownBtn").click();
        return;
      }

      if (!csvData) {
        console.error('The CSV data is empty');
        return;
      }

      // Add BOM to the CSV data
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvData;

      // Parse the CSV data into a workbook using XLSX
      const workbook = XLSX.read(csvWithBOM, { type: 'string' });

      // Convert the workbook to a binary string for download
      const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Create a Blob object to hold the binary data
      const blob = new Blob([xlsxData], { type: 'application/octet-stream' });

      // Create a download link and trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename + '.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(error => {
      console.error('Error downloading or converting the CSV file:', error);
    });
}

function month_modal_show(type){

  refreshModalContent();

  let month_modal = document.getElementById("month_backup_madal");
  let deleted_error = document.getElementById("deleted_error");

  if(type=="show"){
    month_modal.classList.add("show");
  } else if(type=="close"){
    month_modal.classList.remove("show");
    deleted_error.style.display = 'none';
  }
}

function month_backup_delete(filename){
  // key 값으로 구분한 데이터를 삭제하는 로직
  let backip_list = document.getElementById(filename);

  let backup_list_item = backip_list.querySelector('.backup_list_item');
  let delete_btn = backip_list.querySelector('.delete_btn');
  let deleted_error = backip_list.querySelector('.deleted_error');

  if(confirm(filename+" 백업 파일을 삭제 하시겠습니까?")){
    // 버튼 비활성화
    delete_btn.disabled = true;

    // api 호출 후 결과 보여주기
    archives_delete_api_request(filename, function(data){

      let delete_result = data.result[0].deleted

      if(delete_result) {
        refreshModalContent();
      } else {
        delete_btn.disabled = false;
        deleted_error.style.display = 'inline-block';
        alert('삭제가 정상적으로 이루어지지 않았습니다. 관리자에게 문의하세요.');
      }
    });
  }
}

function refreshModalContent() {
  archives_api_request(function(data) {
    const str = 'deleted';
    let backup_list = document.getElementById("backup_list");
    backup_list.innerHTML = '';

    archivesList = data.archives ;

    archivesList.forEach(function(archive, index) {
      let archive_filename = archive.filename;
      let listItem = document.createElement('li');
      listItem.id = archive_filename;

      if(archive_filename.includes(str)) {
        let unlink = document.createElement('p');
        unlink.textContent = archive.filename;
        unlink.id = "backup_file";
        unlink.style.textDecoration = "line-through";
        listItem.appendChild(unlink);
      } else {
        let link = document.createElement('a');
        link.href = serverDomain + '/' + archive.path; // 다운로드 링크 설정
        link.download = archive.filename; // 다운로드 파일 이름 설정
        link.textContent = archive.filename; // 링크 텍스트 설정
        link.id = "backup_file";
        listItem.appendChild(link);

        // 삭제 버튼 생성
        let deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete_btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.id = "delete_btn";
        deleteBtn.onclick = function() {
          month_backup_delete(archive.filename);
        };
        listItem.appendChild(deleteBtn);

        // 삭제 에러 생성
        let deletedError = document.createElement('div');
        deletedError.className = 'deleted_error';
        deletedError.id = 'deleted_error';
        deletedError.style.display = 'none';
        deletedError.textContent = '!';
        listItem.appendChild(deletedError);
      }

      // 백업 파일 리스트에 아이템 추가
      backup_list.appendChild(listItem);
    });

  });
}
