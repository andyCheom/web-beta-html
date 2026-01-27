function fn_ajaxData(url, Data){
	var returnVal = "";
	
	$.ajax({
 		url:url,
 		type:"POST",
 		data:Data,
 		async: false,
 		success :function(data){
 			returnVal = data;
 		},
 		error:function(data){
 			
 			returnVal = false;
 		}
	});
	return returnVal;
}

function fn_ajaxFileData(url, Data){
	var returnVal = "";
	
	$.ajax({
 		url:url,
 		enctype: 'multipart/form-data',
 		processData: false,
        contentType: false,
 		type:"POST",
 		data:Data,
 		async: false,
 		success :function(data){
 			returnVal = data;
 		},
 		error:function(data){
 			
 			returnVal = false;
 		}
	});
	return returnVal;
}

function copy(val) {
  const t = document.createElement("textarea");
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
}

