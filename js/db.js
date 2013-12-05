var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {
	READ_WRITE : 'readwrite'
};

const dbVersion = 4;
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
		for (x=0;x<old_objStores.length;x++) {
			console.log("X --> "+x);
			console.log("OBJ --> "+old_objStores[x]);
			db.deleteObjectStore(old_objStores[x]);
		}
		console.log("After Delete" + db.objectStoreNames.length);
		var not_indexed = db.createObjectStore("not_indexed", {
			keyPath : 'id',
			autoIncrement : true
		});
		var indexed = db.createObjectStore("indexed", {
			keyPath : 'id',
			autoIncrement : true
		});
		indexed.createIndex("name","name",{unique : false});
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
	var items = [];
	var text = obj=="indexed" ? "Indexed ":"";
	var json = $.getJSON("./data/3000Row.json", function(data) {
		$.each(data, function(row) {
			items.push(data[row]);
		});
	}).done(function(data) {
		var objStore = db.transaction([obj], "readwrite").objectStore(obj);
		var req = objStore.clear();
		req.onsuccess = function(){
			console.log("CLEARED");
			test_start = new Date();
			test_log(text+"INSERT test strated",test_start);
			insert_data(0, items.length);

			function insert_data(i, length) {
				if (i < length) {
					objStore.put(items[i]).onsucess = insert_data(++i, length);
				} else {
					test_end = new Date();
					test_log(text+"INSERT test finished",test_end);
					test_log(text+"INSERT done in ",test_start,test_end);
					// if($test_fields.length > 1){
					// }
				}
			}
		};
	});
}
function select_test() {
	var objStore = db.transaction("not_indexed").objectStore("not_indexed");
	test_start = new Date();
	test_log("SELECT test strated",test_start);
	objStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			cursor.continue();
		}
		else {
		    test_end = new Date();
			test_log("SELECT test finished",test_end);
			test_log("SELECT done in ",test_start,test_end);
		}
	};
}

function select_indexed_test(limit) {
	var objStore = db.transaction("indexed").objectStore("indexed");
	test_start = new Date();
	test_log("Indexed SELECT test strated",test_start);
	objStore.index("name").openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			cursor.continue();
		}
		else {
		    test_end = new Date();
			test_log("Indexed SELECT test finished",test_end);
			test_log("Indexed SELECT done in ",test_start,test_end);
		}
	};
}


function update_test() {
	var objStore = db.transaction(["not_indexed"],"readwrite").objectStore("not_indexed");
	test_start = new Date();
	test_log("UPDATE test strated",test_start);
	objStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			cursor.value.name = cursor.value.name+"-updated"; 
			objStore.put(cursor.value);
			cursor.continue();
		}
		else {
			test_end = new Date();
			test_log("UPDATE test finished",test_end);
			test_log("UPDATE done in ",test_start,test_end);
		}
	};
	
}

function update_indexed_test() {
	var objStore = db.transaction(["indexed"],"readwrite").objectStore("indexed");
	test_start = new Date();
	test_log("Indexed UPDATE test strated",test_start);
	objStore.index("name").openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			cursor.value.tel = cursor.value.tel+"-updated"; 
			objStore.put(cursor.value);
			cursor.continue();
		}
		else {
			test_end = new Date();
			test_log("Indexed UPDATE test finished",test_end);
			test_log("Indexed UPDATE done in ",test_start,test_end);
		}
	};
	
}

function delete_test() {
	var objStore = db.transaction(["not_indexed"],"readwrite").objectStore("not_indexed");
	test_start = new Date();
	test_log("DELETE test strated",test_start);
	objStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			objStore.delete(cursor.value.id);
			cursor.continue();
		}
		else {
			test_end = new Date();
			test_log("DELETE test finished",test_end);
			test_log("DELETE done in ",test_start,test_end);
		}
	};
}

function delete_indexed_test(limit) {
	var objStore = db.transaction(["indexed"],"readwrite").objectStore("indexed");
	test_start = new Date();
	test_log("Indexed DELETE test strated",test_start);
	objStore.index("name").openCursor().onsuccess = function(event) {
		var cursor = event.target.result;
		if (cursor) {
			objStore.delete(cursor.value.id);
			cursor.continue();
		}
		else {
			test_end = new Date();
			test_log("Indexed DELETE test finished",test_end);
			test_log("Indexed DELETE done in ",test_start,test_end);
		}
	};
}
