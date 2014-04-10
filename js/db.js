var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {
	READ_WRITE : 'readwrite'
};

const dbVersion = 6;
const dbName = "testSpeedDB";
var db;

function open_db() {
	if (!indexedDB) {
		alert("Your browser/OS doesnt support HTML5 storage, It sucks !!!!");
	}
	var request = indexedDB.open(dbName, dbVersion);

	request.onerror = function(event) {
		console.log(event);
	};

	request.onupgradeneeded = function(event) {
		console.log("Creating ObjectStores....");
		db = event.target.result;
		var old_objStores = db.objectStoreNames;
		for ( x = 0; x < old_objStores.length; x++) {
			console.log("X --> " + x);
			console.log("OBJ --> " + old_objStores[x]);
			db.deleteObjectStore(old_objStores[x]);
		}
		console.log("After Delete" + db.objectStoreNames.length);
		var not_indexed = db.createObjectStore("not_indexed", {
			keyPath : 'pid'
		});
		var indexed = db.createObjectStore("indexed", {
			keyPath : 'pid'
		});
		indexed.createIndex("pid", "pid", {
			unique : true
		});
		indexed.createIndex("name", "name", {
			unique : false
		});
	};

	request.onsuccess = function(event) {
		console.log("Database opened !!!!");
		console.log("DbName : " + event.target.result.name + " | Version : " + event.target.result.version + " | number of ObjectStores : " + event.target.result.objectStoreNames.length);
		db = this.result;
		// var objStores = db.objectStoreNames;
		// for (x=0;x<objStores.length;x++) {
		// db.transaction(objStores[x],"readwrite").objectStore(objStores[x]).clear().onsuccess=function(){
		// console.log("ObjectStore "+objStores[x]+" cleared");
		// };
		// }
	};
}

function insert_test(obj) {
	var text = (obj == "indexed") ? "Indexed " : "";
	var objStore = db.transaction([obj], "readwrite").objectStore(obj);
	var req = objStore.clear();
	req.onsuccess = function() {
		console.log("CLEARED");
		test_start = new Date();
		test_log(text + "INSERT test started", test_start);
		insert_data(0, $content.length);

		function insert_data(i, length) {
			if (i < length) {
				objStore.put($content[i]).onsucess = insert_data(++i, length);
			} else {
				test_end = new Date();
				test_log(text + "INSERT test finished", test_end);
				test_log(text + "INSERT done in ", test_start, test_end);
				
			}
		}

	};
}

function select_test() {
	var objStore = db.transaction("not_indexed").objectStore("not_indexed");
	var cursorReqs = [],cursorDoneCount = 0;
	test_start = new Date();
	test_log("SELECT test started", test_start);
	select_data(0,$content.length);

	function select_data(i,length){
		if(i<length){
			var boundKeyRange = IDBKeyRange.bound(i,i+100, false, true);
			objStore.openCursor(boundKeyRange).onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					if (cursor.value.name){
						// console.log("key"+cursor.key+"--"+cursor.value.name+"--"+cursor.value.tel);
					}
					cursor.continue();
				} else {
					select_data(i+100,length);
				}
			};
		}else{
			test_end = new Date();
			test_log("SELECT test finished", test_end);
			test_log("SELECT done in ", test_start, test_end);
		}
	}
}

function select_indexed_test() {
	var objStore = db.transaction("indexed").objectStore("indexed");
	test_start = new Date();
	test_log("Indexed SELECT test started", test_start);
	select_indexed_data(0,$content.length);
	
	function select_indexed_data(i,length){
		if(i<length){
			var boundKeyRange = IDBKeyRange.bound(i,i+100, false, true);
			objStore.index("pid").openCursor(boundKeyRange).onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					if (cursor.value.name){
						// console.log("key"+cursor.key+"--"+cursor.value.name+"--"+cursor.value.tel);
					}
					cursor.continue();
				} else {
					select_indexed_data(i+100,length);
				}
			};
		}else{
			test_end = new Date();
			test_log("Indexed SELECT test finished", test_end);
			test_log("Indexed SELECT done in ", test_start, test_end);
		}
	}
}

function update_test() {
	var objStore = db.transaction(["not_indexed"], "readwrite").objectStore("not_indexed");
	test_start = new Date();
	test_log("UPDATE test started", test_start);
	update_data(0,$content.length);
	
	function update_data(i,length){
		if(i<length){
			var boundKeyRange = IDBKeyRange.bound(i,i+100, false, true);
			objStore.openCursor(boundKeyRange).onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					cursor.value.tel = "-updated";
					objStore.put(cursor.value);
					cursor.continue();
				} else {
					update_data(i+100,length);
				}
			};
		}else{
			test_end = new Date();
			test_log("UPDATE test finished", test_end);
			test_log("UPDATE done in ", test_start, test_end);
		}
	}
}

function update_indexed_test() {
	var objStore = db.transaction(["indexed"], "readwrite").objectStore("indexed");
	test_start = new Date();
	test_log("Indexed UPDATE test started", test_start);
	update_indexed_data(0,$content.length);
	
	function update_indexed_data(i,length){
		if(i<length){
			var boundKeyRange = IDBKeyRange.bound(i,i+100, false, true);
			objStore.index("pid").openCursor(boundKeyRange).onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					cursor.value.tel = "-updated";
					objStore.put(cursor.value);
					cursor.continue();
				} else {
					update_indexed_data(i+100,length);
				}
			};
		}else{
			test_end = new Date();
			test_log("Indexed UPDATE test finished", test_end);
			test_log("Indexed UPDATE done in ", test_start, test_end);
		}
	}
}

function delete_test() {
	var objStore = db.transaction(["not_indexed"], "readwrite").objectStore("not_indexed");
	test_start = new Date();
	test_log("DELETE test started", test_start);
	delete_data(0,$content.length);
	
	function delete_data(i,length){
		if(i<length){
			var boundKeyRange = IDBKeyRange.bound(i,i+100, false, true);
			objStore.openCursor(boundKeyRange).onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					objStore.delete (cursor.value.pid);
					cursor.continue();
				} else {
					delete_data(i+100,length);
				}
			};
		}else{
			test_end = new Date();
			test_log("DELETE test finished", test_end);
			test_log("DELETE done in ", test_start, test_end);
		}
	}
}

function delete_indexed_test() {
	var objStore = db.transaction(["indexed"], "readwrite").objectStore("indexed");
	test_start = new Date();
	test_log("Indexed DELETE test started", test_start);
	delete_indexed_data(0,$content.length);

	function delete_indexed_data(i,length){
		if(i<length){
			var boundKeyRange = IDBKeyRange.bound(i,i+100, false, true);
			objStore.index("pid").openCursor(boundKeyRange).onsuccess = function(event) {
				var cursor = event.target.result;
				if (cursor) {
					objStore.delete (cursor.value.pid);
					cursor.continue();
				} else {
					delete_indexed_data(i+100,length);
				}
			};
		}else{
			test_end = new Date();
			test_log("Indexed DELETE test finished", test_end);
			test_log("Indexed DELETE done in ", test_start, test_end);
		}
	}
}
