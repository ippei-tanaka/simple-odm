import co from 'co';
import _Model from './model';

class ModelBuilder {

    static build ({operator, driver, schema, utils})
    {
        const Model = _Model.bind(_Model, {operator, driver, schema, utils});
        Model.prototype = Object.create(_Model.prototype);
        Model.prototype.constructor = Model;

        for (let key of Object.getOwnPropertyNames(_Model))
        {
            if (typeof _Model[key] === "function")
            {
                Model[key] = _Model[key].bind(_Model, {operator, driver, schema, utils});
            }
        }

        return Object.freeze(Model);
    }

}

export default Object.freeze(ModelBuilder);