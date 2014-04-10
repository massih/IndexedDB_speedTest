var test_start, test_end;
var $test_log_area;
var $test_fields;
var $process_time = [];
var $content;
var $indexed;

$(document).ready(function() {
	$test_log_area = $("#logTArea");

	open_db(); //prepare IndexedDB
	
	/* set apk path to download */
	$("#download_button").click(function(){
		window.location= './data/sqliteSpeedTest.apk';
	});
	
	$("#startButton").click(function() {
		var $content = read_content();
	});

});

function check_test_settings() {
	if($test_fields.length <= 0){
		return -1;
	}
	var temp = $test_fields.first().attr('id');
	if($indexed){
		switch(temp) {
			case 'ins':
				insert_test("indexed");
				break;
			case 'sel':
				select_indexed_test();
				break;
			case 'upd':
				update_indexed_test();
				break;			
			case 'del':
				delete_indexed_test();
				break;
			default:
				console.log("in progress");
		}
	}else{
		switch(temp) {
			case 'ins':
				insert_test("not_indexed");
				break;
			case 'sel':
				select_test();
				break;
			case 'upd':
				update_test();
				break;			
			case 'del':
				delete_test();
				break;
			default:
				console.log("in progress");
		}		
	}
	$test_fields.splice(0,1);
}

function test_log() {
	if (arguments.length == 3) {
		var diff = arguments[2] - arguments[1];
		$test_log_area.append(arguments[0] + ":" + diff + " miliseconds" + "\n");
		$test_log_area.scrollTop($("#logTArea")[0].scrollHeight);
		check_test_settings();
	} else if (arguments.length == 2) {
		var time = arguments[1];
		$test_log_area.append(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + ":" + time.getMilliseconds() + " ");
		$test_log_area.append(arguments[0] + "\n");
		$test_log_area.scrollTop($("#logTArea")[0].scrollHeight);
	} else if (arguments.length == 1) {
		$test_log_area.append(arguments[0] + "\n");
		$test_log_area.scrollTop($("#logTArea")[0].scrollHeight);
	}
}

function read_content() {
	if(!$content || $("#test-setting-size :selected").attr('size') != $content.length){
		$content = [];
		var file = "./data/"+$("#test-setting-size :selected").val()+".json";
		var json = $.getJSON(file, function(data) {
			$.each(data, function(row) {
				$content.push(data[row]);
			});
		}).done(function(data) {
			start_the_test();
		});
	}else{
		start_the_test();
	}
}

function start_the_test(){
	$indexed = false;
	$test_fields = $("#test-settings-div input:checkbox:checked");
	console.log($test_fields.length);
	if($test_fields.first().attr("id") == "myonoffswitch"){
		$indexed = true;
		$test_fields.splice(0,1);
	}
	console.log($test_fields.length);
	if($test_fields.length == 0){
		console.log("Pick a test");
		return 0;
	}
	test_log($test_fields.length + " Test(s) selected !!!");
	test_log("Starting the test(s)!");
	check_test_settings();
}

