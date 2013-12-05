var test_start, test_end;
var $test_log_area;
var $test_fields;
var $process_time = [];
var $temp;
$(document).ready(function() {
	// console.log( "ready!" );
	// $("#startButton").height($("#startButton").width());
	$test_log_area = $("#logTArea");
	open_db();
	$("#startButton").click(function() {
		$test_fields = $("#test-settings-div input:checkbox:checked");
		test_log($test_fields.length + " Test(s) selected !!!");
		test_log("Starting the tests !");
		$temp = $test_fields.first().attr('id'); 
		check_test_settings($temp);
	});

});

function check_test_settings(test_field) {
	switch(test_field) {
		case 'ins':
			insert_test("not_indexed");
			break;
		case 'ins-indexed':
			insert_test("indexed");
			break;
		case 'sel':
			select_test();
			break;
		case 'sel-indexed':
			select_indexed_test();
			break;
		case 'upd':
			update_test();
			break;
		case 'upd-indexed':
			update_indexed_test();
			break;
		case 'del':
			delete_test();
			break;
		case 'del-indexed':
			delete_indexed_test();
			break;

		default:
			console.log("in progress");
	}
}

function test_log() {
	if (arguments.length == 3) {
		var diff = arguments[2] - arguments[1];
		$test_log_area.append(arguments[0] + ":" + diff + " miliseconds" + "\n");
		$test_log_area.scrollTop($("#logTArea")[0].scrollHeight);
		if ($temp == "ins" || $temp == "ins-indexed" || $temp == "del" || $temp == "del-indexed") {
			console.log(" JUST ONE TIME ");
		} else {
			if ($process_time.push(diff) == 10) {
				var avg = 0;
				for (x in $process_time) {
					avg = avg + $process_time[x];
				}
				$test_log_area.append("AVERAGE: " + (avg / 10));
				$test_log_area.scrollTop($("#logTArea")[0].scrollHeight);
			} else {
				check_test_settings($temp);
			}

		}
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

// function test_log(time,txt){
// $test_log_area.append(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()+":"+time.getMilliseconds()+" "+txt+"\n");
// $test_log_area.scrollTop($("#logTArea")[0].scrollHeight);
// // $('#textarea_id').scrollTop($('#textarea_id')[0].scrollHeight);
// }

