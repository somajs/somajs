describe("hashmaps", function () {

	var map;

	beforeEach(function () {
		map = new soma.utils.HashMap('test-id');
	});

	afterEach(function () {
		map.dispose();
		map = undefined;
	});

	it("create hash map", function() {
		expect(map).toBeDefined();
		expect(map).not.toBeNull();
		expect(map.getData()).toEqual({});
	});

	it("hash map put, get and remove", function() {
		// number
		map.put(1, 'string');
		expect(map.get(1)).toBeDefined();
		expect(map.get(1)).toEqual('string');
		map.remove(1);
		expect(map.get(1)).toBeUndefined();
		// string
		map.put('str', 'string');
		expect(map.get('str')).toBeDefined();
		expect(map.get('str')).toEqual('string');
		map.remove('str');
		expect(map.get('str')).toBeUndefined();
		// object
		var obj = {};
		map.put(obj, 'string');
		expect(map.get(obj)).toBeDefined();
		expect(map.get(obj)).toEqual('string');
		map.remove(obj);
		expect(map.get(obj)).toBeUndefined();
		// array
		var arr = [];
		map.put(arr, 'string');
		expect(map.get(arr)).toBeDefined();
		expect(map.get(arr)).toEqual('string');
		map.remove(arr);
		expect(map.get(arr)).toBeUndefined();
		// element
		if (typeof document !== 'undefined') {
			var div = document.createElement('div');
			map.put(div, 'string');
			expect(map.get(div)).toBeDefined();
			expect(map.get(div)).toEqual('string');
			map.remove(div);
			expect(map.get(div)).toBeUndefined();
		}
	});

	it("hash dispose", function() {
		var obj = {};
		var arr = [];
		map.put(1, 'string');
		map.put('str', 'string');
		map.put(obj, 'string');
		map.put(arr, 'string');
		map.dispose();
		expect(map.get(1)).toBeUndefined();
		expect(map.get('str')).toBeUndefined();
		expect(map.get(obj)).toBeUndefined();
		expect(map.get(arr)).toBeUndefined();
	});

	it("hash data", function() {
		var obj = {blah:1};
		var arr = [];
		map.put(1, 'string');
		map.put('str', 'string');
		map.put(obj, 'string');
		map.put(arr, 'string');
		if (typeof document !== 'undefined') {
			var div = document.createElement('div');
			map.put(div, 'string');
		}
		var data = map.getData();
		var clone = {};
		var count = 0;
		for (var k in data) {
			expect(typeof k).toEqual('string');
			clone[k] = data[k];
			count++;
		}
		expect(clone).toEqual(data);
		expect(count).toEqual(5);
	});

});
