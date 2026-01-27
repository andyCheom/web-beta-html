function cmaComma(obj) {
	
    var str = "" + obj.value.replace(/[^0-9/]/gi, ""); // 콤마 제거  
    var regx = new RegExp(/(-?\d+)(\d{3})/);  
    var bExists = str.indexOf(".",0);  
    var strArr = str.split('.'); 
 
    while(regx.test(strArr[0])){  
        strArr[0] = strArr[0].replace(regx,"$1,$2");  
    }  
    if (bExists > -1)  {
        obj.value = strArr[0] + "." + strArr[1];  
    } else  {
        obj.value = strArr[0]; 
    }
}
 
function commaSplit(n) {// 콤마 나누는 부분
    var txtNumber = '' + n;
    var rxSplit = new RegExp('([0-9])([0-9][0-9][0-9][,.])');
    var arrNumber = txtNumber.split('.');
    arrNumber[0] += '.';
    do {
        arrNumber[0] = arrNumber[0].replace(rxSplit, '$1,$2');
    }
    while (rxSplit.test(arrNumber[0]));
    if(arrNumber.length > 1) {
        return arrNumber.join('');
    } else {
        return arrNumber[0].split('.')[0];
    }
}
 
function removeComma(n) {  // 콤마제거
    if ( typeof n == "undefined" || n == null || n == "" ) {
        return "";
    }
    var txtNumber = '' + n;
    return txtNumber.replace(/(,)/g, "");
}

function checkLimit(obj1, obj2) {

    var str = "" + obj1.value.replace(/[^0-9/]/gi, ""); // 콤마 제거  
    var limit = "" + obj2.value.replace(/[^0-9/]/gi, ""); // 콤마 제거  
    
    if( Number(str) > Number(limit) ) {
    	str = Math.floor(Number(str) / 10);
    	obj1.value = commaSplit(str);
    	cmaComma(obj1);
    	return false;
    }
    cmaComma(obj1);
}