import co from 'co';
import { SimpleOdmError } from './errors';
import Immutable from 'immutable';

const stores = new WeakMap();

const isObject = a => typeof a === 'object' && a !== null;

class Store {

    /**
     * @param data {object}
     */
    constructor (data)
    {
        stores.set(this, Immutable.List());

        Object.freeze(this);

        if (data !== undefined)
        {
            this.set(data);
        }
    }

    getFirst ()
    {
        return stores.get(this).first().toJS();
    }

    get ()
    {
        return stores.get(this).last().toJS();
    }

    set (data)
    {
        if (!isObject(data))
        {
            throw new SimpleOdmError("The argument has to be an object");
        }

        const store = stores.get(this);
        stores.set(this, store.push(Immutable.fromJS(data)));
    }

    add (data)
    {
        if (!isObject(data))
        {
            throw new SimpleOdmError("The argument has to be an object");
        }

        const store = stores.get(this);
        const newData = store.last().merge(Immutable.fromJS(data));
        stores.set(this, store.push(newData));
    }

    destroy ()
    {
        delete stores.delete(this);
    }

    get isUpdated ()
    {
        return stores.get(this).size > 1;
    }

    get isEmpty ()
    {
        const store = stores.get(this);
        return store.last().filter((v) => v.size > 0).size === 0;
    }

}

export default Object.freeze(Store);