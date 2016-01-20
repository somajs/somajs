import {Injector} from './libs/infuse';

class Application {
    constructor() {
        const injector = new Injector();
        console.log('constructor app', injector);
        injector.mapValue('something', {});
        console.log('mapping', injector.getValue('something'));
    }
}

export {Application};
