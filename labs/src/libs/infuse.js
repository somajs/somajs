class Injector {
    constructor() {
        console.log('Injector instantiated');
    }
    mapValue(name, value) {
        console.log('map value', name, value);
    }
}

export {Injector};
